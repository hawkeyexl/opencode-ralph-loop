#!/usr/bin/env bash
# Initialize Ralph Loop state file
# Usage: init-ralph-loop.sh "task description" [max_iterations]

set -euo pipefail

TASK="${1:-}"
MAX_ITERATIONS="${2:-100}"
PROMISE="${3:-}"

if [[ -z "$TASK" ]]; then
  echo "Error: No task provided" >&2
  exit 1
fi

# Create .opencode directory if needed
mkdir -p .opencode

# Create state file
cat > .opencode/ralph-loop.state.json << EOF
{
  "active": true,
  "iteration": 1,
  "maxIterations": $MAX_ITERATIONS,
  "startedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "originalTask": $(echo "$TASK" | jq -Rs .),
  "completionPromise": $(if [[ -n "$PROMISE" ]]; then echo "$PROMISE" | jq -Rs .; else echo null; fi),
  "promiseEstablished": $(if [[ -n "$PROMISE" ]]; then echo true; else echo false; fi),
  "lastCheckedAt": null
}
EOF

echo "Ralph Loop initialized!"
echo "Task: $TASK"
echo "Max iterations: $(if [[ $MAX_ITERATIONS -gt 0 ]]; then echo $MAX_ITERATIONS; else echo 'unlimited'; fi) (default: 100)"
echo ""
echo "Tools available:"
echo "  ralph-init      - Initialize the loop (already done)"
echo "  ralph-promise   - Set the completion promise"
echo "  ralph-complete  - Signal completion status"
echo "  ralph-status    - Check loop status"
echo "  ralph-cancel    - Cancel the loop"

if [[ -n "$PROMISE" ]]; then
  echo "Completion promise set: $PROMISE"
  echo "The loop will not ask for confirmation; it will work autonomously toward this promise."
fi
