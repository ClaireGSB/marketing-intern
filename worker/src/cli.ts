// src/cli.ts

import readline from 'readline';
import { getPendingValidations, getPendingSteps, validateSingleStep, checkAndUpdateContentOutputStatus } from './validationHandler';
import { ContentOutput, StepOutput } from '@shared/backendTypes';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function handlePendingValidations() {
  try {
    const pendingOutputs = await getPendingValidations();

    if (pendingOutputs.length === 0) {
      console.log("No content outputs pending validation.");
      return;
    }

    const selectedOutput = await selectContentOutput(pendingOutputs);
    if (!selectedOutput) return;

    const pendingSteps = await getPendingSteps(selectedOutput.id);
    await processSteps(selectedOutput.id, pendingSteps);

    await checkAndUpdateContentOutputStatus(selectedOutput.id);
    console.log("Validation complete.");

  } catch (error) {
    console.error("Error handling pending validations:", error);
  } finally {
    rl.close();
  }
}

async function selectContentOutput(pendingOutputs: ContentOutput[]): Promise<ContentOutput | null> {
  console.log("Content outputs pending validation:");
  pendingOutputs.forEach((output, index) => {
    console.log(`${index + 1}. ID: ${output.id}, Type ID: ${output.content_type_id}, Created: ${output.created_at}`);
  });

  const selection = await askQuestion("Enter the number of the content output you want to validate (or 'q' to quit): ");

  if (selection.toLowerCase() === 'q') {
    return null;
  }

  const selectedIndex = parseInt(selection) - 1;
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= pendingOutputs.length) {
    console.log("Invalid selection. Please try again.");
    return null;
  }

  return pendingOutputs[selectedIndex];
}

async function processSteps(contentOutputId: number, pendingSteps: StepOutput[]): Promise<void> {
  for (const step of pendingSteps) {
    console.log(`\nStep: ${step.step_name}`);

    if (typeof step.step_output === 'object' && step.step_output !== null && 'options' in step.step_output) {
      const chosenOption = await processStepWithOptions(step);
      if (chosenOption !== null) {
        await validateSingleStep(step.id, chosenOption);
      }
    } else {
      console.log("This step doesn't have options. Skipping.");
    }
  }
}

async function processStepWithOptions(step: StepOutput): Promise<string | null> {
  if (typeof step.step_output !== 'object' || step.step_output === null || !('options' in step.step_output)) {
    console.log("This step doesn't have valid options. Skipping.");
    return null;
  }

  const options = step.step_output.options;
  if (typeof options !== 'object' || options === null) {
    console.log("Invalid options format. Skipping.");
    return null;
  }

  console.log("Options:");
  Object.entries(options).forEach(([key, value]) => {
    console.log(`${key}. ${value}`);
  });

  const action = await askQuestion("Enter the number of your choice, or 's' to skip: ");

  if (action === 's') {
    console.log("Skipping this step.");
    return null;
  } else if (
    typeof action === 'string' &&
    action in options &&
    typeof options[action as keyof typeof options] === 'string'
  ) {
    return options[action as keyof typeof options];
  } else {
    console.log("Invalid option. Skipping this step.");
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === 'validate') {
    await handlePendingValidations();
  } else {
    console.log("Unknown command. Use 'validate' to handle pending validations.");
  }
}

main().catch(console.error);
