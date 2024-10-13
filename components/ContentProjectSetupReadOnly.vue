<template>
  <v-container v-if="projectSetup">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Project Setup Details</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <p><strong>Content Type:</strong> {{ getContentTypeDisplayName(projectSetup.content_type_id) }}</p>
            <p><strong>Content Subtype:</strong> {{ getContentSubTypeName(projectSetup.content_subtype_id) }}</p>
            <p><strong>Action:</strong> {{ projectSetup.action }}</p>
            <p v-if="projectSetup.topic"><strong>Topic:</strong> {{ projectSetup.topic }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <p v-if="projectSetup.target_audience"><strong>Target Audience:</strong> {{ projectSetup.target_audience }}</p>
            <p v-if="projectSetup.guidelines"><strong>Guidelines:</strong> {{ projectSetup.guidelines }}</p>
            <p v-if="projectSetup.context"><strong>Context:</strong> {{ projectSetup.context }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-alert type="warning">Project setup details not found.</v-alert>
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

const projectSetup = computed(() => 
  userStore.getProjectSetupByContentOutputId(props.contentOutputId)
);

onMounted(async () => {
  await userStore.fetchProjectSetupByContentOutput(props.contentOutputId);
});

const getContentTypeDisplayName = (contentTypeId: number) => {
  return userStore.getContentTypeDisplayNameById(contentTypeId);
};

const getContentSubTypeName = (contentSubTypeId: string) => {
  return userStore.getContentSubTypeNameById(contentSubTypeId);
};
</script>