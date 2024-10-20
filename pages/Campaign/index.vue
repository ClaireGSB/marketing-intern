// Pages/Campaign/index.vue

<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" class="d-flex flex-column relative-container pa-0">
        <div class="d-flex align-center px-4 py-10">
          <h1 class="text-h4 flex-grow-1">{{ pageTitle }}</h1>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="campaign.name"
              label="Campaign Name"
              :rules="[
                v => !!v || 'Name is required',
                v => v.length <= 100 || 'Name must be 100 characters or less'
              ]"
              counter="100"
              maxlength="100"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <psActionSelection
              :actions="availableActions"
              :is-action-available="isActionAvailable"
              @update="handleActionSelection"
            />
          </v-col>
        </v-row>

        <v-row v-if="step >= 2">
          <v-col cols="12">
            <psActionInputs
              :action-fields="actionFields"
              :input-fields="inputFields"
              :form-fields="formFields"
              :selected-contents="selectedContents"
              :get-validation-rules="getValidationRules"
              @update:form-fields="updateFormFields"
              @update:selected-contents="updateSelectedContents"
            />
          </v-col>
        </v-row>

        <v-row v-if="step >= 2">
          <v-col cols="12" md="6">
            <v-textarea
              v-model="campaign.guidelines"
              label="Campaign guidelines (optional)"
              :rules="[v => v.length <= 500 || 'Guidelines must be 500 characters or less']"
              counter="500"
              maxlength="500"
              auto-grow
              rows="2"
              max-rows="5"
            ></v-textarea>
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea
              v-model="campaign.context"
              label="Campaign context (optional)"
              :rules="[v => v.length <= 500 || 'Context must be 500 characters or less']"
              counter="500"
              maxlength="500"
              auto-grow
              rows="2"
              max-rows="5"
            ></v-textarea>
          </v-col>
        </v-row>

        <CampaignContentTable
          v-if="step >= 2"
          :campaign-action="campaign.action"
          :campaign-fields="campaign.action_inputs"
        />

        <div class="my-10"></div>
        <div class="my-10"></div>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Campaign } from '../../types/frontendTypes';
import { inputFields } from '../../types/inputFieldTypes';
import { useUserDataStore } from '../../stores/userData';

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
const formFields = ref<Record<string, string>>({});
const selectedContents = ref<Record<string, any>>({});

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
  selectedContents.value = {}; // Reset selectedContents
  console.log('Selected action:', action);
  console.log('Selected action fields:', actionFields.value);
  console.log('Campaign:', campaign.value);
  updateStep(2);
  console.log('Step:', step.value);
};

const availableActions = computed(() => {
  return Object.fromEntries(
    Object.entries(actions.value).filter(([_, config]) => config.availableForCampaigns)
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

// ---------- Update functions ----------
const updateFormFields = (newFormFields: Record<string, string>) => {
  formFields.value = newFormFields;
  campaign.value.action_inputs = { ...campaign.value.action_inputs, ...newFormFields };
};

const updateSelectedContents = (newSelectedContents: Record<string, any>) => {
  console.log('Updating selected contents:', newSelectedContents);
  selectedContents.value = newSelectedContents;
  if (!selectedContents.value.content) {
    delete campaign.value.action_inputs['selected_content_output_id'];
  } else if (selectedContents.value.content.id) {
    campaign.value.action_inputs['selected_content_output_id'] = selectedContents.value.content.id;
  }
};

// ---------- Validation ----------

const isFieldRequired = (fieldKey: string): boolean => {
  console.log('checking if isFieldRequired:', fieldKey);
  if (actionFields.value.includes(fieldKey)) {
    console.log('field is in actionFields');
    if (selectedAction.value && selectedAction.value in actions.value) {
      console.log('selectedAction.value:', selectedAction.value);
      const action = actions.value[selectedAction.value as keyof typeof actions.value];
      console.log('action:', action);
      console.log('action.requiredFields:', action.requiredFields);
      console.log('action.requiredFields.includes(fieldKey):', action.requiredFields.includes(fieldKey));
      return action.requiredFields.includes(fieldKey);
    }
  }
  if (contentFields.value.includes(fieldKey)) {
    console.log('field is in contentFields');
    console.log('selectedContentType.value:', selectedContentType.value);
    return selectedContentType.value.required_fields.includes(fieldKey);
  }
  return false;
};

const getValidationRules = (field: FieldConfig) => {
  const rules: ((v: string) => true | string)[] = [];

  const isRequired = isFieldRequired(field.key);

  if (isRequired) {
    rules.push((v: string) => !!v || `${field.label} is required`);
  }

  if (field.validation) {
    const { minChar, maxChar } = field.validation;

    rules.push((v: string) => {
      if (!v || v.trim().length === 0) {
        return isRequired ? `${field.label} is required` : true;
      }
      if (minChar && v.length < minChar) {
        return isRequired
          ? `Minimum ${minChar} characters required`
          : `This field is optional, but if using, minimum ${minChar} characters required`;
      }
      if (maxChar && v.length > maxChar) {
        return `Maximum ${maxChar} characters allowed`;
      }
      return true;
    });
  }

  return rules;
};


// ---------- Save Campaign ----------
const saveCampaign = () => {
  // Implement save logic here
  console.log('Saving campaign:', campaign.value);
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
