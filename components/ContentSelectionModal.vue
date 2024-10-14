<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Select Content</span>
      </v-card-title>
      <v-card-text>
        <v-alert v-if="selectedContent" type="info" class="mb-4">
          Selected: {{ selectedContent.content_type }} - {{ truncateContent(selectedContent.content) }}
        </v-alert>
        <ContentTable :selectable="true" @select="onSelect" :allowed-statuses="allowedStatuses" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeModal">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="confirmSelection" :disabled="!selectedContent">
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, computed, watch } from 'vue';

export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    allowedStatuses: {
      type: Array as () => string[],
      default: () => ['completed']
    }
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { emit }) {
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

    const onSelect = (content) => {
      selectedContent.value = content;
    };

    const confirmSelection = () => {
      if (selectedContent.value) {
        emit('select', selectedContent.value);
        closeModal();
      }
    };

    const closeModal = () => {
      dialog.value = false;
    };

    const truncateContent = (content: string) => {
      return content.length > 50 ? content.slice(0, 50) + '...' : content;
    };

    return {
      dialog,
      selectedContent,
      onSelect,
      confirmSelection,
      closeModal,
      truncateContent
    };
  }
};
</script>

<style scoped>
.v-card-text {
  max-height: 70vh;
  overflow-y: auto;
}
</style>