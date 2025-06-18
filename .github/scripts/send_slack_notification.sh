 #!/bin/bash
# Escape newlines and quotes in the test names
escaped_failed_tests=$(echo "$FAILED_TEST_NAMES" | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/"/\\"/g')

curl -X POST -H 'Content-type: application/json' --data "{
  \"text\": \"🚨 *Playwright Smoke Test Failure (Prod)*:\\n
  ✅ Passed: $PASSED / $TOTAL \\n
  ❌ Failed: $FAILED / $TOTAL \\n
  🧪 Failed tests:\\n$escaped_failed_tests\\n
  🔗 *Job Console:* <$GITHUB_RUN_URL|View logs & Playwright report in Artifacts>\"
}" "$SLACK_WEBHOOK_URL"