<template>
  <v-col cols="12">
    <h3 class="mb-4">3. Choose Outline Option</h3>
    <v-btn-toggle
      :modelValue="outlineOption"
      @update:modelValue="$emit('update:outlineOption', $event)"
      mandatory
    >
      <v-btn value="select">Select Existing Outline</v-btn>
      <v-btn value="provide">Provide New Outline</v-btn>
    </v-btn-toggle>
    
    <template v-if="outlineOption === 'select'">
      <v-col cols="12">
        <v-btn @click="$emit('selectOutline')" color="primary">
          Select Outline
        </v-btn>
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
      required: true,
    },
    projectSetup: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:outlineOption', 'selectOutline'],
};
</script>