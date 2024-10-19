// psSubTypeSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">2. Select Sub-Type</h3>
    <v-select v-model="localSelectedSubType" :items="possibleSubTypes" item-title="name" item-value="id"
      label="Select Sub-Type" required return-object @update:modelValue="onSubTypeChange"></v-select>
  </v-col>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface SubType {
    id: string;
    name: string;
  }

  // Define props
  interface Props {
    possibleSubTypes: SubType[];
    selectedSubType: SubType;
  }

  const props = defineProps<Props>();

  // Define emits
  const emit = defineEmits<{
    (e: 'update:modelValue', value: SubType): void;
    (e: 'update', value: SubType): void;
  }>();

  const localSelectedSubType = ref(props.selectedSubType);

  watch(() => props.selectedSubType, (newValue) => {
    localSelectedSubType.value = newValue;
  });

  const onSubTypeChange = (newSubType: SubType) => {
    localSelectedSubType.value = newSubType;
    emit('update:modelValue', newSubType);
    emit('update', newSubType);
  };
</script>
