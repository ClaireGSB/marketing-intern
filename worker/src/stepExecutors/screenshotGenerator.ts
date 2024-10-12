import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { FileService } from '../fileService';
import type { ScreenshotStepConfig, ProjectSettings, StepResponse, SubtypeSettings } from '../recipeTypes';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileService = new FileService(path.join(__dirname, '..', '..'));

async function getImageAsBase64(imagePath: string): Promise<string> {
  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = path.extname(imagePath) === '.svg' ? 'image/svg+xml' : 'image/png';
  return `data:${mimeType};base64,${base64Image}`;
}

async function replaceImagesWithBase64(htmlContent: string, projectRoot: string): Promise<string> {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  let processedHtml = htmlContent;

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const [fullMatch, srcPath] = match;
    // Adjust the path to account for the build directory
    const absolutePath = path.join(projectRoot, '..', srcPath);
    const base64Data = await getImageAsBase64(absolutePath);
    processedHtml = processedHtml.replace(srcPath, base64Data);
  }

  return processedHtml;
}

export async function executeScreenshotStep(
  stepConfig: ScreenshotStepConfig,
  content: Record<string, any>,
  recipeConfig: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse> {
  try {
    const { htmlFilePath, dataKey } = stepConfig;
    console.log('Executing screenshot step');
    console.log(`HTML file path: ${htmlFilePath}`);
    console.log('Data:', dataKey);

    // Get the data from the content object using the dataKey
    const data = content[dataKey];
    console.log('Data:', data);

    // Read the HTML template
    let htmlContent = await fs.readFile(htmlFilePath, 'utf-8');
    console.log('HTML content read');

    // Parse the data if it's a string (it might be JSON from the previous step)
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    console.log('Parsed data:', parsedData);

    // Replace placeholders in the template
    for (const [key, value] of Object.entries(parsedData)) {
      const stringValue = (() => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (value === null || value === undefined) return '';
        return JSON.stringify(value);
      })();

      htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), stringValue);
    }

    // Replace image paths with base64 data
    // Adjust the project root to account for the build directory
    const projectRoot = path.join(__dirname, '..', '..'); // This now points to ./build
    htmlContent = await replaceImagesWithBase64(htmlContent, projectRoot);

    // Take screenshot
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the content and wait for images to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.setViewport({ width: 375, height: 1000, deviceScaleFactor: 2 });

    // Get the bounding box of our container
    const element = await page.$('#screenshot-container');
    if (!element) {
      throw new Error('Screenshot container not found');
    }
    const boundingBox = await element.boundingBox();

    if (!boundingBox) {
      throw new Error('Unable to determine bounding box of screenshot container');
    }

    // Take the screenshot of just our container
    const screenshotBuffer = await element.screenshot({
      type: 'png',
      clip: {
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height
      }
    });

    await browser.close();

    // Convert Uint8Array to Buffer
    const buffer = Buffer.from(screenshotBuffer);

    // Save screenshot using FileService
    const fileName = `screenshot_${Date.now()}.png`;
    const filePath = await fileService.saveFile(fileName, buffer, 'screenshots', 'png');

    return {
      status: 'success',
      output: filePath,
      fullResponse: `Screenshot saved to ${filePath}`,
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
