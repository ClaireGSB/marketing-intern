<template>
  <v-container>
    <v-card v-for="(item, index) in content" :key="index" class="mb-4">
      <v-card-title>{{ item.title }}</v-card-title>
      <v-card-text>
        <pre>{{ item.content }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { FinalContentItem } from '../types/frontendTypes';

export default {
  props: {
    content: {
      type: Array as () => FinalContentItem[],
      required: true,
    },
  },
};
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>