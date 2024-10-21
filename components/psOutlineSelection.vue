// psOutlineSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">3. Choose Outline Option</h3>
    <ContentSelectionButtons
      v-model="localOutlineOption"
      :label="'Outline'"
      :selected-content="selectedOutline"
      :show-selected-content="true"
      :filters="{ content_type_id: 8, status: 'completed' }"
      @update:selected-content="handleSelectOutline($event)"
      @provide="handleProvideOutline"
    />

    <template v-if="selectedOutline">
      <v-col v-if="projectSetup" cols="12">
        <ProjectSetupHistory :projectSetup="projectSetup" />
      </v-col>
    </template>
  </v-col>
</template>


<script setup lang="ts">
  import { computed } from 'vue';
  import ProjectSetupHistory from './ProjectSetupHistory.vue';

  interface Outline {
    id: string;
    title?: string;
    content?: string;
  }

  interface Props {
    outlineOption: 'select' | 'provide' | null;
    projectSetup: object | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    outlineOption: null,
    projectSetup: null,
  });

  const emit = defineEmits<{
    (e: 'update:outlineOption', value: 'select' | 'provide' | null): void;
    (e: 'selectOutline'): void;
    (e: 'clearSelectedOutline'): void;
  }>();

  const localOutlineOption = ref(props.outlineOption);
  const selectedOutline = ref<Outline | null>(null);

  const handleSelectOutline = (content: any) => {
    if (content) {
      localOutlineOption.value = 'select';
      selectedOutline.value = content;
      emit('update:outlineOption', 'select');
      emit('selectOutline', content);
    } else {
      handleClearOutline();
    }
  };

  const handleProvideOutline = () => {
    localOutlineOption.value = 'provide';
    emit('clearSelectedOutline');
    emit('update:outlineOption', 'provide');
  };

  const handleClearOutline = () => {
    localOutlineOption.value = null;
    selectedOutline.value = null;
    emit('clearSelectedOutline');
    emit('update:outlineOption', null);
  };
</script>
