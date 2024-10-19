<template>
  <v-container>
    <v-row v-if="projectSetup">
      <v-col cols="12" md="6">
        <ProjectSetupHistory :projectSetup="projectSetup" />
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

</script>

<style scoped>
  .v-card-text p {
    margin-bottom: 8px;
    white-space: pre-wrap;
  }
</style>
