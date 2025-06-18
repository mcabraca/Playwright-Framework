# .github/scripts/parse_junit_results.sh

# Ensure JUnit XML exists
if [ ! -s ./test-results/junit-report.xml ]; then
  echo "JUnit XML is missing. Skipping parsing."
  echo "TOTAL=0" >> $GITHUB_ENV
  echo "PASSED=0" >> $GITHUB_ENV
  echo "FAILED=0" >> $GITHUB_ENV
  echo "FAILED_TEST_NAMES=" >> $GITHUB_ENV
  exit 0
fi
# Extract test counts
TOTAL_TESTS=$(xmllint --xpath 'string(count(//testsuite/testcase))' ./test-results/junit-report.xml)
PASSED_TESTS=$(xmllint --xpath 'string(count(//testsuite/testcase[not(failure) and not(error)]))' ./test-results/junit-report.xml)
FAILED_TESTS=$(xmllint --xpath 'string(count(//testsuite/testcase[failure or error]))' ./test-results/junit-report.xml)

# Extract failed test names
FAILED_TEST_NAMES=$(xmllint --xpath '//testsuite/testcase[failure or error]/@name' ./test-results/junit-report.xml 2>/dev/null \
| sed -E 's/name=//g' \
| tr -d '"' \
| tr '\n' ' ' \
| sed 's/  */ /g' \
| sed 's/&#x203A;/>/g' \
|| echo "")

# Print clean results
echo "Total Tests: $TOTAL_TESTS"
echo "Passed Tests: $PASSED_TESTS"
echo "Failed Tests: $FAILED_TESTS"

if [ -n "$FAILED_TEST_NAMES" ]; then
  echo "Failed Test Names: $FAILED_TEST_NAMES"
fi

# Store values in GitHub Actions environment variables
echo "TOTAL=$TOTAL_TESTS" >> $GITHUB_ENV
echo "PASSED=$PASSED_TESTS" >> $GITHUB_ENV
echo "FAILED=$FAILED_TESTS" >> $GITHUB_ENV
echo "FAILED_TEST_NAMES=$FAILED_TEST_NAMES" >> $GITHUB_ENV