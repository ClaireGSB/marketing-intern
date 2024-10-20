<template>
  <div class="mb-4">
    <h3 class="mb-4">{{ label }}</h3>
    <v-btn @click="handleSelect" class="mr-2"
      :prepend-icon="modelValue === 'select' ? 'mdi-check-circle' : ''">
      Select Existing {{ label }}
    </v-btn>
    <v-btn @click="handleProvide"
      :prepend-icon="modelValue === 'provide' ? 'mdi-check-circle' : ''">
      Provide New {{ label }}
    </v-btn>

    <template v-if="selectedContent">
      <v-col cols="12" class="d-flex align-center mt-4">
        <SelectedContentTag :content-output-id="selectedContent.id" :removable="true"
          @remove="handleClear">
          {{ selectedContent.title || `Selected ${label}` }}
        </SelectedContentTag>
      </v-col>
      <v-col cols="12" class="mt-4">
        <v-textarea v-model="contentDisplay" :label="`Selected ${label}`"
          readonly auto-grow rows="5" max-rows="10"></v-textarea>
      </v-col>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: 'select' | 'provide' | null;
  label: string;
  selectedContent: any | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'select' | 'provide' | null): void;
  (e: 'select'): void;
  (e: 'clear'): void;
}>();

const contentDisplay = computed(() => {
  return props.selectedContent?.content || '';
});

const handleSelect = () => {
  emit('update:modelValue', 'select');
  emit('select');
};

const handleProvide = () => {
  emit('update:modelValue', 'provide');
  emit('clear');
};

const handleClear = () => {
  emit('update:modelValue', null);
  emit('clear');
};
</script>