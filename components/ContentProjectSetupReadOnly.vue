<template>
  <v-container>
    <v-row v-if="projectSetup">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Project Setup</v-card-title>
          <v-card-subtitle>This are the details provided to generate this content.</v-card-subtitle>
          <v-card-text>
            <p v-for="prop in ProjectSetupProperties" :key="prop.key">
              <strong>{{ prop.label }}:</strong>
              {{ prop.value }}
            </p>
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

const props = defineProps<{
  contentOutputId: string;
}>();

const userStore = useUserDataStore();

const projectSetup = ref<UserInput | null>(null);
const subtypeSettingsHistory = ref<SettingsInput | null>(null);

onMounted(async () => {
  console.log('projectSetup', projectSetup.value);
  console.log('subtypeSettingsHistory', subtypeSettingsHistory.value);
  console.log('Mounted, fetching project setup and subtype settings history for content output ID:', props.contentOutputId);
  projectSetup.value = await userStore.fetchProjectSetupByContentOutput(props.contentOutputId);
  subtypeSettingsHistory.value = await userStore.fetchSubtypeSettingsHistoryByContentOutput(props.contentOutputId);
  console.log('projectSetup', projectSetup.value);
  console.log('subtypeSettingsHistory', subtypeSettingsHistory.value);
});

const getContentTypeDisplayName = (contentTypeId: number) => {
  return userStore.getContentTypeDisplayNameById(contentTypeId);
};

const getContentSubTypeName = (contentSubTypeId: string) => {
  return userStore.getContentSubTypeNameById(contentSubTypeId);
};


const ProjectSetupProperties = computed(() => {
  if (!projectSetup.value) return [];

  const properties = [
    { key: 'content_type_id', label: 'Content Type', value: getContentTypeDisplayName(projectSetup.value.content_type_id) },
    { key: 'content_subtype_id', label: 'Content Subtype', value: getContentSubTypeName(projectSetup.value.content_subtype_id) },
    { key: 'action', label: 'Action', value: projectSetup.value.action },
    { key: 'topic', label: 'Topic', value: projectSetup.value.topic },
    { key: 'target_audience', label: 'Target Audience', value: projectSetup.value.target_audience },
    { key: 'guidelines', label: 'Guidelines', value: projectSetup.value.guidelines },
    { key: 'context', label: 'Context', value: projectSetup.value.context },
  ];

  return properties.filter(prop => {
    return prop.value !== undefined &&
      prop.value !== null &&
      prop.value !== '' &&
      (typeof prop.value !== 'string' || prop.value.trim() !== '');
  });
});
</script>

<style scoped>
.v-card-text p {
  margin-bottom: 8px;
}
</style>
