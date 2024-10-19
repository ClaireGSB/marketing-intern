// psContentTypeSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">1. Select Content Type</h3>
    <v-row>
      <v-col v-for="type in contentTypes" :key="type.id" cols="12" sm="6" md="3">
        <v-card @click="$emit('select', type.id)" :color="selectedContentType.id === type.id ? 'primary' : ''"
          :class="{ 'elevation-8': selectedContentType.id === type.id }" class="selectable-card">
          <v-card-title>{{ type.display_name }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import type { ContentType } from '../types/contentTypes';

export default {
  props: {
    contentTypes: {
      type: Array as () => ContentType[],
      required: true,
    },
    selectedContentType: {
      type: Object as () => ContentType,
      required: true,
    },
  },
  emits: ['select'],
};
</script>
