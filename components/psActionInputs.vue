// psActionInputs.vue

<template>
    
    <!-- Content-specific fields -->
    <template v-for="fieldKey in contentFields" :key="fieldKey">
      <template v-if="inputFields[fieldKey].allowSelection">
        <div class="d-flex align-center mb-4">
          <v-btn @click="$emit('openContentSelection', fieldKey)" color="primary" class="mr-4">
            Select Existing {{ inputFields[fieldKey].label }}
          </v-btn>
          <SelectedContentTag :content-output-id="selectedContents[fieldKey]?.id" v-if="selectedContents[fieldKey]"
            :removable="true" @remove="$emit('clearSelectedContent', fieldKey)" />
        </div>
      </template>
      <v-text-field v-if="inputFields[fieldKey].type === 'text'" v-model="formFields[fieldKey]"
        :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
        :counter="inputFields[fieldKey].validation?.maxChar"></v-text-field>
      <v-textarea v-else-if="inputFields[fieldKey].type === 'textarea'" v-model="formFields[fieldKey]"
        :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
        :counter="inputFields[fieldKey].validation?.maxChar"
        :disabled="inputFields[fieldKey].allowSelection && !!selectedContents[fieldKey]" auto-grow></v-textarea>
    </template>
    <!-- Action-specific fields -->
    <template v-for="fieldKey in actionFields" :key="fieldKey">
      <template v-if="inputFields[fieldKey].allowSelection">
        <div class="d-flex align-center mb-4">
          <v-btn @click="$emit('openContentSelection', fieldKey)" color="primary" class="mr-4">
            Select Existing {{ inputFields[fieldKey].label }}
          </v-btn>
          <SelectedContentTag :content-output-id="selectedContents[fieldKey]?.id" v-if="selectedContents[fieldKey]"
            :removable="true" @remove="$emit('clearSelectedContent', fieldKey)" />
        </div>
      </template>
      <v-text-field v-if="inputFields[fieldKey].type === 'text'" v-model="formFields[fieldKey]"
        :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
        :counter="inputFields[fieldKey].validation?.maxChar"></v-text-field>
      <v-textarea v-else-if="inputFields[fieldKey].type === 'textarea'" v-model="formFields[fieldKey]"
        :label="inputFields[fieldKey].label" :rules="getValidationRules(inputFields[fieldKey])"
        :counter="inputFields[fieldKey].validation?.maxChar"
        :disabled="inputFields[fieldKey].allowSelection && !!selectedContents[fieldKey]" auto-grow></v-textarea>
    </template>
</template>

<script setup lang="ts">
import { InputField } from '~/types/inputFieldTypes';
// import { onMounted, defineProps, defineEmits, withDefaults } from 'vue';

interface Props {
  contentFields?: string[];
  actionFields: string[];
  inputFields: Record<string, InputField>;
  formFields: Record<string, any>;
  selectedContents: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  inputFields: () => ({})
});

const emit = defineEmits<{
  (e: 'openContentSelection'): void;
  (e: 'clearSelectedContent'): void;
}>();

const getValidationRules = (field: InputField) => {
  // Implement validation rules logic

};

onMounted(() => {
  console.log('Action Inputs mounted');
  // log props
  console.log(props);
});

</script>
