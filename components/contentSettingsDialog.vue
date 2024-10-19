<template>
  <v-dialog v-model="showDialog" height="100%" :width="dialogWidth" :fullscreen="isSmallScreen"
    transition="dialog-bottom-transition" :content-class="['custom-dialog', isSmallScreen ? 'fullscreen-dialog' : '']"
    :retain-focus="false">
    <v-card class="custom-dialog-card d-flex flex-column">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ panelTitle }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="flex-grow-1 overflow-y-auto px-0 ">
        <div>
          <div class="section " v-if="isNewSubtype">
            <v-text-field v-model="name" label="Enter New Subtype name" :rules="[v => !!v || 'Name is required']"
              required class="mb-6">
              <template v-slot:append>
                <TooltipButton tooltipText="Save" icon="mdi-content-save" :onClick="saveName" />
              </template>
            </v-text-field>
          </div>
          <template v-else>
            <div class="section mb-8">
              <div class="section-header">
                <h2 class="section-title">General Settings</h2>
              </div>
              <FieldCard :value="localContentSubtypeName" fieldName="Name" :isMultiline="false"
                @update:value="updateField('name', $event)" />
              <FieldCard :value="targetAudience" fieldName="Target Audience" :isMultiline="false"
                @update:value="updateField('target_audience', $event)" />
              <FieldCard :value="guidelines" fieldName="Guidelines" :maxChars="maxChars" :isMultiline="true"
                @update:value="updateField('guidelines', $event)" />
              <FieldCard :value="context" fieldName="Context" :maxChars="maxChars" :isMultiline="true"
                @update:value="updateField('context', $event)" />
            </div>
            <v-divider></v-divider>

            <div class="section mb-8">
              <div class="section-header">
                <h2 class="section-title">Examples of Good Content</h2>
              </div>
              <div class="section-intro">
                <p>Examples of good content that reflects the voice, style, and tone you want emulated.</p>
              </div>
              <div v-for="example in goodExamples" :key="example.id" class="mb-4">
                <ExampleCard :example="example" @save="saveExample" @remove="removeExample" />
              </div>
              <v-btn @click="addExample('good')" outlined class="mt-4">
                <v-icon left>mdi-plus</v-icon> Add Good Example
              </v-btn>
            </div>
            <v-divider></v-divider>

            <div class="section mb-8">
              <div class="section-header">
                <h2 class="section-title">Examples of Bad Content</h2>
              </div>
              <div class="section-intro">
                <p>Examples of bad content that should be avoided.</p>
              </div>
              <div v-for="example in badExamples" :key="example.id" class="mb-4">
                <ExampleCard :example="example" @save="saveExample" @remove="removeExample" />
              </div>
              <v-btn @click="addExample('bad')" outlined class="mt-4">
                <v-icon left>mdi-plus</v-icon> Add Bad Example
              </v-btn>
            </div>
            <div class="section mb-8 d-flex justify-end">
            <v-btn color="error" variant="plain" @click="confirmDelete">
              Delete Content Subtype
            </v-btn>
          </div>
          </template>
        </div>
        <!-- <v-progress-circular v-else indeterminate></v-progress-circular> -->
      </v-card-text>
    </v-card>
  </v-dialog>
  <ConfirmDialog ref="confirmDialog" title="Confirm Delete"
    message="Are you sure you want to delete this content subtype? This action cannot be undone."
    confirmText="Delete Content Subtype" @confirm="deleteContentSubtype" />
</template>


