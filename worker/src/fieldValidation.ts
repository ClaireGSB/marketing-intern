// worker/src/fieldValidation.ts

import { contentTypes } from '../../types/contentTypes';
import { actions } from '../../types/actionTypes';

export function isActionAvailable(
  action: string,
  contentTypeID: number
): boolean {
  const contentTypeConfig = contentTypes.find(ct => ct.id === contentTypeID);
  if (!contentTypeConfig) return false;

  return contentTypeConfig.available_actions.includes(action);
}

function getRequiredInputsForAction(action: string): string[] {
  return actions[action]?.requiredFields || [];
}

function getRequiredInputsForContentType(contentTypeID: number): string[] {
  const contentTypeConfig = contentTypes.find(ct => ct.id === contentTypeID);
  return contentTypeConfig?.required_fields || [];
}

function getOptionalInputsForAction(action: string): string[] {
  return actions[action]?.optionalFields || [];
}

function areRequiredActionInputsPresent(action: string, projectSettings: Record<string, any>): boolean {
  const requiredFields = getRequiredInputsForAction(action);
  if (requiredFields.length === 0) {
    return true; // No required fields, so they're all present by default
  }

  return requiredFields.every(field => field in projectSettings && projectSettings[field] !== undefined);
}

function areRequiredContentTypeInputsPresent(contentTypeID: number, projectSettings: Record<string, any>): boolean {
  const requiredFields = getRequiredInputsForContentType(contentTypeID);
  if (requiredFields.length === 0) {
    return true; // No required fields, so they're all present by default
  }

  return requiredFields.every(field => field in projectSettings && projectSettings[field] !== undefined);
}

export function areAllRequiredInputsPresent(
  contentTypeID: number,
  action: string,
  projectSettings: Record<string, any>
): boolean {
  return areRequiredContentTypeInputsPresent(contentTypeID, projectSettings) && areRequiredActionInputsPresent(action, projectSettings);
}

export function getAllRequiredInputs(
  contentTypeID: number,
  action: string
): string[] {
  return [
    ...getRequiredInputsForContentType(contentTypeID),
    ...getRequiredInputsForAction(action),
  ];
} 