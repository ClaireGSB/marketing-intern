<template>
  <v-container>
    <v-row v-if="projectSetup">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Project Setup</v-card-title>
          <v-card-subtitle>This are the details provided to generate this content.</v-card-subtitle>
          <v-card-text>
            <p v-for="prop in ProjectSetupProperties" :key="prop.key">
              <strong>{{ prop.label }}: </strong>
              <span v-if="prop.value.length <= maxCharDisplay">{{ prop.value }}</span>
              <span v-else>
                {{ showFullText[prop.key] ? prop.value : prop.value.slice(0, maxCharDisplay) + '...' }}
                <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(prop.key)">
                  {{ showFullText[prop.key] ? 'See less' : 'See more' }}
                </a>
              </span>
            </p>
            <template v-if="selectedContentOutput">
              <p><strong>Content: </strong></p>
              <div class="d-flex align-center">
                <v-chip
                  color="primary"
                  class="mr-2 selected-content-chip"
                  @click="navigateToContent"
                >
                  {{ truncateContent(selectedContentOutput.content) }}
                </v-chip>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-container v-else>
      <v-alert type="warning">Project setup not found.</v-alert>
    </v-container>
    <v-row v-if="subtypeSettingsHistory">
      <v-col cols="12">
        <SubtypeSettingsHistory :subtypeSettingsHistory="subtypeSettingsHistory" />
      </v-col>
    </v-row>
    <v-container v-else>
      <v-alert type="warning">Settings history not found.</v-alert>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { UserInput } from '~/types/frontendTypes';
import { useRouter } from 'vue-router';

const props = defineProps<{
  contentOutputId: string;
}>();

const userStore = useUserDataStore();
const router = useRouter();

const projectSetup = ref<UserInput | null>(null);
const subtypeSettingsHistory = ref<SettingsInput | null>(null);
const selectedContentOutput = ref<ContentOutput | null>(null);
const showFullText = ref<{ [key: string]: boolean }>({});
const maxCharDisplay = 500;


onMounted(async () => {
  console.log('projectSetup', projectSetup.value);
  console.log('subtypeSettingsHistory', subtypeSettingsHistory.value);
  console.log('Mounted, fetching project setup and subtype settings history for content output ID:', props.contentOutputId);
  projectSetup.value = await userStore.fetchProjectSetupByContentOutput(props.contentOutputId);
  subtypeSettingsHistory.value = await userStore.fetchSubtypeSettingsHistoryByContentOutput(props.contentOutputId);
  console.log('projectSetup', projectSetup.value);
  console.log('subtypeSettingsHistory', subtypeSettingsHistory.value);
  if (projectSetup.value?.selected_content_output_id) {
    selectedContentOutput.value = userStore.getSelectedContentOutput(projectSetup.value.selected_content_output_id);
  }
});

const getContentTypeDisplayName = (contentTypeId: number) => {
  return userStore.getContentTypeDisplayNameById(contentTypeId);
};

const getContentSubTypeName = (contentSubTypeId: string) => {
  return userStore.getContentSubTypeNameById(contentSubTypeId);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const truncateContent = (content: string) => {
  return content.length > 50 ? content.slice(0, 50) + '...' : content;
};

const navigateToContent = () => {
  if (selectedContentOutput.value) {
    router.push(`/Content/${selectedContentOutput.value.id}`);
  }
};

const ProjectSetupProperties = computed(() => {
  if (!projectSetup.value) return [];

  const properties = [
    { key: 'content_type_id', label: 'Content Type', value: getContentTypeDisplayName(projectSetup.value.content_type_id) },
    { key: 'action', label: 'Action', value: projectSetup.value.action },
    { key: 'topic', label: 'Topic', value: projectSetup.value.topic },
    { key: 'ideas', label: 'Ideas', value: projectSetup.value.ideas },
    { key: 'repurpose_instructions', label: 'Repurpose Instructions', value: projectSetup.value.repurpose_instructions },
    { key: 'target_audience', label: 'Target Audience', value: projectSetup.value.target_audience },
    { key: 'guidelines', label: 'Guidelines', value: projectSetup.value.guidelines },
    { key: 'context', label: 'Context', value: projectSetup.value.context },
  ];

  // Only add the 'content' field if there's no selected content
  if (!selectedContentOutput.value) {
    properties.push({ key: 'content', label: 'Content', value: projectSetup.value.content });
  }

  return properties.filter(prop => {
    return prop.value !== undefined &&
      prop.value !== null &&
      prop.value !== '' &&
      (typeof prop.value !== 'string' || prop.value.trim() !== '');
  });
});

const toggleShowMore = (key: string) => {
  showFullText.value[key] = !showFullText.value[key];
};
</script>

<style scoped>
.v-card-text p {
  margin-bottom: 8px;
}

.selected-content-chip {
  cursor: pointer;
  transition: opacity 0.3s;
}

.selected-content-chip:hover {
  opacity: 0.8;
}
</style>
