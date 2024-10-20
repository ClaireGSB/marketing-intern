<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="generateContent">
    <v-row>
      <!-- Select Content Type - Step 1 -->
      <psContentTypeSelection :content-types="contentTypes" :selected-content-type="selectedContentType"
        @select="selectContentType" />

      <!-- Select Content Subtype - Step 2 -->
      <psSubTypeSelection v-if="step >= 2" :possible-sub-types="possibleSubTypes" :selected-sub-type="selectedSubType"
        @update="handleSubTypeSelection" />

      <!-- If Blog Post Copy: Select Outline - Step 3 -->
      <psOutlineSelection v-if="step >= 3 && selectedContentType.id === 9" v-model:outline-option="outlineOption"
        :project-setup="projectSetup" :selected-outline="selectedContents['outline']"
        @select-outline="selectExistingOutline" @clear-selected-outline="clearSelectedOutline" />

      <!-- If NOT Blog Post Copy AND outline selected -->
      <template v-if="!(selectedContentType.id === 9 && (!outlineOption || outlineOption === 'select'))">
        <!-- Select Action - Step 4 -->
        <v-col cols="12">
          <template v-if="step >= 3">
            <h3 class="mb-4">3. Select Action</h3>
            <psActionSelection :actions="actions" :is-action-available="isActionAvailable"
              @update="handleActionSelection" />
          </template>
        </v-col>

        <!-- Action fields - Step 5 -->
        <v-col cols="12">
          <template v-if="step >= 5">
            <h3 class="mb-4">4. Action Inputs</h3>
            <psActionInputs 
    :content-fields="contentFields"
    :action-fields="actionFields"
    :input-fields="inputFields"
    :form-fields="formFields"
    :selected-contents="selectedContents"
    :selected-options="selectedOptions"
    @select-content="selectExistingContent"
    @clear-selected-content="clearSelectedContent"
  />
          </template>
        </v-col>

      </template>

      <!-- Review settings - Step 5 -->
      <psReviewSettings v-if="step >= 5" :selected-content-type="selectedContentType"
        :selected-sub-type="selectedSubType" @review="reviewSubTypeSettings" />

      <!-- Review settings - Step 5 -->
      <psOptionalProjectConfig v-if="step >= 5 && !(selectedContentType.id === 9 && outlineOption === 'select')"
        :general-optional-fields="generalOptionalFields" :input-fields="inputFields" :form-fields="formFields" />
    </v-row>
  </v-form>

  <v-container class="button-container px-0">
    <v-row no-gutters justify="center">
      <v-col cols="auto">
        <v-btn color="primary" @click="generateContent" :disabled="!isValid || step < 4" class="generate-btn">
          Generate
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <ContentSettingsDialog v-model="showSettingsPanel" :content-type-id="selectedContentType.id"
    :content-subtype-id="selectedSubType.id" />
  <ContentSelectionModal v-model="showContentSelectionModal" @select="onContentSelected"
    :filters="inputFields[currentSelectingField]?.selectionFilters" />
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useUserDataStore } from '../stores/userdata';
import { storeToRefs } from 'pinia';
import { VForm } from 'vuetify/components';
import type { ContentType } from '../types/contentTypes';
import { type FieldConfig, inputFields, generalOptionalFields } from '../types/inputFieldTypes';

const props = withDefaults(defineProps<{
  isEditable?: boolean;
  initialData?: Record<string, string>;
}>(), {
  isEditable: false,
  initialData: () => ({}),
});

const emit = defineEmits<{
  (e: 'generate', userInput: Record<string, any>): void;
}>();

const userStore = useUserDataStore();
const form = ref<InstanceType<typeof VForm> | null>(null);
const formFields = reactive<Record<string, string>>({});
const isValid = ref(false);

// --------- Form Progress ---------
const step = ref(1);
const outlineOption = ref<'select' | 'provide' | null>(null);
const projectSetup = ref(null);

const updateStep = (newStep: number) => {
  step.value = newStep;
};

// --------- Content types and Subtypes selection ---------
const { contentTypes, actions } = storeToRefs(userStore);
const selectedContentType = ref<ContentType>({
  id: -1,
  name: '',
  display_name: '',
  available_actions: [],
  created_at: '',
  _status: ''
});
const selectedSubType = ref<{ id: string; name: string }>({ id: '', name: '' });
const possibleSubTypes = ref([] as { id: string; name: string; }[])

