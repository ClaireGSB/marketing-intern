<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" xl="8" class="d-flex flex-column relative-container pa-0">
        <h1 class="text-h4 px-4 py-10">{{ pageTitle }}</h1>
        <v-container fluid class="flex-grow-1 overflow-y-auto pb-16">
          <v-tabs v-model="tab" grow color="primary" class="mb-10">
            <v-tab value="setup" text="Project setup"></v-tab>
            <v-tab value="validation" :disabled="!hasValidations" text="Validation"></v-tab>
            <v-tab value="final" :disabled="!hasFinalContent" text="Final Content"></v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab" class="pb-6">
            <v-tabs-window-item value="setup">
              <ContentProjectSetup 
                @generate="generateContent" 
                :initialData="contentOutput" 
                :isEditable="isProjectSetupEditable"
              />
            </v-tabs-window-item>

            <v-tabs-window-item v-if="validations" value="validation">
              <ContentValidation 
                :contentOutputID="contentOutputID"
                @confirm="handleConfirmation"
                @regenerate="handleRegeneration"
              />
            </v-tabs-window-item>

            <v-tabs-window-item v-if="hasFinalContent" value="final">
              <FinalContent :contentOutputID="contentOutputID" />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-container>
      </v-col>
    </v-row>

    <v-dialog v-model="isLoading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Generating content...
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { Validations, GeneratedContentResponse, FinalContentItem } from '~/types/frontendTypes';

const props = defineProps<{
  id?: string
}>();

const userStore = useUserDataStore();

const tab = ref('setup');
const isLoading = ref(false);
const validations = ref<Validations[] | null>(null);
// const finalContent = ref<FinalContentItem[] | null>(null);
const contentOutputID = ref('');
const contentOutput = ref<ContentOutput | null>(null);

const pageTitle = computed(() => {
  if (!props.id) return 'Create Content';
  if (contentOutput.value?.status === 'completed') return 'View Content';
  return 'Edit Content';
});


const hasValidations = computed(() => !!validations.value);
const hasFinalContent = computed(() => !!contentOutputID.value && contentOutput.value?.status === 'completed');
const isProjectSetupEditable = computed(() => !hasValidations.value);
const areValidationsEditable = computed(() => !contentOutput.value || contentOutput.value.status !== 'completed');

watch(() => props.id, loadExistingContent, { immediate: true });

async function loadExistingContent() {
  if (!props.id) {
    tab.value = 'setup';
    return;
  }

  contentOutput.value = userStore.getContentOutputById(props.id);
  
  contentOutputID.value = props.id;
  if (contentOutput.value) {
    if (contentOutput.value.status === 'pending validation') {
      validations.value = await userStore.fetchValidations(props.id);
      console.log('validations', validations.value);
      tab.value = 'validation';
    } else if (contentOutput.value.status === 'completed') {
      validations.value = await userStore.fetchValidations(props.id);
      // finalContent.value = userStore.getFinalContentForContentOutput(props.id);
      tab.value = 'final';
    } else {
      tab.value = 'setup';
    }
  }
}

async function generateContent(config: any) {
  isLoading.value = true;
  try {
    const data: GeneratedContentResponse = await userStore.requestContentGenerationFromAPI(config);
    contentOutputID.value = data.contentOutput.id;
    if (data.requiresValidation) {
      validations.value = data.validationData || [];
      tab.value = 'validation';
    } else {
      if (data.contentOutput.status === 'completed') {
        tab.value = 'final';
      }
      if (data.contentOutput.status === 'failed') {
        // TO DO: Handle error (e.g., show an error message to the user)
        console.log('Error generating content. Content Status is Failed');
      }
    }
  } catch (error) {
    console.error('Error generating content:', error);
    // Handle error (e.g., show an error message to the user)
  } finally {
    isLoading.value = false;
  }
}

async function handleConfirmation(results: Validations[]) {
  for (const result of results) {
    await userStore.updateValidationItem(result);
  }
  if (contentOutputID.value) {
    await userStore.confirmValidations(contentOutputID.value);
    contentOutput.value = userStore.getContentOutputById(contentOutputID.value);
    // finalContent.value = userStore.getFinalContentForContentOutput(contentOutputID.value);
    tab.value = 'final';
  }
}

function handleRegeneration(itemsToRegenerate: Validations[]) {
  generateContent({
    items: itemsToRegenerate
  });
}
</script>

<style scoped>
/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}
</style>