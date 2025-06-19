import { test } from "../base/baseTest";

test("Fill form using simplified POM and data from fixture", async ({
  samplePage,
  testData,
}) => {
  await test.step("Navigate to the form page", async () => {
    await samplePage.goto();
  });

  await test.step("Fill in the form with test data", async () => {
    await samplePage.fillForm(
      testData.name,
      testData.email,
      testData.website,
      testData.experience,
      testData.comment
    );
  });

  await test.step("Submit the form", async () => {
    await samplePage.submitForm();
  });

  await test.step("Validate the submitted information", async () => {
    await samplePage.validateInformation(
      testData.name,
      testData.email,
      testData.website,
      testData.experience,
      testData.comment
    );
  });
});
