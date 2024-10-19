// psSubTypeSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">2. Select Sub-Type</h3>
    <v-select
      v-model="localSelectedSubType"
      :items="possibleSubTypes"
      item-title="name"
      item-value="id"
      label="Select Sub-Type"
      required
      return-object
      @update:modelValue="onSubTypeChange"
    ></v-select>
  </v-col>
</template>

<script lang="ts">
import { ref, watch } from 'vue';

export default {
  props: {
    possibleSubTypes: {
      type: Array as () => { id: string; name: string }[],
      required: true,
    },
    selectedSubType: {
      type: Object as () => { id: string; name: string },
      required: true,
    },
  },
  emits: ['update:modelValue', 'update'],
  setup(props, { emit }) {
    const localSelectedSubType = ref(props.selectedSubType);

    watch(() => props.selectedSubType, (newValue) => {
      localSelectedSubType.value = newValue;
    });

    const onSubTypeChange = (newSubType: { id: string; name: string }) => {
      localSelectedSubType.value = newSubType;
      emit('update:modelValue', newSubType);
      emit('update', newSubType);
    };

    return {
      localSelectedSubType,
      onSubTypeChange,
    };
  },
};
</script>
