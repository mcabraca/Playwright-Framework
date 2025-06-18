import fs from "fs/promises"; // Use the promises version of the fs module
import * as fs2 from "fs";
import * as readline from "readline";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { expect, Download } from "@playwright/test";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Reads JSON data from a file.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<any>} A promise that resolves to the parsed JSON data.
 */
export async function readJsonData(filePath: string): Promise<any> {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Handles file download and saves it in a default temporary directory.
 * @param {Download} download - The download object from Playwright.
 * @returns {Promise<string>} A promise that resolves to the path where the file was saved.
 */
export async function downloadAndSave(download: Download): Promise<string> {
  const suggestedFilename = download.suggestedFilename();
  const targetPath = path.join(process.cwd(), "downloads", suggestedFilename);
  await download.saveAs(targetPath);
  if (!fs2.existsSync(targetPath)) {
    throw new Error(`File was not saved to ${targetPath}`);
  }
  console.log(`File saved successfully: ${targetPath}`);
  return targetPath;
}

/**
 * Reads the expected headers from a CSV file.
 * @param {string} directory - The directory path to the CSV file that includes the expected headers.
 * @returns {Promise<string[]>} A promise that resolves to an array of expected headers.
 */
export async function getExpectedHeadersFromCSV(directory: string): Promise<string[]> {
  const filePath = path.resolve(__dirname, directory);
  const expectedHeaders = parse(fs2.readFileSync(filePath, "utf-8"))[0];
  return expectedHeaders;
}

/**
 * Validates the headers of a CSV file.
 * @param {string} downloadPath - The path to the downloaded CSV file.
 * @param {string[]} expectedHeaders - An array of expected headers.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the headers are valid.
 */
export async function validateCSVHeaders(
  downloadPath: string,
  expectedHeaders: string[],
): Promise<boolean> {
  let result = false;
  const fileStream = fs2.createReadStream(downloadPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Read the first line (headers)
  for await (const line of rl) {
    const headers = line.split(",").map((header) => header.trim().replace(/['"]+/g, ""));
    expect(headers).toEqual(expectedHeaders);
    result = true;
    break;
  }
  return result;
}

/**
 * Validates if a PDF file is not empty.
 * @param {string} filePath - The path to the PDF file.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the PDF file is valid and not empty.
 * @throws {Error} Throws an error if the PDF file is empty or invalid.
 */
export async function validatePdf(filePath: string): Promise<boolean> {
  const data = fs2.readFileSync(filePath);
  const pdfData = await pdfParse(data);

  if (pdfData.numpages > 0 && pdfData.text.trim().length > 0) {
    console.log("PDF file is valid and not empty.");
    return true;
  } else {
    throw new Error("PDF file is empty or invalid.");
  }
}

/**
 * Validates if a DOCX file is not empty.
 * @param {string} filePath - The path to the DOCX file.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the DOCX file is valid and not empty.
 */
export async function validateDocx(filePath: string): Promise<boolean> {
  const data = await mammoth.extractRawText({ path: filePath });
  if (data.value.trim().length > 0) {
    console.log("DOCX file is valid and not empty.");
    return true;
  } else {
    throw new Error("DOCX file is empty or invalid.");
  }
}

/**
 * Asserts that certain texts are present in a Word document.
 * @param {string} filePath - The path to the Word document.
 * @param {string[]} searchStrings - An array of strings to search for in the Word document.
 * @returns {Promise<void>} A promise that resolves when the assertion is complete.
 */
export async function assertStringsInWordDocument(
  filePath: string,
  searchStrings: string[],
): Promise<void> {
  try {
    const { value: textContent } = await mammoth.extractRawText({ path: filePath });
    for (const searchString of searchStrings) {
      const found = textContent.includes(searchString);
      expect.soft(found, `Expected to find "${searchString}" in the Word file.`).toBe(true);
      console.log(
        `The string "${searchString}" was ${found ? "found" : "not found"} in the Word file.`,
      );
    }
  } catch (error) {
    throw new Error("An error occurred while searching for strings in the Word file.");
  }
}

/**
 * Validates if a downloaded file exists and is not empty.
 * @param {string} filePath - The path to the downloaded file.
 * @param {string[]} [expectedHeaders] - Array of expected headers only for CSV validation.
 * @returns {Promise<void>} A promise that resolves when the validation is complete.
 */
export async function validateDownload(filePath: string, expectedHeaders?: string[]) {
  // Step 1: Check if file exists and is not empty
  if (!fs2.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const stats = fs2.statSync(filePath);
  if (stats.size === 0) {
    throw new Error(`File is empty: ${filePath}`);
  }
  // Step 2: Check file extension to determine type and validate content
  const ext = path.extname(filePath).toLowerCase();
  let validationResult = false;
  if (ext === ".pdf") {
    validationResult = await validatePdf(filePath);
  } else if (ext === ".docx") {
    validationResult = await validateDocx(filePath);
  } else if (ext === ".csv" && expectedHeaders) {
    validationResult = await validateCSVHeaders(filePath, expectedHeaders);
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
  expect(validationResult).toBe(true);
  const result = validationResult === true ? "File validation passed." : "File validation failed";
  console.log(result);
}
