<template>
  <v-card outlined class="mb-4 example-card">
    <v-toolbar density="compact" class="toolbar-gradient">
      <v-tooltip :text="'This is a ' + example.example_type + ' example'" location="top start">
        <template v-slot:activator="{ props }">
      <v-icon class="ml-4" v-bind="props" size="small" :color="(example.example_type === 'good') ? 'teal-darken-1' :'red-darken-2'">mdi-thumb-up</v-icon>
    </template>
  </v-tooltip>
      <v-toolbar-title class="text-h6 text-capitalize">{{ localExample.name || 'Add example details' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="!isEditing">
        <TooltipButton tooltipText="Edit" icon="mdi-pencil" :onClick="() => isEditing = true" />
        <TooltipButton tooltipText="Delete" icon="mdi-delete" :onClick="openDeleteConfirmDialog" />
      </template>
      <template v-else>
        <TooltipButton tooltipText="Save Example" icon="mdi-content-save" :onClick="saveExample"
          :disabled="!isFormValid" />
        <TooltipButton :tooltipText="(!isNewExample) ? 'Cancel' : 'Delete'"
          :icon="(!isNewExample) ? 'mdi-close' : 'mdi-delete'"
          :onClick="(!isNewExample) ? cancelEditing : openDeleteConfirmDialog" />
      </template>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text v-if="!isEditing" class="content-area">
      <p><strong>Example:</strong> {{ contentForDisplay }}</p>
      <p v-if="localExample.explanation"><strong>Explanation:</strong> {{ explanationForDisplay }}</p>
    </v-card-text>
    <v-form v-else ref="form" @submit.prevent="saveExample" class="content-area">
      <v-card-text>
        <v-text-field v-model="localExample.name" label="Name" :rules="[v => !!v || 'Name is required']"
          required></v-text-field>
        <v-textarea v-model="localExample.content" label="Example" rows="3" auto-grow max-rows="10"
          class="example-textarea" :rules="[v => !!v || 'Example content is required']" required></v-textarea>
        <v-text-field v-model="localExample.explanation" label="Explanation (optional)"></v-text-field>
      </v-card-text>
    </v-form>
    <ConfirmDialog ref="confirmDialog" title="Confirm Delete" message="Are you sure you want to delete this example?"
      confirmText="Delete Example" @confirm="removeExample" />
  </v-card>
</template>


<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
// import { LocalExample } from '../../services/mockApiClient';
import ConfirmDialog from './ConfirmDialog.vue';


export default defineComponent({
  name: 'ContentSettingsExampleCard',
  props: {
    example: {
      type: Object as () => LocalExample,
      required: true,
    },
  },
  emits: ['save', 'remove'],
  setup(props, { emit }) {

    const isEditing = ref(false);
    const form = ref<any>(null);

    const localExample = ref({ ...props.example });
    const contentForDisplay = computed(() => truncateText(localExample.value.content || ''));
    const explanationForDisplay = computed(() => truncateText(localExample.value.explanation || ''));
    const isNewExample = ref(false);

    const isFormValid = computed(() => {
      return !!localExample.value.name && !!localExample.value.content;
    });

    const saveExample = async () => {
      console.log('Saving example:', localExample.value);
      isEditing.value = false;
      const valuesToSave = { ...localExample.value };

      emit('save', valuesToSave);
    };

    const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);

    const openDeleteConfirmDialog = () => {
      confirmDialog.value?.open();
    };

    const removeExample = () => {
      console.log('Removing example:', localExample.value);
      emit('remove', localExample.value.id);
    };

    const cancelEditing = () => {
      console.log('Cancelling editing');
      isEditing.value = false;
      if (isNewExample.value) {
        // Clear the form for new examples
        localExample.value = { id: localExample.value.id, name: '', content: '', explanation: '', example_type: localExample.value.example_type };
      } else {
        // Reset to original values for existing examples
        localExample.value = { ...props.example };
        console.log('Resetting example:', localExample.value);
      }
    };

    const truncateText = (text: string) => {
      return text.length > 100 ? text.slice(0, 97) + '...' : text;
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };

    onMounted(() => {
      console.log('Example card mounted');
      // if the example doesn't have content, it's a new example
      // set isEditing to true and IsNewExample to true
      isEditing.value = !props.example.content;
      isNewExample.value = !props.example.content;
    });

    return {
      isEditing,
      saveExample,
      removeExample,
      truncateText,
      formatDate,
      contentForDisplay,
      explanationForDisplay,
      form,
      isFormValid,
      cancelEditing,
      isNewExample,
      localExample,
      openDeleteConfirmDialog,
      confirmDialog,
    };
  },
});
</script>

<style scoped>
.example-card {
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

.example-textarea {
  background-color: #fafafa;
}
</style>
