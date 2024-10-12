// src/fileService.ts

import fs from 'fs/promises';
import path from 'path';

export class FileService {
  private baseDir: string;
  private contentExamplesDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.contentExamplesDir = path.join(this.baseDir, 'contentExamples');
  }

  async saveMarkdownFile(fileName: string, content: string, subDir: string = 'output'): Promise<string> {
    return this.saveFile(fileName, content, subDir, 'md');
  }

  async saveJsonFile(fileName: string, data: any, subDir: string = 'trace'): Promise<string> {
    const jsonContent = JSON.stringify(data, null, 2);
    return this.saveFile(fileName, jsonContent, subDir, 'json');
  }

  async saveFile(fileName: string, content: string | Buffer, subDir: string, extension: string): Promise<string> {
    const fullDir = path.join(this.baseDir, subDir);

    // Ensure the directory exists
    await fs.mkdir(fullDir, { recursive: true });

    // Sanitize the filename and ensure it has the correct extension
    const sanitizedFileName = this.sanitizeFileName(fileName, extension);
    const fullPath = path.join(fullDir, sanitizedFileName);

    // Write the content to the file
    if (Buffer.isBuffer(content)) {
      await fs.writeFile(fullPath, content);
    } else {
      await fs.writeFile(fullPath, content, 'utf8');
    }

    console.log(`File saved successfully: ${fullPath}`);
    return fullPath;
  }

  private sanitizeFileName(fileName: string, extension: string): string {
    // Remove any characters that aren't alphanumeric, underscores, or hyphens
    let sanitized = fileName.replace(/[^a-z0-9_-]/gi, '_');

    // Ensure the filename ends with the correct extension
    if (!sanitized.toLowerCase().endsWith(`.${extension}`)) {
      sanitized += `.${extension}`;
    }

    return sanitized;
  }

  async concatenateContentExamples(files: string[]): Promise<string> {
    const contents = await Promise.all(
      files.map(async (file, index) => {
        const filePath = path.join(this.contentExamplesDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          return `Example ${index + 1}: ${content.trim()}`;
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
          return `Example ${index + 1}: [Error reading file]`;
        }
      })
    );

    return contents.join(' ');
  }
}
