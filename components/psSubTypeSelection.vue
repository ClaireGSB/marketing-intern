// psSubTypeSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">2. Select Sub-Type</h3>
    <v-select
      :modelValue="selectedSubType"
      @update:modelValue="$emit('update:modelValue', $event)"
      :items="possibleSubTypes"
      item-title="name"
      label="Select Sub-Type"
      required
      return-object
    ></v-select>
  </v-col>
</template>

<script lang="ts">

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
  emits: ['update:modelValue'],
};
</script>