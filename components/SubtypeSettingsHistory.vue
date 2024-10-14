<!-- SubtypeSettingsHistory.vue -->
<template>
  <v-card v-if="subtypeSettingsHistory" class="mt-4">
    <v-card-title>Subtype Settings History</v-card-title>
    <v-card-subtitle>When this content was created, these were your subtype settings</v-card-subtitle>
    <v-card-text>
      <div v-for="(value, key) in displayableSettings" :key="key">
        <template v-if="key !== 'examples'">
          <p><strong>{{ formatKey(key) }}:</strong> {{ value }}</p>
        </template>
        <template v-else>
          <div v-if="groupedExamples.good.length">
            <p><strong>Good Examples</strong></p>
            <v-expansion-panels>
              <v-expansion-panel v-for="(example, index) in groupedExamples.good" :key="index">
                <v-expansion-panel-title>
                  {{ index + 1 }}. {{ example.name }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p v-if="example.content"><strong>Content:</strong> {{ example.content }}</p>
                  <p v-if="example.explanation"><strong>Explanation:</strong> {{ example.explanation }}</p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <div v-if="groupedExamples.bad.length">
            <p class="mt-4"><strong>Bad Examples</strong></p>
            <v-expansion-panels>
              <v-expansion-panel v-for="(example, index) in groupedExamples.bad" :key="index">
                <v-expansion-panel-title>
                  {{ index + 1 }}. {{ example.name }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p v-if="example.content"><strong>Content:</strong> {{ example.content }}</p>
                  <p v-if="example.explanation"><strong>Explanation:</strong> {{ example.explanation }}</p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <p v-if="!groupedExamples.good.length && !groupedExamples.bad.length">No examples available</p>
        </template>
      </div>
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
    if (value !== null && value !== undefined && value !== '' && key !== 'id') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
});

const groupedExamples = computed(() => {
  const good: Example[] = [];
  const bad: Example[] = [];

  if (props.subtypeSettingsHistory && props.subtypeSettingsHistory.examples) {
    props.subtypeSettingsHistory.examples.forEach((example: Example) => {
      if (example.example_type.toLowerCase() === 'good') {
        good.push(example);
      } else {
        bad.push(example);
      }
    });
  }

  return { good, bad };
});
</script>

<style scoped>
.v-card-text p {
  margin-bottom: 8px;
}

</style>
