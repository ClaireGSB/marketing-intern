<!-- SubtypeSettingsHistory.vue -->
<template>
  <v-card v-if="subtypeSettingsHistory" class="mt-4">
    <v-card-title>Subtype Settings History</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="(value, key) in displayableSettings" :key="key">
          <v-list-item-title class="font-weight-bold">{{ formatKey(key) }}</v-list-item-title>
          <v-list-item-subtitle v-if="key !== 'examples'" class="text--primary">
            {{ value }}
          </v-list-item-subtitle>
          <template v-else>
            <v-expansion-panels v-if="value && value.length">
              <v-expansion-panel v-for="(example, index) in value" :key="index">
                <v-expansion-panel-title>
                  Example {{ index + 1 }}: {{ example.name }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p><strong>Type:</strong> {{ example.example_type }}</p>
                  <p v-if="example.content"><strong>Content:</strong> {{ example.content }}</p>
                  <p v-if="example.explanation"><strong>Explanation:</strong> {{ example.explanation }}</p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <p v-else class="text--primary">No examples available</p>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { SettingsInput, Example } from '~/types/frontendTypes';

const props = defineProps({
  subtypeSettingsHistory: {
    type: Object as PropType<SettingsInput>,
    required: true,
  },
});

const formatKey = (key: string) => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const displayableSettings = computed(() => {
  if (!props.subtypeSettingsHistory) return {};

  return Object.entries(props.subtypeSettingsHistory).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
});
</script>

<style scoped>
.v-list-item-title {
  color: rgba(0, 0, 0, 0.87) !important;
}

.v-list-item-subtitle {
  color: rgba(0, 0, 0, 0.6) !important;
}

.text--primary {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>