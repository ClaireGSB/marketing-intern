<template>
  <NuxtLayout>
    <v-app>
      <navBar />
      <navDrawer />
      <NuxtPage />
    </v-app>
  </NuxtLayout>
</template>

<script lang="ts" setup>
  import { useUserDataStore } from './stores/userdata';

  const userStore = useUserDataStore();
  // use the store action to initialize the data
  onMounted(async () => {
    await userStore.fetchUserData();
    console.log(userStore.user);
  });
</script>