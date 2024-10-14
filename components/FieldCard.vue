<template>
  <v-card outlined class="mb-4 field-card">
    <v-toolbar dense class="toolbar-gradient">
      <v-toolbar-title class="text-subtitle-1 text-capitalize">{{ fieldName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="!isEditing">
        <TooltipButton tooltipText="Edit" icon="mdi-pencil" :onClick="startEditing" />
      </template>
      <template v-else>
        <TooltipButton tooltipText="Save" icon="mdi-content-save" :onClick="saveChanges" :disabled="!isValid" />
        <TooltipButton tooltipText="Cancel" icon="mdi-close" :onClick="cancelEditing" />
      </template>
    </v-toolbar>
    <v-card-text v-if="!isEditing" class="content-area">
      <p style="white-space: pre-wrap;">{{ contentForDisplay }}</p>
    </v-card-text>
    <v-form v-else @submit.prevent="saveChanges" class="content-area">
      <v-text-field
        v-if="!isMultiline"
        v-model="editedContent"
        :label="fieldName"
        clearable
        :counter="maxChars"
        :rules="[v => (v && v.length <= maxChars) || `Max ${maxChars} characters`]"
        dense
      ></v-text-field>
      <v-textarea
        v-else
        v-model="editedContent"
        :label="fieldName"
        :rows="3"
        auto-grow
        clearable
        :counter="maxChars"
        :rules="[v => (v && v.length <= maxChars) || `Max ${maxChars} characters`]"
      ></v-textarea>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import TooltipButton from './TooltipButton.vue';

export default defineComponent({
  name: 'FieldCard',
  components: {
    TooltipButton,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    fieldName: {
      type: String,
      required: true,
    },
    maxChars: {
      type: Number,
      default: 100,
    },
    isMultiline: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const localContent = ref(props.modelValue || '');
    const editedContent = ref(localContent.value);

    watch(() => props.modelValue, (newValue) => {
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
        console.log('Saving changes:', editedContent.value);
        localContent.value = editedContent.value;
        isEditing.value = false;
        emit('update:value', editedContent.value);
      }
    };

    const cancelEditing = () => {
      editedContent.value = localContent.value;
      isEditing.value = false;
    };

    return {
      isEditing,
      editedContent,
      contentForDisplay,
      isValid,
      startEditing,
      saveChanges,
      cancelEditing,
    };
  },
});
</script>

<style scoped>
.field-card {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
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