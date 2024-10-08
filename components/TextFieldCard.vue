<template>
  <v-card outlined class="mb-4 text-field-card">
    <v-toolbar class="toolbar-gradient">
      <v-toolbar-title class="text-h6 text-capitalize">{{ fieldName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="!isEditing">
        <TooltipButton tooltipText="Edit" icon="mdi-pencil" :onClick="startEditing" />
      </template>
      <template v-else>
        <TooltipButton tooltipText="Save" icon="mdi-content-save" :onClick="saveChanges" :disabled="!isValid" />
        <TooltipButton tooltipText="Cancel" icon="mdi-close" :onClick="cancelEditing" />
      </template>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text v-if="!isEditing" class="content-area">
      <p>{{ contentForDisplay }}</p>
    </v-card-text>
    <v-form v-else @submit.prevent="saveChanges" class="content-area">
      <v-card-text>
        <v-textarea v-model="editedContent" :label="fieldName" rows="3" auto-grow max-rows="10" clearable
          :counter="maxChars" :rules="[v => v.length <= maxChars || `Max ${maxChars} characters`]"></v-textarea>
      </v-card-text>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import TooltipButton from './TooltipButton.vue';
import ConfirmDialog from './ConfirmDialog.vue';

export default defineComponent({
  name: 'TextFieldCard',
  components: {
    TooltipButton,
    ConfirmDialog,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    fieldName: {
      type: String,
      required: true,
    },
    maxChars: {
      type: Number,
      default: 500,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editedContent = ref(props.value);
    const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);
    const localContent = ref(props.value);

    const contentForDisplay = computed(() => localContent.value);
    const isValid = computed(() => editedContent.value.length <= props.maxChars);

    const startEditing = () => {
      isEditing.value = true;
    };

    const saveChanges = () => {
      if (isValid.value) {
        isEditing.value = false;
        localContent.value = editedContent.value;
        emit('update:value', editedContent.value);
      }
    };

    const cancelEditing = () => {
      isEditing.value = false;
      editedContent.value = props.value;
    };

    const openClearConfirmDialog = () => {
      confirmDialog.value?.open();
    };

    return {
      isEditing,
      editedContent,
      contentForDisplay,
      isValid,
      startEditing,
      saveChanges,
      cancelEditing,
      openClearConfirmDialog,
      confirmDialog,
    };
  },
});
</script>

<style scoped>
.text-field-card {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.toolbar-gradient {
  background: linear-gradient(to right, #f5f5f5, #e0e0e0);
}

.content-area {
  background-color: #ffffff;
  padding: 16px;
}

.v-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
</style>
