// import { dataAccess } from './dataAccess';
// import type { ProjectSettings } from './recipeTypes';

// export async function getOutlineContent(outlineInput: string | number): Promise<string> {
//   console.log('getOutlineContent:', outlineInput);
//   if (typeof outlineInput === 'string') {
//     console.log('outlineInput as string:', outlineInput);
//     return outlineInput;
//   } else {
//     console.log('outlineInput as number:', outlineInput);
//     const outlineOutput = await dataAccess.getContentOutputById(outlineInput);
//     if (!outlineOutput) {
//       throw new Error(`Invalid outline ID: ${outlineInput}`);
//     }
//     console.log('outlineOutput:', outlineOutput);
//     return outlineOutput.content;
//   }
// }

// export async function getParentOutlineId(config: ProjectSettings): Promise<number | null> {
//   console.log('getParentOutlineId:', config);
//   if (typeof config.outline_id === 'number') {
//     return config.outline_id;
//   }
//   return null;
// }
