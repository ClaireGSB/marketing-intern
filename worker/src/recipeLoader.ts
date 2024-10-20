// src/recipeLoader.ts

// this file will load all the recipes from the recipes directory
// and return an object with the recipe name as the key and the recipe object as the value

import fs from 'fs';
import path from 'path';
import type { Recipe } from './recipeTypes';
import twitter_post from './recipes/twitter_post';
import blog_outline from './recipes/blog_outline';
import linkedin_post from './recipes/linkedin_post';
import blog_post from './recipes/blog_post';
// Add other recipes here

const recipeMap: { [key: string]: Recipe<any, any, any> } = {
  'twitter_post': twitter_post,
  'blog_outline': blog_outline,
  'linkedin_post': linkedin_post,
  'blog_post': blog_post,
  // Add other recipes here
};

export async function loadRecipeByName(recipeName: string): Promise<Recipe<any, any, any>> {
  console.log('Loading recipe for:', recipeName);
  const recipeModule = recipeMap[recipeName];
  if (!recipeModule) {
    throw new Error(`Recipe not found: ${recipeName}`);
  }
  console.log('Loaded recipe');
  return recipeModule;
}