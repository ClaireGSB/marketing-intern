<template>
  <v-card outlined class="mb-4 field-card">
    <v-toolbar density="compact" class="toolbar-gradient">
      <v-toolbar-title class="text-subtitle-1 text-capitalize" v-if="!isEditing || isMultiline">
        <span class="field-name">{{ fieldName }}:</span> <span v-if="!isMultiline" class="field-content">{{ contentForDisplay }}</span>
      </v-toolbar-title>
      <v-text-field
        v-else-if="!isMultiline"
        v-model="editedContent"
        :label="fieldName"
        dense
        hide-details
        class="mt-1"
        @keyup.enter="saveChanges"
        @keyup.esc="cancelEditing"
      ></v-text-field>
      <v-spacer></v-spacer>
      <template v-if="!isEditing">
        <TooltipButton tooltipText="Edit" icon="mdi-pencil" :onClick="startEditing" />
      </template>
      <template v-else>
        <TooltipButton tooltipText="Save" icon="mdi-content-save" :onClick="saveChanges" :disabled="!isValid" />
        <TooltipButton tooltipText="Cancel" icon="mdi-close" :onClick="cancelEditing" />
      </template>
    </v-toolbar>
    <v-card-text v-if="!isEditing && isMultiline" class="content-area">
      <p style="white-space: pre-wrap;">{{ contentForDisplay }}</p>
    </v-card-text>
    <div v-if="isEditing && isMultiline" class="content-area">
      <v-textarea
        v-model="editedContent"
        :label="fieldName"
        :rows="3"
        auto-grow
        max-rows="10"
        clearable
        :counter="maxChars"
        :rules="[v => (v && v.length <= maxChars) || `Max ${maxChars} characters`]"
      ></v-textarea>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import TooltipButton from './TooltipButton.vue';

  interface Props {
    value?: string;
    fieldName: string;
    maxChars?: number;
    isMultiline?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    value: '',
    maxChars: 100,
    isMultiline: false,
  });

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();

  const isEditing = ref(false);
  const localContent = ref(props.value);
  const editedContent = ref(localContent.value);

  watch(() => props.value, (newValue) => {
    localContent.value = newValue || '';
    if (!isEditing.value) {
      editedContent.value = localContent.value;
    }
  });

  const contentForDisplay = computed(() => localContent.value);

  const isValid = computed(() => {
    return editedContent.value.length <= props.maxChars;
  });

  const startEditing = () => {
    editedContent.value = localContent.value;
    isEditing.value = true;
  };

  const saveChanges = () => {
    if (isValid.value) {
      localContent.value = editedContent.value;
      isEditing.value = false;
      emit('update:value', editedContent.value);
    }
  };

  const cancelEditing = () => {
    editedContent.value = localContent.value;
    isEditing.value = false;
  };
</script>

<style scoped>
.field-card {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.field-name {
  font-weight: bold;
}

.field-content {
  font-weight: normal;
}

.toolbar-gradient {
  background: linear-gradient(to right, #f5f5f5, #e0e0e0);
}

.content-area {
  background-color: #ffffff;
  padding: 12px;
}

.v-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
</style>
