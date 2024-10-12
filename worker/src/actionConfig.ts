import { contentTypes } from '../../shared/contentTypes';
import { actions } from '../../shared/actionTypes';

export function isActionAvailable(
  action: string,
  contentType: string
): boolean {
  const contentTypeConfig = contentTypes.find(ct => ct.name === contentType);
  if (!contentTypeConfig) return false;

  return contentTypeConfig.available_actions.includes(action);
}

export function getRequiredInputsForAction(action: string): string[] {
  return actions[action]?.requiredFields || [];
}

export function getOptionalInputsForAction(action: string): string[] {
  return actions[action]?.optionalFields || [];
}

export function areRequiredInputsPresent(action: string, projectSettings: Record<string, any>): boolean {
  const requiredFields = getRequiredInputsForAction(action);
  if (requiredFields.length === 0) {
    return true; // No required fields, so they're all present by default
  }

  return requiredFields.every(field => field in projectSettings && projectSettings[field] !== undefined);
}
