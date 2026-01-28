import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "fs"
import { join, dirname } from "path"

/**
 * Ralph Loop Plugin for OpenCode
 * 
 * Adapts the Ralph Wiggum technique (continuous self-referential AI loops) to OpenCode.
 * Uses session.idle events to intercept before prompting the user, checking if the
 * task's completion promise has been fulfilled.
 * 
 * The core workflow:
 * 1. User runs /ralph-loop with a task description
 * 2. Plugin asks the agent to articulate a completion promise
 * 3. When session goes idle (agent would normally prompt user), plugin intercepts
 * 4. Plugin injects a completion check prompt
 * 5. If incomplete, agent continues working; if complete, loop ends
 */

interface RalphLoopState {
  active: boolean
  iteration: number
  maxIterations: number
  startedAt: string
  originalTask: string
  completionPromise: string | null  // Agent-articulated completion criteria
  promiseEstablished: boolean       // Whether the agent has articulated the promise
  lastCheckedAt: string | null
}

const STATE_FILE_NAME = "ralph-loop.state.json"

function getStateFilePath(directory: string): string {
  return join(directory, ".opencode", STATE_FILE_NAME)
}

function loadState(directory: string): RalphLoopState | null {
  const statePath = getStateFilePath(directory)
  if (!existsSync(statePath)) {
    return null
  }
  try {
    const content = readFileSync(statePath, "utf-8")
    return JSON.parse(content) as RalphLoopState
  } catch {
    return null
  }
}

function saveState(directory: string, state: RalphLoopState): void {
  const statePath = getStateFilePath(directory)
  const stateDir = dirname(statePath)
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true })
  }
  writeFileSync(statePath, JSON.stringify(state, null, 2))
}

function deleteState(directory: string): boolean {
  const statePath = getStateFilePath(directory)
  if (existsSync(statePath)) {
    unlinkSync(statePath)
    return true
  }
  return false
}

/**
 * Guidance prompt for checking if the task is complete before prompting user
 */
function getCompletionCheckGuidance(state: RalphLoopState): string {
  const iterationInfo = state.maxIterations > 0
    ? `${state.iteration}/${state.maxIterations}`
    : `${state.iteration} (unlimited)`

  return `
═══════════════════════════════════════════════════════════════════════════════
RALPH LOOP - COMPLETION CHECK (Iteration ${iterationInfo})
═══════════════════════════════════════════════════════════════════════════════

STOP! Before prompting the user, you must check if the task is complete.

Original Task:
${state.originalTask}

Your Completion Promise:
${state.completionPromise}

EVALUATE NOW: Is your completion promise fulfilled?

If YES (promise is genuinely TRUE):
  Output: <ralph-complete>true</ralph-complete>
  Then provide a summary of what was accomplished.

If NO (promise is NOT yet TRUE):
  Output: <ralph-complete>false</ralph-complete>
  Then CONTINUE WORKING on the task. Do NOT prompt the user for input.
  
  Ask yourself:
  - What remains to be done?
  - What is blocking progress?
  - What should I try next?
  
  Then take action to move toward completion.

CRITICAL RULES:
  - Do NOT output <ralph-complete>true</ralph-complete> unless the promise is GENUINELY fulfilled
  - Do NOT prompt the user for input if the task is incomplete
  - Do NOT give up - iterate until completion or max iterations reached
  - Review your previous work in files and git history
  - Self-correct based on test results, errors, or failures
  - Make incremental progress toward the completion promise

${state.maxIterations > 0 && state.iteration >= state.maxIterations ? `
WARNING: This is your FINAL iteration. If the task is incomplete,
document what was accomplished and what remains to be done.
` : ""}
═══════════════════════════════════════════════════════════════════════════════
`
}

/**
 * Ralph Loop Plugin - iterative self-referential development loops
 */
