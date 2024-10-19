// psOptionalProjectConfig.vue

<template>
  <v-col cols="12">
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FieldConfig } from '../types/inputFieldTypes';

interface Props {
  generalOptionalFields: string[];
  inputFields: Record<string, FieldConfig>;
  formFields: Record<string, string>;
}

defineProps<Props>();

const showOptionalFields = ref(false);

const toggleOptionalFields = () => {
  showOptionalFields.value = !showOptionalFields.value;
};

const getValidationRules = (field: FieldConfig) => {
  const rules: ((v: string) => true | string)[] = [];

  if (field.validation) {
    const { minChar, maxChar } = field.validation;

    rules.push((v: string) => {
      if (!v || v.trim().length === 0) return true; // Optional fields can be empty
      if (minChar && v.length < minChar) {
        return `Minimum ${minChar} characters required`;
      }
      if (maxChar && v.length > maxChar) {
        return `Maximum ${maxChar} characters allowed`;
      }
      return true;
    });
  }

  return rules;
};
</script>
