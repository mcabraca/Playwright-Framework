import { test } from "../base/baseTest";

test("Fill form using simplified POM and data from fixture", async ({ samplePage, testData }) => {
  await samplePage.goto();

  await samplePage.fillForm(
    testData.name,
    testData.email,
    testData.website,
    testData.experience,
    testData.comment
  );
});