<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { useDisplay } from 'vuetify';
  import { Example } from '../types/frontendTypes';
  import { useUserDataStore } from '../stores/userdata';

  const props = defineProps<{
    modelValue: boolean;
    contentTypeId: number;
    contentSubtypeId?: string | null;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'saved'): void;
    (e: 'deleted'): void;
  }>();

  const userStore = useUserDataStore();

  // --------- Dialog component settings ---------

  const showDialog = ref(props.modelValue);
  const maxChars = 500;
  const { smAndDown, width } = useDisplay();
  const isSmallScreen = computed(() => smAndDown.value);
  const dialogWidth = computed(() => {
    return width.value >= 1000 ? '1000px' : '100%';
  });

  const panelTitle = computed(() => {
    if (isNewSubtype.value) {
      return `Create new Content Subtype for ${contentTypeDisplayName.value}`;
    } else {
      return `Settings for ${contentTypeDisplayName.value} - ${localContentSubtypeName.value}`;
    }
  });

  // --------- Initialize and Reset State ---------

  const isNewSubtype = ref(false);
  const examples = ref<Example[]>([]);
  const guidelines = ref('');
  const context = ref('');
  const targetAudience = ref('');
  const localContentSubtypeID = ref('');
  const localContentSubtypeName = ref('');
  const contentTypeDisplayName = ref('');

  watch(() => props.modelValue, (newValue) => {
    showDialog.value = newValue;
    if (newValue) {
      // initialize / reset all values when dialog is opened
      resetDialogState()
    }
  });

  const resetDialogState = () => {
    isNewSubtype.value = !props.contentSubtypeId;
    contentTypeDisplayName.value = userStore.getContentTypeDisplayNameById(props.contentTypeId);
    localContentSubtypeID.value = props.contentSubtypeId || '';
    localContentSubtypeName.value = userStore.getContentSubTypeNameById(localContentSubtypeID.value);
    guidelines.value = userStore.getFieldsForContentSubType(localContentSubtypeID.value).guidelines
    context.value = userStore.getFieldsForContentSubType(localContentSubtypeID.value).context
    targetAudience.value = userStore.getFieldsForContentSubType(localContentSubtypeID.value).target_audience
    name.value = '';
    getExamplesFromStore();
  };

  watch(showDialog, (newValue) => {
    emit('update:modelValue', newValue);
  });

  const getExamplesFromStore = () => {
    if (props.contentSubtypeId) {
      // We're editing a content subtype, may be examples to fetch
      examples.value = userStore.getExamplesByContentSubTypeID(props.contentSubtypeId);
    } else {
      // We're creating a new content subtype
    }
  };

  const goodExamples = computed(() => {
    return examples.value.filter(e => e.example_type === 'good');
  });

  const badExamples = computed(() => {
    return examples.value.filter(e => e.example_type === 'bad');
  });

  const close = () => {
    emit('update:modelValue', false);
    // clear data
    isNewSubtype.value = false;
    name.value = '';
    guidelines.value = '';
    context.value = '';
    examples.value = [];
    localContentSubtypeID.value = '';
    localContentSubtypeName.value = '';
  };

  // --------- Create new Subtype by Saving its Name ---------

  const name = ref('');

  const saveName = async () => {
    if (props.contentSubtypeId || !name) return;
    if (!name.value) return;
    // save new content subtype to database
    console.log('Saving new content subtype:', name.value);
    const newSubtype = await userStore.createContentSubType(props.contentTypeId, name.value);
    localContentSubtypeID.value = newSubtype.id;
    localContentSubtypeName.value = newSubtype.name;
    isNewSubtype.value = false;
    emit('saved');
    // reset fields
    guidelines.value = '';
    context.value = '';
    targetAudience.value = '';
  };

  // --------- Example Operations ---------

  const addExample = (type: 'good' | 'bad') => {
    const newExample: Example = {
      content: '',
      example_type: type,
      explanation: '',
      name: '',
      id: '',
      content_subtype_id: localContentSubtypeID.value,
    };
    examples.value.push(newExample);
  };

  const saveExample = async (example: Example) => {
    if (example.id === '') {
      // New example
      console.log('Saving new example:', example);
      const newEx = await userStore.addExample(example, localContentSubtypeID.value);
      console.log('New example in dialog:', newEx);
    } else {
      // Existing example
      console.log('Updating example:', example);
      await userStore.updateExample(example.id, example);
    }
    // Update the local examples array
    getExamplesFromStore();
  };

  const removeExample = async (exampleID: string) => {
    await userStore.deleteExample(exampleID);
    examples.value = examples.value.filter(e => e.id !== exampleID);
    // Update the local examples array
    getExamplesFromStore();
  };

  // --------- Update Other Fields ---------

  const updateField = async (field: 'guidelines' | 'context' | 'target_audience' | 'name', value: string) => {
    userStore.updateContentSubType(localContentSubtypeID.value, field, value);
  };

  // --------- Delete Subtype ---------

  const confirmDialog = ref(null);

  const confirmDelete = () => {
    confirmDialog.value.open();
  };

  const deleteContentSubtype = async () => {
    try {
      await userStore.deleteContentSubType(localContentSubtypeID.value);
      emit('update:modelValue', false); // Close the dialog
      emit('deleted'); // Emit an event to notify the parent component
    } catch (error) {
      console.error('Failed to delete content subtype:', error);
      // You might want to show an error message to the user here
    }
  };
</script>

<style scoped>
.custom-dialog {
  margin-top: 64px !important;
  height: calc(100% - 64px) !important;
}

.custom-dialog-card {
  height: 100%;
}

.fullscreen-dialog {
  margin-top: 0 !important;
  height: 100% !important;
}

.section {
  padding: 24px;
  border-radius: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
}

.section-intro {
  margin-bottom: 16px;
}

.v-btn {
  text-transform: none;
}
</style>
