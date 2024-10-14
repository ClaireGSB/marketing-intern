<!-- SubtypeSettingsHistory.vue -->
<template>
  <v-card v-if="subtypeSettingsHistory" class="mt-4">
    <v-card-title>Content Subtype: {{ subtypeName }}</v-card-title>
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
                  <p v-if="example.content">
                    <strong>Content:</strong>
                    <span v-if="example.content.length <= maxCharDisplay">{{ example.content }}</span>
                    <span v-else>
                      {{ showFullText[`good-${index}-content`] ? example.content : example.content.slice(0, maxCharDisplay) + '...' }}
                      <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(`good-${index}-content`)">
                        {{ showFullText[`good-${index}-content`] ? 'See less' : 'See more' }}
                      </a>
                    </span>
                  </p>
                  <p v-if="example.explanation">
                    <strong>Explanation:</strong>
                    <span v-if="example.explanation.length <= maxCharDisplay">{{ example.explanation }}</span>
                    <span v-else>
                      {{ showFullText[`good-${index}-explanation`] ? example.explanation : example.explanation.slice(0, maxCharDisplay) + '...' }}
                      <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(`good-${index}-explanation`)">
                        {{ showFullText[`good-${index}-explanation`] ? 'See less' : 'See more' }}
                      </a>
                    </span>
                  </p>
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
                  <p v-if="example.content">
                    <strong>Content:</strong>
                    <span v-if="example.content.length <= maxCharDisplay">{{ example.content }}</span>
                    <span v-else>
                      {{ showFullText[`good-${index}-content`] ? example.content : example.content.slice(0, maxCharDisplay) + '...' }}
                      <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(`good-${index}-content`)">
                        {{ showFullText[`good-${index}-content`] ? 'See less' : 'See more' }}
                      </a>
                    </span>
                  </p>
                  <p v-if="example.explanation">
                    <strong>Explanation:</strong>
                    <span v-if="example.explanation.length <= maxCharDisplay">{{ example.explanation }}</span>
                    <span v-else>
                      {{ showFullText[`good-${index}-explanation`] ? example.explanation : example.explanation.slice(0, maxCharDisplay) + '...' }}
                      <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(`good-${index}-explanation`)">
                        {{ showFullText[`good-${index}-explanation`] ? 'See less' : 'See more' }}
                      </a>
                    </span>
                  </p>
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
const maxCharDisplay = 500;
const showFullText = ref<{ [key: string]: boolean }>({});

const formatKey = (key: string) => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const displayableSettings = computed(() => {
  if (!props.subtypeSettingsHistory) return {};

  return Object.entries(props.subtypeSettingsHistory).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '' && key !== 'id' && key !== 'name') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
});

const subtypeName = computed(() => {
  return props.subtypeSettingsHistory?.name || 'Name not found';
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

const toggleShowMore = (key: string) => {
  showFullText.value[key] = !showFullText.value[key];
};
</script>

<style scoped>
.v-card-text p {
  margin-bottom: 8px;
}

</style>
