// psActionInputs.vue

<template>
  <!-- Content-specific fields -->
  <template v-for="fieldKey in contentFields" :key="fieldKey">
    <v-col cols="12">
      <ContentSelectionButtons
        v-if="inputFields[fieldKey].allowSelection"
        v-model="selectedOption[fieldKey]"
        :label="inputFields[fieldKey].label"
        :selected-content="selectedContents[fieldKey]"
        @select="handleSelectContent(fieldKey)"
        @clear="handleClearContent(fieldKey)"
      />

      <template v-if="!inputFields[fieldKey].allowSelection || (inputFields[fieldKey].allowSelection && selectedOption[fieldKey]==='provide')">
        <v-text-field 
          v-if="inputFields[fieldKey].type === 'text'" 
          v-model="formFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
        ></v-text-field>
        <v-textarea 
          v-else-if="inputFields[fieldKey].type === 'textarea'" 
          v-model="formFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
          auto-grow
        ></v-textarea>
      </template>
    </v-col>
  </template>

  <!-- Action-specific fields -->
  <template v-for="fieldKey in actionFields" :key="fieldKey">
    <v-col cols="12">
      <ContentSelectionButtons
        v-if="inputFields[fieldKey].allowSelection"
        v-model="selectedOption[fieldKey]"
        :label="inputFields[fieldKey].label"
        :selected-content="selectedContents[fieldKey]"
        @select="handleSelectContent(fieldKey)"
        @clear="handleClearContent(fieldKey)"
      />

      <template v-if="!inputFields[fieldKey].allowSelection || (inputFields[fieldKey].allowSelection && selectedOption[fieldKey]==='provide')">
        <v-text-field 
          v-if="inputFields[fieldKey].type === 'text'" 
          v-model="formFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
        ></v-text-field>
        <v-textarea 
          v-else-if="inputFields[fieldKey].type === 'textarea'" 
          v-model="formFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
          auto-grow
        ></v-textarea>
      </template>
    </v-col>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { InputField } from '~/types/inputFieldTypes';

interface Props {
  contentFields?: string[];
  actionFields: string[];
  inputFields: Record<string, InputField>;
  formFields: Record<string, any>;
  selectedContents: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  contentFields: () => [],
  inputFields: () => ({})
});

const emit = defineEmits<{
  (e: 'selectContent', fieldKey: string): void;
  (e: 'clearSelectedContent', fieldKey: string): void;
}>();

const selectedOption = ref<Record<string, 'select' | 'provide' | null>>({});

const initializeSelectedOptions = () => {
  [...props.contentFields, ...props.actionFields].forEach(fieldKey => {
    if (props.inputFields[fieldKey]?.allowSelection) {
      selectedOption.value[fieldKey] = props.selectedContents[fieldKey] ? 'select' : null;
    }
  });
};

watch(() => props.contentFields, initializeSelectedOptions, { immediate: true });
watch(() => props.actionFields, initializeSelectedOptions, { immediate: true });
watch(() => props.selectedContents, initializeSelectedOptions, { deep: true });

// Initialize selectedOption with null values for all fields
onMounted(() => {
  console.log('Action Inputs mounted');
  console.log(props);
  initializeSelectedOptions();
});

const selectedContentDisplay = computed(() => {
  const display: Record<string, string> = {};
  for (const fieldKey in props.selectedContents) {
    if (props.selectedContents[fieldKey] && props.selectedContents[fieldKey].content) {
      display[fieldKey] = props.selectedContents[fieldKey].content;
    } else {
      display[fieldKey] = '';
    }
  }
  return display;
});

const handleSelectContent = (fieldKey: string) => {
  selectedOption.value[fieldKey] = 'select';
  emit('selectContent', fieldKey);
};

const handleProvideContent = (fieldKey: string) => {
  selectedOption.value[fieldKey] = 'provide';
  emit('clearSelectedContent', fieldKey);
};

const handleClearContent = (fieldKey: string) => {
  selectedOption.value[fieldKey] = null;
  emit('clearSelectedContent', fieldKey);
};


const getValidationRules = (field: InputField) => {
  // Implement validation rules logic

};

</script>
