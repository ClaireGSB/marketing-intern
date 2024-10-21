// CampaignBrief.vue

<template>
  <v-dialog v-model="showDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditMode ? 'Edit Campaign Brief' : 'Create Campaign Brief' }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="localCampaign.name"
                label="Campaign Name"
                :rules="[
                  v => !!v || 'Name is required',
                  v => v.length <= 100 || 'Name must be 100 characters or less'
                ]"
                counter="100"
                maxlength="100"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <psActionSelection
                :actions="availableActions"
                :is-action-available="isActionAvailable"
                :campaign-display-name="true"
                @update="handleActionSelection"
              />
            </v-col>
            <v-col cols="12" v-if="localCampaign.action">
              <psActionInputs
                :action-fields="actionFields"
                :input-fields="inputFields"
                :form-fields="formFields"
                :selected-contents="selectedContents"
                :get-validation-rules="getValidationRules"
                :show-selected-content="false"
                @update:form-fields="updateFormFields"
                @update:selected-contents="updateSelectedContents"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="localCampaign.guidelines"
                label="Campaign guidelines (optional)"
                :rules="[v => v.length <= 500 || 'Guidelines must be 500 characters or less']"
                counter="500"
                maxlength="500"
                auto-grow
                rows="2"
                max-rows="5"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="localCampaign.context"
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
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="saveCampaign">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Campaign } from '../types/frontendTypes';
import { inputFields } from '../types/inputFieldTypes';
import { useUserDataStore } from '../stores/userData';

const props = defineProps<{
  modelValue: boolean;
  campaign: Campaign;
  isEditMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', campaign: Campaign): void;
}>();

const userStore = useUserDataStore();
const { actions } = storeToRefs(userStore);

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const localCampaign = ref<Campaign>({ ...props.campaign });
const formFields = ref<Record<string, string>>({});
const selectedContents = ref<Record<string, any>>({});

// ---------- Action Selection ----------

const availableActions = computed(() => {
  return Object.fromEntries(
    Object.entries(actions.value).filter(([_, config]) => config.availableForCampaigns)
  );
});

const isActionAvailable = (action: string): boolean => {
  return true; // All actions passed to the component are already available
};

const actionFields = computed((): string[] => {
  if (localCampaign.value.action && localCampaign.value.action in actions.value) {
    const action = actions.value[localCampaign.value.action as keyof typeof actions.value];
    return [...action.requiredFieldsForCampaigns];
  }
  return [];
});

const handleActionSelection = (action: string) => {
  localCampaign.value.action = action;
  localCampaign.value.action_inputs = {}; // Reset action_inputs
  formFields.value = {}; // Reset formFields
  selectedContents.value = {}; // Reset selectedContents
};

// ---------- Update functions ----------

const updateFormFields = (newFormFields: Record<string, string>) => {
  formFields.value = newFormFields;
  localCampaign.value.action_inputs = { ...localCampaign.value.action_inputs, ...newFormFields };
};

const updateSelectedContents = (newSelectedContents: Record<string, any>) => {
  selectedContents.value = newSelectedContents;
  if (!selectedContents.value.content) {
    delete localCampaign.value.action_inputs['selected_content_output_id'];
  } else if (selectedContents.value.content.id) {
    localCampaign.value.action_inputs['selected_content_output_id'] = selectedContents.value.content.id;
  }
};

// ---------- Validation ----------


const isFieldRequired = (fieldKey: string): boolean => {
  if (actionFields.value.includes(fieldKey)) {
    if (localCampaign.value.action && localCampaign.value.action in actions.value) {
      const action = actions.value[localCampaign.value.action as keyof typeof actions.value];
      return action.requiredFields.includes(fieldKey);
    }
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

const closeDialog = () => {
  showDialog.value = false;
};

const saveCampaign = () => {
  console.log('Saving campaign:', localCampaign.value);
  emit('save', localCampaign.value);
  closeDialog();
};
</script>