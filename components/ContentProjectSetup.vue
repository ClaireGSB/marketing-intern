<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="generateContent">
    <v-row>
      <v-col cols="12">
        <h3 class="mb-4">1. Select Content Type</h3>
        <v-row>
          <v-col v-for="type in contentTypes" :key="type.id" cols="12" sm="6" md="3">
            <v-card @click="selectContentType(type.id)" :color="selectedContentType.id === type.id ? 'primary' : ''"
              :class="{ 'elevation-8': selectedContentType.id === type.id }" class="selectable-card">
              <v-card-title>{{ type.display_name }}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col v-if="step >= 2" cols="12">
        <h3 class="mb-4">2. Select Sub-Type</h3>
        <v-select v-model="selectedSubType" :items="possibleSubTypes" item-title="name" label="Select Sub-Type"
          @update:modelValue="updateStep(3)" required return-object></v-select>
      </v-col>

      <v-col v-if="step >= 2" cols="12">
        <h3 class="mb-4">3. Select Action</h3>
        <v-radio-group v-model="selectedAction" @update:modelValue="updateStep(4)">
          <v-tooltip v-for="action in Object.keys(actions)" :key="action" :disabled="isActionAvailable(action)"
            text="Unavailable for this content type" location="top start">
            <template v-slot:activator="{ props }">
              <div v-bind="props">
                <v-radio :label="action" :value="action" :disabled="!isActionAvailable(action)"></v-radio>
              </div>
            </template>
          </v-tooltip>
        </v-radio-group>
      </v-col>

      <v-col v-if="step >= 4" cols="12">
        <h3 class="mb-4">4. Action Inputs</h3>
        <template v-for="fieldKey in actionFields" :key="fieldKey">
          <v-text-field v-if="inputFields[fieldKey].type === 'text'" v-model="formFields[fieldKey]"
            :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
            :counter="inputFields[fieldKey].validation?.maxChar"></v-text-field>
          <v-textarea v-else-if="inputFields[fieldKey].type === 'textarea'" v-model="formFields[fieldKey]"
            :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
            :counter="inputFields[fieldKey].validation?.maxChar" auto-grow></v-textarea>
        </template>
      </v-col>

      <v-col v-if="step >= 4" cols="12">
        <h3 class="mb-4">5. Review settings</h3>
        <p>The following settings for {{ selectedContentType.display_name }} - {{ selectedSubType.name }} will apply</p>
        <v-btn @click="reviewSubTypeSettings" outlined class="mt-4">
          <v-icon left>mdi-magnify</v-icon> Review Settings
        </v-btn>
      </v-col>


      <v-col v-if="step >= 4" cols="12">
        <div class="d-flex align-center cursor-pointer mb-4" @click="toggleOptionalFields">
          <h3 class="mr-2">6. Optional Project Configuration</h3>
          <v-icon :icon="showOptionalFields ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"></v-icon>
        </div>

        <v-expand-transition>
          <div v-if="showOptionalFields">
            <template v-for="fieldKey in generalOptionalFields" :key="fieldKey">
              <v-text-field v-if="inputFields[fieldKey].type === 'text'" v-model="formFields[fieldKey]"
                :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
                :counter="inputFields[fieldKey].validation?.maxChar"></v-text-field>
              <v-textarea v-else-if="inputFields[fieldKey].type === 'textarea'" v-model="formFields[fieldKey]"
                :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
                :counter="inputFields[fieldKey].validation?.maxChar" auto-grow></v-textarea>
            </template>
          </div>
        </v-expand-transition>
      </v-col>
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
</template>

<script lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useUserDataStore } from '../stores/userdata';
import { storeToRefs } from 'pinia';
import { VForm } from 'vuetify/components';
import type { ContentType } from '../types/contentTypes';
import { type FieldConfig, inputFields, generalOptionalFields } from '../types/inputFieldTypes';

export default {
  emits: ['generate'],
  setup(props, { emit }) {
    const userStore = useUserDataStore();
    const form = ref<InstanceType<typeof VForm> | null>(null);
    const formFields = reactive<Record<string, string>>({});
    const isValid = ref(false);

    // --------- Form Progress ---------
    const step = ref(1);

    const updateStep = (newStep: number) => {
      step.value = Math.max(step.value, newStep);
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

    watch(selectedContentType, (newType) => {
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

    const actionFields = computed((): string[] => {
      if (selectedAction.value && selectedAction.value in actions.value) {
        const action = actions.value[selectedAction.value as keyof typeof actions.value];
        return [...action.requiredFields, ...action.optionalFields];
      }
      return [];
    });

    const isFieldRequired = (fieldKey: string): boolean => {
      if (selectedAction.value && selectedAction.value in actions.value) {
        const action = actions.value[selectedAction.value as keyof typeof actions.value];
        return action.requiredFields.includes(fieldKey);
      }
      return false;
    };


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
        console.log('Generating content with:', {
          subType: selectedSubType.value.name,
          action: selectedAction.value,
          formFields,
        });
        const userInput = {
          content_type_id: selectedContentType.value.id,
          content_subtype_id: selectedSubType.value.id,
          action: selectedAction.value,
          ...formFields,
        };
        console.log('requesting content generation with:', userInput)
        emit('generate', userInput);
      }
    };

    return {
      step,
      isValid,
      form,
      selectedContentType,
      selectedSubType,
      selectedAction,
      possibleSubTypes,
      contentTypes,
      actions,
      isActionAvailable,
      selectContentType,
      updateStep,
      generateContent,
      showOptionalFields,
      toggleOptionalFields,
      reviewSubTypeSettings,
      showSettingsPanel,
      getValidationRules,
      actionFields,
      formFields,
      generalOptionalFields,
      inputFields,
      isFieldRequired,
    };
  },
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
