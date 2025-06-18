import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const TESTRAIL_URL = process.env.TESTRAIL_URL;
const TESTRAIL_USERNAME = process.env.TESTRAIL_USERNAME;
const TESTRAIL_API_KEY = process.env.TESTRAIL_API_KEY;
const TESTRAIL_PROJECT_ID = process.env.TESTRAIL_PROJECT_ID;
const TESTRAIL_SECTION_ID = process.env.TESTRAIL_SECTION_ID;
const JUNIT_REPORT_PATH = "./test-results/junit-report.xml";
const TEST_STATUS = { PASSED: 1, FAILED: 5 };

async function parseJUnitResults(junitXml) {
  const testTitles = new Map();
  const matches = [...junitXml.matchAll(/<testcase name="(.*?)".*?>(.*?)<\/testcase>/gs)];

  for (const match of matches) {
    const testName = match[1];
    const testBody = match[2];

    if (testBody.includes("<skipped")) {
      console.log(`Skipping test "${testName}"`);
      continue;
    }

    const hasFailure = testBody.includes("<failure");
    const status = hasFailure ? "FAILED" : "PASSED";
    // Extracting error message from junit XML or json report(recommended) could be done here
    // For simplicity, we are using a generic message
    const errorMessage = hasFailure
      ? "View detailed error in Playwright report."
      : "Test passed successfully.";

    const caseIds = [...testName.matchAll(/C(\d+)/g)].map(m => m[1]);

    let screenshotPath = null;
    const attachmentMatches = [...testBody.matchAll(/\[\[ATTACHMENT\|(.*?)\]\]/g)];
    for (const att of attachmentMatches) {
     const attPath = att[1];
      if (attPath.endsWith(".png")) {
        screenshotPath = path.join("./test-results", attPath);
        break;
      }
  }
    testTitles.set(testName, { status, errorMessage, caseIds, screenshotPath });
  }
  console.log("Parsed test cases:", testTitles);
  return testTitles;
}


async function createNewTestCase(testTitle) {
  console.log(`Creating new Test Case for "${testTitle}"`);
  const response = await axios.post(
    `${TESTRAIL_URL}/index.php?/api/v2/add_case/${TESTRAIL_SECTION_ID}`,
    {
      title: testTitle,
      type_id: 1,
      priority_id: 2,
    },
    {
      auth: { username: TESTRAIL_USERNAME, password: TESTRAIL_API_KEY },
    }
  );
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Slow down for TestRail API
  return response.data.id;
}

async function createTestRun(caseIds) {
  console.log(`Creating new Test Run with caseIds: ${caseIds.join(", ")}`);
  const now = new Date();
  const formattedTime = now.toISOString().slice(0, 16).replace("T", " ");
  const response = await axios.post(
    `${TESTRAIL_URL}/index.php?/api/v2/add_run/${TESTRAIL_PROJECT_ID}`,
    {
      name: `Automated Test Run - ${formattedTime}`,
      include_all: false,
      case_ids: caseIds,
    },
    {
      auth: { username: TESTRAIL_USERNAME, password: TESTRAIL_API_KEY },
    }
  );
  console.log(`New TestRail Run Created: ${response.data.id}`);
  return response.data.id;
}

async function uploadScreenshot(resultId, screenshotPath) {
  if (!screenshotPath || !fs.existsSync(screenshotPath)) {
    console.warn(`Screenshot not found: ${screenshotPath}`);
    return;
  }
  try {
    const formData = new FormData();
    formData.append("attachment", fs.createReadStream(screenshotPath));
    await axios.post(
      `${TESTRAIL_URL}/index.php?/api/v2/add_attachment_to_result/${resultId}`,
      formData,
      {
        headers: formData.getHeaders(),
        auth: { username: TESTRAIL_USERNAME, password: TESTRAIL_API_KEY },
      }
    );
    console.log(`Screenshot uploaded for result ${resultId}`);
  } catch (error) {
    console.error(`Failed to upload screenshot for result ${resultId}:`, error.response?.data || error.message);
  }
}
async function sendTestResults(runId, caseIdMapping, testTitles) {
  for (const [testTitle, { status, errorMessage, screenshotPath }] of testTitles.entries()) {
    const caseIds = caseIdMapping.get(testTitle);
    if (!caseIds || caseIds.length === 0) {
      console.error(`No case IDs mapped for "${testTitle}"`);
      continue;
    }

    for (const caseId of caseIds) {
      const comment = `Automated test result: ${status}.\n\n` +
        (status === "FAILED"
          ? `Error:\n${errorMessage}\n`
          : `${errorMessage}\n`);

      const response = await axios.post(
        `${TESTRAIL_URL}/index.php?/api/v2/add_result_for_case/${runId}/${caseId}`,
        {
          status_id: TEST_STATUS[status],
          comment,
        },
        {
          auth: { username: TESTRAIL_USERNAME, password: TESTRAIL_API_KEY },
        }
      );

      const resultId = response.data.id;
      console.log(`Reported result for C${caseId}: result ID ${resultId}`);

      if (status === "FAILED") {
        await uploadScreenshot(resultId, screenshotPath);
      }
    }
  }
}

(async () => {
  const junitXml = fs.readFileSync(JUNIT_REPORT_PATH, "utf-8");
  const testTitles = await parseJUnitResults(junitXml);

  const caseIdMapping = new Map();
  const createdCaseIds = [];

  async function createAndMapNewCase(testTitle) {
    const newCaseId = await createNewTestCase(testTitle);
    if (newCaseId) {
      caseIdMapping.set(testTitle, [newCaseId]); // store as array for consistency
      createdCaseIds.push(newCaseId);
      console.log(`Created new case for "${testTitle}" → C${newCaseId}`);
    }
  }

  for (const [testTitle, { caseIds }] of testTitles.entries()) {
    if (caseIds && caseIds.length > 0) {
      caseIdMapping.set(testTitle, caseIds); // map all case IDs
      for (const caseId of caseIds) {
        createdCaseIds.push(caseId); //  push each one for run creation
        console.log(`Linked "${testTitle}" to existing case C${caseId}`);
      }
    } else {
      await createAndMapNewCase(testTitle);
    }
  }

  // Deduplicate before run creation
  const uniqueCaseIds = [...new Set(createdCaseIds)];

  let runId;
  try {
    runId = await createTestRun(uniqueCaseIds);
    fs.writeFileSync("testrail_run_id.txt", runId.toString(), "utf-8");
  } catch (error) {
    console.error("Failed to create Test Run in TestRail:", error.response?.data || error.message);
    process.exit(1); // exit cleanly
  }

  await sendTestResults(runId, caseIdMapping, testTitles);
})();