// pages/Campaign/index.vue


<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" class="d-flex flex-column relative-container pa-0">

        <div class="d-flex align-center px-4 py-10">
          <h1 class="text-h4 flex-grow-1">{{ pageTitle }}</h1>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="campaign.name" label="Campaign Name"
              :rules="[v => !!v || 'Name is required', v => v.length <= 100 || 'Name must be 100 characters or less']"
              counter="100" maxlength="100"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <psActionSelection :actions="actions" :is-action-available="isActionAvailable"
              @update="handleActionSelection" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" >
            <psActionInputs v-if="step >= 2" :action-fields="actionFields" :input-fields="inputFields"
              :form-fields="formFields" :selected-contents="selectedContents"
              @open-content-selection="openContentSelectionModal" @clear-selected-content="clearSelectedContent" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-textarea v-model="campaign.guidelines" label="Campaign guidelines (optional)"
              :rules="[v => v.length <= 500 || 'Guidelines must be 500 characters or less']" counter="500"
              maxlength="500" auto-grow rows="2" max-rows="5"></v-textarea>
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea v-model="campaign.context" label="Campaign context (optional)"
              :rules="[v => v.length <= 500 || 'Context must be 500 characters or less']" counter="500" maxlength="500"
              auto-grow rows="2" max-rows="5"></v-textarea>
          </v-col>
        </v-row>



        <CampaignContentTable v-if="step >= 2" :campaign-action="campaign.action"
          :campaign-fields="campaign.action_inputs" />
        <div class="my-10">
        </div>
        <div class="my-10">
        </div>

      </v-col>
    </v-row>

  </v-container>
  <v-container class="button-container px-0">
    <v-row no-gutters justify="center">
      <v-col cols="auto">
        <v-btn color="primary" @click="saveCampaign" class="generate-btn">
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <ContentSelectionModal v-model="showContentSelectionModal" @select="onContentSelected"
    :filters="inputFields[currentSelectingField]?.selectionFilters" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Campaign } from '../../types/frontendTypes';
import { inputFields } from '../../types/inputFieldTypes';

const userStore = useUserDataStore();

const pageTitle = 'Create Campaign';
const campaign = ref<Campaign>({
  name: '',
  guidelines: '',
  context: '',
  action: '',
  action_inputs: {},
});

const step = ref(1);
const formFields = reactive<Record<string, string>>({}); // { fieldKey: fieldValue }

const updateStep = (newStep: number) => {
  step.value = newStep;
};

// ---------- Action Selection ----------
const selectedAction = ref<string>('');

const { actions } = storeToRefs(userStore);

const handleActionSelection = (action: string) => {
  selectedAction.value = action;
  campaign.value.action = action;
  campaign.value.action_inputs = {}; // Reset action_inputs
  formFields.value = {}; // Reset formFields
  console.log('Selected action:', action);
  console.log('Selected action fields:', actionFields.value);
  console.log('Campaign:', campaign.value);
  updateStep(2);
  console.log('Step:', step.value);
};

const availableActions = computed(() => {
  return Object.fromEntries(
    Object.entries(actions).filter(([_, config]) => config.availableForCampaigns)
  );
});

const isActionAvailable = (action: string): boolean => {
  return true; // All actions passed to the component are already available
};

const actionFields = computed((): string[] => {
  if (selectedAction.value && selectedAction.value in actions.value) {
    const action = actions.value[selectedAction.value as keyof typeof actions.value];
    return [...action.requiredFieldsForCampaigns];
  }
  return [];
});

// ---------- Content Selection ----------

const selectedContents = ref<Record<string, any>>({});
const showContentSelectionModal = ref(false);
const currentSelectingField = ref('');

const openContentSelectionModal = (fieldKey: string) => {
  currentSelectingField.value = fieldKey;
  showContentSelectionModal.value = true;
};

const onContentSelected = async (content: any) => {
  selectedContents.value[currentSelectingField.value] = content;
  formFields[currentSelectingField.value] = content.content;
};

const clearSelectedContent = (fieldKey: string) => {
  selectedContents.value[fieldKey] = null;
  formFields[fieldKey] = '';
};

const isContentSelectable = computed(() => {
  return actionFields.value.includes('content') &&
    selectedAction.value &&
    actions.value[selectedAction.value].allowContentSelection;
});

// ---------- Fields for Table ----------

// watch for changed in Form Fields and update campaign.value.action_inputs
watch(formFields, (newFields) => {
  const updatedFields = { ...newFields };

  if (selectedContents.value['content']) {
    updatedFields[`selected_content_output_id`] = selectedContents.value['content'].id;
    // Ensure 'content' key is not present
    // delete updatedFields['content'];
  }

  campaign.value.action_inputs = updatedFields;
  console.log('INDEX: Updated campaign action inputs:', campaign.value.action_inputs);
  // console.log('Campaign fields:', campaignFields.value);
});

// ---------- Save Campaign ----------
const saveCampaign = () => {
};

</script>


<style scoped>
.relative-container {
  position: relative;
}

.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.generate-btn {
  width: 200px;
}

/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}
</style>
