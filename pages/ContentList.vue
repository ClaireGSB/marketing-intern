<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" xl="8" class="d-flex flex-column relative-container pa-0">
        <h1 class="text-h4 px-4 py-10">Content Outputs</h1>
        <v-container fluid class="flex-grow-1 overflow-y-auto">
          <v-btn color="primary" class="mb-4" @click="createNewContent">Create New Content</v-btn>
          <v-data-table
            :headers="headers"
            :items="contentOutputsFormatted"
            :items-per-page="10"
            class="elevation-1 custom-table"
          >
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
            <template v-slot:item.content="{ item }">
              <span v-if="item.status === 'completed'">{{ truncateContent(item.content) }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                color="primary"
                size="small"
                @click="editContent(item.id)"
              >
                Edit
              </v-btn>
            </template>
          </v-data-table>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const userStore = useUserDataStore();
const router = useRouter();

const { contentOutputs } = storeToRefs(userStore);

const headers = [
  { title: 'Date Created', key: 'created_at', sortable: true },
  { title: 'Content Type', key: 'content_type', sortable: true },
  { title: 'Content Subtype', key: 'content_subtype', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Content', key: 'content', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
];

const contentOutputsFormatted = computed(() => {
  return contentOutputs.value.map(output => ({
    ...output,
    content_type: userStore.getContentTypeDisplayNameById(output.content_type_id),
    content_subtype: userStore.getContentSubTypeNameById(output.content_subtype_id || ''),
  }));
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const truncateContent = (content: string) => {
  return content.length > 100 ? content.slice(0, 100) + '...' : content;
};

const createNewContent = () => {
  router.push('/Content');
};

const editContent = (contentId: string) => {
  router.push(`/Content/${contentId}`);
};

onMounted(async () => {
  if (userStore.contentOutputs.length === 0) {
    await userStore.fetchUserData();
  }
});
</script>

<style scoped>
.custom-table {
  width: 100%;
}

.custom-table th {
  background-color: #f5f5f5;
  color: #333;
  font-weight: bold;
  text-transform: uppercase;
}

.relative-container {
  position: relative;
}

/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}
</style>