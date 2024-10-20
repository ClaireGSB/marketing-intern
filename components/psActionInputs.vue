// psActionInputs.vue

<template>
  <!-- Content-specific fields -->
  <template v-for="fieldKey in contentFields" :key="fieldKey">
    <v-col cols="12">
      <ContentSelectionButtons
        v-if="inputFields[fieldKey].allowSelection"
        v-model="localSelectedOption[fieldKey]"
        :selected-content="selectedContents[fieldKey]"
        :label="inputFields[fieldKey].label"
        :filters="inputFields[fieldKey].selectionFilters"
        @update:selected-content="updateSelectedContent(fieldKey, $event)"
        @provide="handleProvideContent(fieldKey)"
      />

      <div v-show="!inputFields[fieldKey].allowSelection || (inputFields[fieldKey].allowSelection && localSelectedOption[fieldKey]==='provide')">
        <v-text-field 
          v-if="inputFields[fieldKey].type === 'text'" 
          v-model="localFormFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="props.getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
          @input="emitFormFieldUpdate(fieldKey)"
        ></v-text-field>
        <v-textarea 
          v-else-if="inputFields[fieldKey].type === 'textarea'" 
          v-model="localFormFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="props.getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
          auto-grow
          @input="emitFormFieldUpdate(fieldKey)"
        ></v-textarea>
      </div>
    </v-col>
  </template>

  <!-- Action-specific fields -->
  <template v-for="fieldKey in actionFields" :key="fieldKey">
    <v-col cols="12">
      <ContentSelectionButtons
        v-if="inputFields[fieldKey].allowSelection"
        v-model="localSelectedOption[fieldKey]"
        :selected-content="selectedContents[fieldKey]"
        :label="inputFields[fieldKey].label"
        :filters="inputFields[fieldKey].selectionFilters"
        @update:selected-content="updateSelectedContent(fieldKey, $event)"
        @provide="handleProvideContent(fieldKey)"
      />

      <div v-show="!inputFields[fieldKey].allowSelection || (inputFields[fieldKey].allowSelection && localSelectedOption[fieldKey]==='provide')">
        <v-text-field 
          v-if="inputFields[fieldKey].type === 'text'" 
          v-model="localFormFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="props.getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
          @input="emitFormFieldUpdate(fieldKey)"
        ></v-text-field>
        <v-textarea 
          v-else-if="inputFields[fieldKey].type === 'textarea'" 
          v-model="localFormFields[fieldKey]"
          :label="inputFields[fieldKey].label" 
          :rules="props.getValidationRules(inputFields[fieldKey])"
          :counter="inputFields[fieldKey].validation?.maxChar"
          auto-grow
          @input="emitFormFieldUpdate(fieldKey)"
        ></v-textarea>
      </div>
    </v-col>
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FieldConfig } from '~/types/inputFieldTypes';

interface Props {
  contentFields?: string[];
  actionFields: string[];
  inputFields: Record<string, FieldConfig>;
  formFields: Record<string, any>;
  selectedContents: Record<string, any>;
  getValidationRules: (field: InputField) => any[];
}

const props = withDefaults(defineProps<Props>(), {
  contentFields: () => [],
  inputFields: () => ({}),
  getValidationRules: () => () => []
});

const emit = defineEmits<{
  (e: 'update:formFields', value: Record<string, any>): void;
  (e: 'update:selectedContents', value: Record<string, any>): void;
}>();

const localSelectedOption = ref<Record<string, 'select' | 'provide' | null>>({});
const localFormFields = ref<Record<string, any>>({...props.formFields});

const initializeLocalSelectedOption = () => {
  [...(props.contentFields || []), ...props.actionFields].forEach(fieldKey => {
    if (props.inputFields[fieldKey]?.allowSelection) {
      localSelectedOption.value[fieldKey] = props.selectedContents[fieldKey] ? 'select' : null;
    } else {
      localSelectedOption.value[fieldKey] = null;
    }
  });
};

// Initialize localSelectedOption immediately
initializeLocalSelectedOption();

// watch for changes in content fields and action fields and reinitialize localSelectedOption
watch(() => props.contentFields, () => initializeLocalSelectedOption());
watch(() => props.actionFields, () => initializeLocalSelectedOption());

const updateSelectedContent = (fieldKey: string, content: any) => {
  emit('update:selectedContents', { ...props.selectedContents, [fieldKey]: content });
  if (content) {
    localFormFields.value[fieldKey] = content.content;
    emit('update:formFields', { ...localFormFields.value, [fieldKey]: content.content });
    localSelectedOption.value[fieldKey] = 'select';
  } else {
    localFormFields.value[fieldKey] = '';
    emit('update:formFields', { ...localFormFields.value, [fieldKey]: '' });
    localSelectedOption.value[fieldKey] = null;
  }
};

const handleProvideContent = (fieldKey: string) => {
  emit('update:selectedContents', { ...props.selectedContents, [fieldKey]: null });
  localFormFields.value[fieldKey] = '';
  emit('update:formFields', { ...localFormFields.value, [fieldKey]: '' });
  localSelectedOption.value[fieldKey] = 'provide';
};
const emitFormFieldUpdate = (fieldKey: string) => {
  emit('update:formFields', { ...localFormFields.value, [fieldKey]: localFormFields.value[fieldKey] });
};


onMounted(() => {
  console.log('Action Inputs mounted');
  console.log(props);
});
</script>
