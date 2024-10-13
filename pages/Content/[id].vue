// pages/Content/_id.vue

<template>
  <CreateViewContent :id="$route.params.id" />
</template>

<script setup lang="ts">
import { useUserDataStore } from '~/stores/userdata';

// const route = useRoute()
// const id = route.params.id;
// const userStore = useUserDataStore();
// // check if the project setup for this content output is already in the pinia store
// const ContentOutput = userStore.getContentOutputById(id);
// const ProjectSetupID = ContentOutput.project_setup_id;
// const ProjectSetup = userStore.getProjectSetup(ProjectSetupID);
// if (!ProjectSetup) {
//   // fetch the project setup if it's not in the store
//   console.log('ProjectSetup not in store, fetching...');
//   await userStore.fetchProjectSetupByContentOutput(id);
// } else {
//   console.log('ProjectSetup already in store');
// }



</script>