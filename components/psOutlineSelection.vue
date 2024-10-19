// psOutlineSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">3. Choose Outline Option</h3>
    <!-- <template v-if="!selectedOutline"> -->
      <v-btn
        @click="handleSelectOutline"
        class="mr-2"
        :prepend-icon="outlineOption === 'select' ? 'mdi-check-circle' : ''"
      >
        Select Existing Outline
      </v-btn>
      <v-btn
        @click="handleProvideOutline"
        :prepend-icon="outlineOption === 'provide' ? 'mdi-check-circle' : ''"
      >
        Provide New Outline
      </v-btn>
    <!-- </template> -->

    <template v-if="selectedOutline">
      <v-col cols="12" class="d-flex align-center mt-4">
        <SelectedContentTag
          :content-output-id="selectedOutline.id"
          :removable="true"
          @remove="handleClearOutline"
        >
          {{ selectedOutline.title || 'Selected Outline' }}
        </SelectedContentTag>
      </v-col>
      <v-col cols="12" class="mt-4">
        <v-textarea
          v-model="selectedOutlineContent"
          label="Selected Outline"
          readonly
          
          auto-grow
          rows="5"
          max-rows="10"
        ></v-textarea>
      </v-col>
      <v-col v-if="projectSetup" cols="12">
        <ProjectSetupHistory :projectSetup="projectSetup" />
      </v-col>
    </template>
  </v-col>
</template>


<script lang="ts">
import ProjectSetupHistory from './ProjectSetupHistory.vue';

export default {
  props: {
    outlineOption: {
      type: String as () => 'select' | 'provide' | null,
      default: null,
    },
    projectSetup: {
      type: Object,
      default: null,
    },
    selectedOutline: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:outlineOption', 'selectOutline', 'clearSelectedOutline'],
  setup(props, { emit }) {
    const selectedOutlineContent = computed(() => {
      if (props.selectedOutline && props.selectedOutline.content) {
        return props.selectedOutline.content;
      }
      return '';
    });
    const handleSelectOutline = () => {
      emit('update:outlineOption', 'select');
      emit('selectOutline');
    };

    const handleProvideOutline = () => {
      emit('clearSelectedOutline');
      emit('update:outlineOption', 'provide');
    };

    const handleClearOutline = () => {
      emit('clearSelectedOutline');
      emit('update:outlineOption', null);
    };

    return {
      handleSelectOutline,
      handleProvideOutline,
      handleClearOutline,
      selectedOutlineContent,
    };
  },
};
</script>