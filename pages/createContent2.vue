// src/components/createContent2.vue

<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" xl="8" class="d-flex flex-column relative-container pa-0">
        <h1 class="text-h4 px-4 py-10">Create Content</h1>
        <v-container fluid class="flex-grow-1 overflow-y-auto pb-16">

          <v-tabs v-model="tab" grow color="primary" class="mb-10">
            <v-tab value="test" text="Test"></v-tab>
            <v-tab value="setup" text="Project setup"></v-tab>
            <v-tab value="validation" :disabled="!hasValidations" text="Validation"></v-tab>
            <v-tab value="final" :disabled="!hasFinalContent" text="Final Content"></v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab" class="pb-6">
            <v-tabs-window-item value="test">
              <p> blabla </p>
              <initializeContent />
            </v-tabs-window-item>
            
            <v-tabs-window-item value="setup">
              <p> blabla </p>
              <ContentProjectSetup @generate="generateContent" />
            </v-tabs-window-item>

            <v-tabs-window-item v-if="validations" value="validation">
              <ContentValidation :validations="validations" @confirm="handleConfirmation"
                @regenerate="handleRegeneration" />
            </v-tabs-window-item>

            <v-tabs-window-item v-if="finalContent" value="final">
              <FinalContent :content="finalContent" />
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

<script lang="ts">
import { ref, computed } from 'vue';
import { useUserDataStore } from '../stores/userdata';
import { Validations, GeneratedContentResponse } from '../types/frontendTypes';
import { FinalContentItem } from '../types/frontendTypes';

export default {
  setup() {
    const userStore = useUserDataStore();
    const tab = ref('setup');
    const isLoading = ref(false);
    const validations = ref(null as Validations[] | null);
    const contentOutputID = ref(-1);
    const finalContent = ref(null as FinalContentItem[] | null);

    const contentOutput = computed(() => {
      // Check if contentOutputID is -1, return null if true
      if (contentOutputID.value === -1) {
        return null;
      }
      // Otherwise, fetch the content output by ID
      return userStore.getContentOutputById(contentOutputID.value);
    });

    const hasValidations = computed(() => !!validations.value);
    const hasFinalContent = computed(() => !!finalContent.value);

    const generateContent = async (config: any) => {
      isLoading.value = true;
      try {
        const data: GeneratedContentResponse = await userStore.requestContentGenerationFromAPI(config);
        contentOutputID.value = data.contentOutput.id;
        if (data.requiresValidation) {
          validations.value = data.validationData || [];
          tab.value = 'validation';
        } else {
          if (contentOutput.value && contentOutput.value.status === 'completed') {
            finalContent.value = userStore.getFinalContentForContentOutput(contentOutputID.value);
            tab.value = 'final';
          }
        }
      } catch (error) {
        console.error('Error generating content:', error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        isLoading.value = false;
      }
    };

    const handleConfirmation = async (results: Validations[]) => {
      // TODO: save validations results to the server and get the final content from the server
      for (const result of results) {
        await userStore.updateValidationItem(result);
      }
      await userStore.confirmValidations(contentOutputID.value);
      // final content is the content of ContentOutput as well as the values of blogMetadata if content



      // in the meantime using this "dummy function"
      // Process the confirmed selections for all items
      finalContent.value = userStore.getFinalContentForContentOutput(contentOutputID.value);
      tab.value = 'final';
    };

    const handleRegeneration = (itemsToRegenerate: Validations[]) => {
      // Send itemsToRegenerate to the server to regenerate versions for specific items
      generateContent({
        items: itemsToRegenerate
      });
    };

    return {
      tab,
      isLoading,
      validations,
      finalContent,
      hasValidations,
      hasFinalContent,
      generateContent,
      handleConfirmation,
      handleRegeneration,
    };
  },
};
</script>

<style scoped>
/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}
</style>
