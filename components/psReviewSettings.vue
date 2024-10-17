<template>
  <v-col cols="12">
    <h3 class="mb-4">5. Review settings</h3>
    <p>The following settings for {{ selectedContentType.display_name }} - {{ selectedSubType.name }} will apply</p>
    <v-btn @click="$emit('review')" outlined class="mt-4">
      <v-icon left>mdi-magnify</v-icon> Review Settings
    </v-btn>
  </v-col>
</template>

<script lang="ts">

export default {
  props: {
    selectedContentType: {
      type: Object,
      required: true,
    },
    selectedSubType: {
      type: Object,
      required: true,
    },
  },
  emits: ['review'],
};
</script>