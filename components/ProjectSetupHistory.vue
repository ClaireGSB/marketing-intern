<!-- ProjectSetupHistory.vue -->
<template>
  <v-card v-if="projectSetup">
    <v-card-title>Project Setup</v-card-title>
    <v-card-subtitle>These are the details provided to generate this {{ getContentTypeDisplayName(projectSetup.content_type_id) }}.</v-card-subtitle>
    <v-card-text>
      <p v-for="prop in projectSetupProperties" :key="prop.key">
        <strong>{{ prop.label }}: </strong>
        <span v-if="prop.value.length <= maxCharDisplay">{{ prop.value }}</span>
        <span v-else>
          {{ showFullText[prop.key] ? prop.value : prop.value.slice(0, maxCharDisplay) + '...' }}
          <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(prop.key)">
            {{ showFullText[prop.key] ? 'See less' : 'See more' }}
          </a>
        </span>
      </p>
      <template v-if="projectSetup.selected_content_output_id">
        <p><strong>Content: </strong></p>
        <SelectedContentTag :content-output-id="projectSetup.selected_content_output_id" />
      </template>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">Project setup not found.</v-alert>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import SelectedContentTag from './SelectedContentTag.vue';
import { UserInput } from '~/types/frontendTypes';

const props = defineProps<{
  projectSetup: UserInput | null;
}>();

const userStore = useUserDataStore();
const showFullText = ref<{ [key: string]: boolean }>({});
const maxCharDisplay = 200;

const toggleShowMore = (key: string) => {
  showFullText.value[key] = !showFullText.value[key];
};

const getContentTypeDisplayName = (contentTypeId: number) => {
  return userStore.getContentTypeDisplayNameById(contentTypeId);
};

const projectSetupProperties = computed(() => {
  if (!props.projectSetup) return [];

  return [
    { key: 'content_type_id', label: 'Content Type', value: getContentTypeDisplayName(props.projectSetup.content_type_id) },
    { key: 'action', label: 'Action', value: props.projectSetup.action },
    { key: 'topic', label: 'Topic', value: props.projectSetup.topic },
    { key: 'ideas', label: 'Ideas', value: props.projectSetup.ideas },
    { key: 'repurpose_instructions', label: 'Repurpose Instructions', value: props.projectSetup.repurpose_instructions },
    { key: 'target_audience', label: 'Target Audience', value: props.projectSetup.target_audience },
    { key: 'guidelines', label: 'Guidelines', value: props.projectSetup.guidelines },
    { key: 'context', label: 'Context', value: props.projectSetup.context },
    { key: 'outline', label: 'Outline', value: props.projectSetup.outline },
    { key: 'seo_phrase', label: 'SEO Phrase', value: props.projectSetup.seo_phrase },
    // Only add 'content' if there's no selected content
    ...(props.projectSetup.selected_content_output_id ? [] : [{ key: 'content', label: 'Content', value: props.projectSetup.content }]),
  ].filter(prop => prop.value != null && prop.value !== '' && (typeof prop.value !== 'string' || prop.value.trim() !== ''));
});
</script>

<style scoped>
.v-card-text p {
  margin-bottom: 8px;
  white-space: pre-wrap;
}
</style>