<template>
  <v-dialog v-model="dialog" max-width="1000px">
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5">Select Content</span>
      </v-card-title>
      <v-card-text>
        <ContentTable 
          :selectable="true" 
          @select="onSelect" 
          :filters="filters"
        />
      </v-card-text>
      <v-card-actions class="pt-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="cancelAndClose">
          Cancel
        </v-btn>
        <v-btn color="primary" variant="text" @click="confirmSelection" :disabled="!selectedContent">
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';

  const props = withDefaults(defineProps<{
    modelValue?: boolean;
    filters?: Record<string, any>;
  }>(), {
    modelValue: false,
    filters: () => ({})
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'select', content: any): void;
    (e: 'close'): void;
    (e: 'cancel'): void;
  }>();

  const dialog = ref(false);
  const selectedContent = ref(null);

  watch(() => props.modelValue, (newValue) => {
    dialog.value = newValue;
  });

  watch(dialog, (newValue) => {
    emit('update:modelValue', newValue);
    if (!newValue) {
      selectedContent.value = null;
    }
  });

  const onSelect = (content: any) => {
    selectedContent.value = content;
  };

  const confirmSelection = () => {
    if (selectedContent.value) {
      emit('select', selectedContent.value);
      closeModal();
    }
  };

  const closeModal = () => {
    emit('close')
    dialog.value = false;
  };

  const cancelAndClose = () => {
    emit('cancel');
    closeModal();
  };

  const truncateContent = (content: string) => {
    return content.length > 50 ? content.slice(0, 50) + '...' : content;
  };

  onMounted(() => {
    console.log('ContentSelectionModal mounted');
    console.log('Filters:', props.filters);
  });
</script>

<style scoped>
.v-card-text {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
