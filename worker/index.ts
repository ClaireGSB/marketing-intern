
// index.ts

import { recipeExecutor } from "./src/recipeExecutor";
import { FileService } from "./src/fileService";
import { dataAccess } from './src/dataAccess';
import path from 'path';
import { loadRecipeByName } from "./src/recipeLoader";


export async function executeRecipe(jobData: any) {
  // const baseDir = path.join(__dirname, '..');
  const executor = new recipeExecutor(jobData.recipe_name, {});
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
