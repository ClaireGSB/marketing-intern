// src/recipeLoader.ts

// this file will load all the recipes from the recipes directory
// and return an object with the recipe name as the key and the recipe object as the value

import fs from 'fs';
import path from 'path';
import type { Recipe } from './recipeTypes';

// type RecipeIndex = {
//   [contentType: string]: {
//     [componentType: string]: Recipe<any, any, any>
//   }
// };

export function loadRecipes(): { [key: string]: Recipe<any, any, any> } {
  const recipesDir = path.join(__dirname, 'recipes');
  const recipeFiles = fs.readdirSync(recipesDir);

  const recipes: { [key: string]: Recipe<any, any, any> } = {};

  recipeFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const recipePath = path.join(recipesDir, file);
      const recipeModule = require(recipePath);

      // Assume each recipe file exports a default recipe object
      const recipe: Recipe<any, any, any> = recipeModule.default;

      if (recipe && recipe.contentType) {
        recipes[recipe.contentType] = recipe;
      }
    }
  });

  return recipes;
}

export function loadRecipeByName(recipeName: string): Recipe<any, any, any> {
  const recipePath = path.join(__dirname, 'recipes', `${recipeName}.ts`);
  const recipeModule = require(recipePath);

  return recipeModule.default;
}