const selectContentType = (id: number) => {
  const foundType = contentTypes.value.find(type => type.id === id);
  selectedContentType.value = foundType || {
    id: -1,
    name: '',
    display_name: '',
    available_actions: [],
    created_at: '',
    _status: ''
  };
  possibleSubTypes.value = userStore.getSubtypesIDsAndNamesForContentType(id);
  selectedSubType.value = possibleSubTypes.value[0] || { id: -1, name: '' };
  updateStep(2);
};

const handleSubTypeSelection = (newSubType: { id: string; name: string }) => {
  selectedSubType.value = newSubType;
  updateStep(3);
};

const selectExistingOutline = async () => {
  showContentSelectionModal.value = true;
  currentSelectingField.value = 'outline';
};

const clearSelectedOutline = () => {
  selectedContents.value['outline'] = null;
  outlineOption.value = null;
  projectSetup.value = null;
  updateStep(3);
};

watch(selectedContentType, (newType) => {
  if (newType.id === 9) {
    step.value = 3;
    outlineOption.value = null;
  } else {
    // Reset outline-related data when switching away from blog post copy
    outlineOption.value = null;
    projectSetup.value = null;
  }
  if (selectedAction.value && !isActionAvailable(selectedAction.value)) {
    selectedAction.value = '';
    step.value = Math.min(step.value, 3);
  }
  if (!possibleSubTypes.value.some(subType => subType.id === selectedSubType.value.id)) {
    selectedSubType.value = possibleSubTypes.value[0] || { id: '', name: '' };
    step.value = Math.min(step.value, 2);
  }
});

// --------- Action Selection & Action-Related Required Fields ---------
const selectedAction = ref<string>('');

const isActionAvailable = (action: string): boolean => {
  return action in actions.value && selectedContentType.value.available_actions.includes(action);
};

const contentFields = computed(() => {
  return [...selectedContentType.value.required_fields, ...selectedContentType.value.optional_fields];
});

const actionFields = computed((): string[] => {
  if (selectedAction.value && selectedAction.value in actions.value) {
    const action = actions.value[selectedAction.value as keyof typeof actions.value];
    return [...action.requiredFields, ...action.optionalFields];
  }
  return [];
});

const handleActionSelection = (action: string) => {
  selectedAction.value = action;
  updateStep(5);
};

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

// ---------- Content Selection ----------

const selectedContents = ref<Record<string, any>>({});
const showContentSelectionModal = ref(false);
const currentSelectingField = ref('');
const selectedOptions = ref<Record<string, 'select' | 'provide' | null>>({});

const selectExistingContent = (fieldKey: string) => {
  showContentSelectionModal.value = true;
  currentSelectingField.value = fieldKey;
};

const onContentSelected = async (content: any) => {
  if (currentSelectingField.value === 'outline') {
    selectedContents.value['outline'] = content;
    projectSetup.value = await userStore.fetchProjectSetupByContentOutput(content.id);
    updateStep(5);
  } else {
    selectedContents.value[currentSelectingField.value] = content;
    formFields[currentSelectingField.value] = content.content;
  }
  selectedOptions.value[currentSelectingField.value] = 'select';
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

// ---------- Review SubType Settings ----------
const showSettingsPanel = ref(false);

const reviewSubTypeSettings = () => {
  showSettingsPanel.value = true;
};

// ---------- General Optional Fields ----------

const showOptionalFields = ref(false);

const toggleOptionalFields = () => {
  showOptionalFields.value = !showOptionalFields.value;
};

// ---------- Validation ----------

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

// ---------- Content Generation ----------
const generateContent = async () => {
  if (!form.value) return;
  const { valid } = await form.value.validate();

  if (valid) {
    const userInput = {
      content_type_id: selectedContentType.value.id,
      content_subtype_id: selectedSubType.value.id,
      action: selectedAction.value,
      ...formFields,
    };

    // Add selected content IDs for fields that allow selection
    for (const fieldKey in selectedContents.value) {
      if (selectedContents.value['content']) {
        userInput[`selected_content_output_id`] = selectedContents.value['content'].id;
      }
      if (selectedContents.value['outline']) {
        userInput[`selected_outline_id`] = selectedContents.value['outline'].id;
      }
    }
    // To do: also handle outline
    console.log('requesting content generation with:', userInput)
    console.log('actionFields.value:', actionFields.value)
    console.log('selectedContentType.value.required_fields:', selectedContentType.value.required_fields)
    console.log('selectedAction.value:', selectedAction.value)
    // emit('generate', userInput);
  }
};
</script>

<style scoped>
.selectable-card {
  cursor: pointer;
  transition: all 0.3s;
}

.selectable-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

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