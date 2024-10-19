// psReviewSettings.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">5. Review settings</h3>
    <p>The following settings for {{ selectedContentType.display_name }} - {{ selectedSubType.name }} will apply</p>
    <v-btn @click="$emit('review')" outlined class="mt-4">
      <v-icon left>mdi-magnify</v-icon> Review Settings
    </v-btn>
  </v-col>
</template>

<script setup lang="ts">
  // Define the shape of the content type and sub-type objects
  interface ContentType {
    display_name: string;
    // Add other properties if needed
  }

  interface SubType {
    name: string;
    // Add other properties if needed
  }

  // Define props
  interface Props {
    selectedContentType: ContentType;
    selectedSubType: SubType;
  }

  defineProps<Props>();

  // Define emits
  defineEmits<{
    (e: 'review'): void;
  }>();
</script>