export const RalphLoopPlugin: Plugin = async (ctx) => {
  const { directory, client } = ctx

  return {
    /**
     * Custom tools for managing Ralph Loop state
     */
    tool: {
      /**
       * Initialize a new Ralph Loop
       */
      "ralph-init": tool({
        description: "Initialize a new Ralph Loop for iterative task completion. Call this when starting /ralph-loop.",
        args: {
          task: tool.schema.string().describe("The task description to work on"),
          maxIterations: tool.schema.number().optional().describe("Maximum iterations before stopping (default: 100, 0 = unlimited)"),
        },
        async execute(args) {
          const existingState = loadState(directory)
          if (existingState?.active) {
            return "Error: A Ralph Loop is already active. Use /cancel-ralph to stop it first."
          }

          const state: RalphLoopState = {
            active: true,
            iteration: 1,
            maxIterations: args.maxIterations ?? 100,
            startedAt: new Date().toISOString(),
            originalTask: args.task,
            completionPromise: null,
            promiseEstablished: false,
            lastCheckedAt: null,
          }

          saveState(directory, state)

          const maxIter = args.maxIterations ?? 100
          return `Ralph Loop initialized!
Task: ${args.task}
Max iterations: ${maxIter > 0 ? maxIter : 'unlimited'}

Completion promise: ${state.completionPromise ?? 'Not yet established. The loop will not ask for confirmation; provide a promise with the ralph-promise tool or pass it as the optional third argument when initializing.'}`
        },
      }),

      /**
       * Set the completion promise for the active loop
       */
      "ralph-promise": tool({
        description: "Set the completion promise for the active Ralph Loop. Call this after articulating your promise.",
        args: {
          promise: tool.schema.string().describe("The completion promise - a clear, verifiable statement that will be TRUE when the task is complete"),
        },
        async execute(args) {
          const state = loadState(directory)
          if (!state?.active) {
            return "Error: No active Ralph Loop. Start one with /ralph-loop."
          }

          state.completionPromise = args.promise
          state.promiseEstablished = true
          saveState(directory, state)

          // Do not prompt for confirmation going forward. The agent will act on the task.
          return `Completion promise established: ${args.promise}

Work will continue autonomously. When you check completion, use the ralph-complete tool or output <ralph-complete>true</ralph-complete>.`
        },
      }),

      /**
       * Signal completion status
       */
      "ralph-complete": tool({
        description: "Signal whether the Ralph Loop task is complete. Call this when checking completion.",
        args: {
          complete: tool.schema.boolean().describe("true if the completion promise is genuinely fulfilled, false to continue working"),
          summary: tool.schema.string().optional().describe("Summary of what was done (required if complete=true)"),
        },
        async execute(args) {
          const state = loadState(directory)
          if (!state?.active) {
            return "Error: No active Ralph Loop."
          }

          if (args.complete) {
            deleteState(directory)
            return `Ralph Loop completed after ${state.iteration} iterations.

Summary: ${args.summary ?? 'Task completed successfully.'}`
          } else {
            return `Task incomplete. Continue working toward the completion promise:
"${state.completionPromise}"

Review what remains and take the next step.`
          }
        },
      }),

      /**
       * Get current Ralph Loop status
       */
      "ralph-status": tool({
        description: "Get the current status of the Ralph Loop",
        args: {},
        async execute() {
          const state = loadState(directory)
          if (!state) {
            return "No active Ralph Loop."
          }

          return `Ralph Loop Status:
- Active: ${state.active}
- Iteration: ${state.iteration}${state.maxIterations > 0 ? `/${state.maxIterations}` : ' (unlimited)'}
- Started: ${state.startedAt}
- Task: ${state.originalTask}
- Promise: ${state.completionPromise ?? 'Not yet established'}
- Promise established: ${state.promiseEstablished}`
        },
      }),

      /**
       * Cancel the active Ralph Loop
       */
      "ralph-cancel": tool({
        description: "Cancel the active Ralph Loop",
        args: {},
        async execute() {
          const state = loadState(directory)
          if (!state?.active) {
            return "No active Ralph Loop to cancel."
          }

          const iteration = state.iteration
          deleteState(directory)
          return `Ralph Loop cancelled at iteration ${iteration}.`
        },
      }),
    },

    /**
     * Handle session idle events - this is where we intercept before prompting the user
     * 
     * When the session goes idle (agent has finished responding and would normally
     * wait for user input), we check if there's an active ralph loop. If so, we
     * inject a completion check prompt to keep the agent working.
     */
    event: async ({ event }) => {
      // Only handle session.idle events
      if (event.type !== "session.idle") {
        return
      }

      const state = loadState(directory)
      
      // No active loop - allow normal flow
      if (!state || !state.active) {
        return
      }

      // Check if max iterations reached
      if (state.maxIterations > 0 && state.iteration >= state.maxIterations) {
        await client.app.log({
          service: "ralph-loop",
          level: "info",
          message: `Max iterations (${state.maxIterations}) reached. Stopping loop.`,
        })
        deleteState(directory)
        return
      }

      // If promise not yet established, don't intercept (let agent articulate it first)
      // If the promise is present but not established, treat it as established so we don't ask for confirmation
      if (!state.promiseEstablished && !state.completionPromise) {
        return
      }

      // Increment iteration
      state.iteration++
      state.lastCheckedAt = new Date().toISOString()
      saveState(directory, state)

      await client.app.log({
        service: "ralph-loop",
        level: "info", 
        message: `Ralph loop iteration ${state.iteration} - checking completion`,
      })

      // Return guidance that will be injected into the session
      // This effectively "blocks" the user prompt by giving the agent work to do
      return {
        inject: getCompletionCheckGuidance(state),
      }
    },

    /**
     * Monitor message updates to detect promise establishment and completion signals
     */
    "message.updated": async ({ message }) => {
      const state = loadState(directory)
      if (!state || !state.active) {
        return
      }

      // Extract text content from message
      const textContent = message.parts
        ?.filter((part: any) => part.type === "text")
        ?.map((part: any) => part.text)
        ?.join("\n") || ""

      // Check for promise establishment
      if (!state.promiseEstablished) {
        const promiseMatch = textContent.match(/<ralph-promise>([\s\S]*?)<\/ralph-promise>/)
        if (promiseMatch) {
          state.completionPromise = promiseMatch[1].trim()
          state.promiseEstablished = true
          saveState(directory, state)
          
          await client.app.log({
            service: "ralph-loop",
            level: "info",
            message: `Completion promise established: ${state.completionPromise}`,
          })
        }
      }

      // Check for completion signal
      const completeMatch = textContent.match(/<ralph-complete>(true|false)<\/ralph-complete>/)
      if (completeMatch) {
        const isComplete = completeMatch[1] === "true"
        
        if (isComplete) {
          await client.app.log({
            service: "ralph-loop",
            level: "info",
            message: `Task completed after ${state.iteration} iterations`,
          })
          deleteState(directory)
        } else {
          await client.app.log({
            service: "ralph-loop",
            level: "info",
            message: `Task incomplete - continuing iteration ${state.iteration}`,
          })
        }
      }
    },
  }
}

// Note: loadState, saveState, deleteState, getStateFilePath are internal functions
// If commands need direct access, they should import from this file directly
// but NOT as named exports (OpenCode's plugin loader may try to call them)
