
// index.ts

import { recipeExecutor } from "./src/recipeExecutor";
import { FileService } from "./src/fileService";
import { dataAccess } from './src/dataAccess';
import path from 'path';
import { loadRecipeByName } from "./src/recipeLoader";

// async function executeAndSaveRecipe(
//   executor: recipeExecutor,
//   fileService: FileService,
//   recipe: any,
//   userID: number,
//   userInput: any,
//   contentType: string,
//   contentSubType: string
// ) {

//   // Fetch the settings for project Subtype asynchronously from the "database"
//   // const subtypeSettingsPromise = dataAccess.fetchSettingsBySubtype(userID, contentSubType);

//   const result = await executor.executeRecipe(recipe, userID, userInput.config, recipe.outputTypes, subtypeSettingsPromise);
//   console.log(`${recipe.contentType} Content:`, result);

//   // Save the step reports to the 'trace' directory
//   // const stepReports = executor.getAllStepReports();
//   // const reportFileName = `${recipe.contentType.toLowerCase().replace(' ', '_')}_report_${new Date().toISOString().replace(/:/g, '')}.json`;
//   // const reportPath = await fileService.saveJsonFile(reportFileName, stepReports);
//   // console.log(`${recipe.contentType} execution report saved to: ${reportPath}`);

//   return result;
// }

// async function main() {
//   const baseDir = path.join(__dirname, '..');
//   const executor = new recipeExecutor({}, {});
//   const fileService = new FileService(baseDir);

//   const { userInput, recipe, contentType, contentSubType, userID } = await getUserInputAndRecipe();

//   // Execute the selected recipe
//   const result = await executeAndSaveRecipe(executor, fileService, recipe, userID, userInput, contentType, contentSubType);

//   // Handle specific post-processing for blog posts
//   // if (recipe.name === "Blog Post" && 'formattedPost' in result && result.formattedPost) {
//   //   const fileName = `blog_post_${new Date().toISOString().replace(/:/g, '')}.md`;
//   //   const savedPath = await fileService.saveMarkdownFile(fileName, result.formattedPost);
//   //   console.log(`Blog post saved to: ${savedPath}`);
//   // }
// }

export async function executeRecipe(jobData: any) {
  // const baseDir = path.join(__dirname, '..');
  const executor = new recipeExecutor({}, {});
  // const fileService = new FileService(baseDir);

  console.log('executeRecipe Starting in Index. Job data:', jobData);

  // get recipe by name
  const recipe = await loadRecipeByName(jobData.recipe_name);
  console.log('Index got recipe');

  // Execute the selected recipe
  await executor.executeRecipe(
    recipe,
    jobData.content_output_id,
    jobData.user_id,
    jobData.org_id,
    jobData.user_settings,
    jobData.subtype_settings);

}
