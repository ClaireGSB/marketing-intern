// ContentSelectionButtons.vue

<template>
  <div class="mb-4">
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
      <v-col cols="12" class="mt-4" v-if="showSelectedContent">
        <v-textarea v-model="contentDisplay" :label="`Selected ${label}`"
          readonly auto-grow rows="5" max-rows="10"></v-textarea>
      </v-col>
    </template>

    <ContentSelectionModal 
      v-model="showContentSelectionModal"
      :filters="filters"
      @select="onContentSelected"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: 'select' | 'provide' | null;
  label: string;
  selectedContent: any | null;
  showSelectedContent: boolean;
  filters?: any; // Add type definition for filters if available
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'select' | 'provide' | null): void;
  (e: 'update:selectedContent', content: any | null): void;
  (e: 'provide'): void;
}>();

const showContentSelectionModal = ref(false);

const contentDisplay = computed(() => {
  return props.selectedContent?.content || '';
});

const handleSelect = () => {
  showContentSelectionModal.value = true;
};

const handleProvide = () => {
  emit('update:modelValue', 'provide');
  emit('update:selectedContent', null);
  emit('provide');
};

const handleClear = () => {
  emit('update:modelValue', null);
  emit('update:selectedContent', null);
};

const onContentSelected = (content: any) => {
  emit('update:modelValue', 'select');
  emit('update:selectedContent', content);
  showContentSelectionModal.value = false;
};

const handleModalCancel = () => {
  if (!props.selectedContent) {
    emit('update:modelValue', null);
  }
  showContentSelectionModal.value = false;
};
</script>