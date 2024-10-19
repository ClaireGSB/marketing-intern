// app.vue

<template>
  <NuxtLayout>
    <v-app>
      <navBar />
      <navDrawer />
      <div class="NuxtPage">
        <NuxtPage />
      </div>
    </v-app>
  </NuxtLayout>
</template>

<script lang="ts" setup>
  import { useUserDataStore } from './stores/userdata';

  const userStore = useUserDataStore();

  // Use useAsyncData to fetch the initial data
  const { data, error } = await useAsyncData(
    'initUserData',
    async () => {
      await userStore.fetchUserData();
      // Return some data to satisfy useAsyncData
      return {
        initialized: true,
        userCount: userStore.users.length
      };
    },
    {
      // Options for useAsyncData
      server: true, // Fetch on server-side
      lazy: false, // Don't delay navigation
    }
  );

  // Handle any errors
  if (error.value) {
    console.error('Error initializing user data:', error.value);
  }

  // Log the result
  console.log('User data initialized:', data.value);
</script>

<style>
.NuxtPage {
  padding-top: 64px;
}
</style>
