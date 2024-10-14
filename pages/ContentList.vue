<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" class="d-flex flex-column relative-container pa-0">
        <h1 class="text-h4 px-4 py-10">Content Outputs</h1>
        <v-container fluid class="flex-grow-1 overflow-y-auto">
          <v-btn color="primary" class="mb-4" @click="createNewContent">Create New Content</v-btn>
          <ContentTable @view="viewContent" />
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { useRouter } from 'vue-router';
import ContentTable from '~/components/ContentTable.vue';

const userStore = useUserDataStore();
const router = useRouter();

const createNewContent = () => {
  router.push('/Content');
};

const viewContent = (contentId: string) => {
  router.push(`/Content/${contentId}`);
};

onMounted(async () => {
  if (userStore.contentOutputs.length === 0) {
    await userStore.fetchUserData();
  }
});
</script>

<style>
.relative-container {
  position: relative;
}
</style>
