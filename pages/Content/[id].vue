// pages/Content/_id.vue

<template>
  <CreateViewContent :id="$route.params.id" />
</template>

<script setup lang="ts">
import { useUserDataStore } from '~/stores/userdata';
const route = useRoute()
const id = route.params.id;
const userStore = useUserDataStore();
userStore.fetchProjectSetup(id);

</script>