<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" xl="8" class="d-flex flex-column relative-container pa-0">
        <h1 class="text-h4 px-4 py-10">Content Outputs</h1>
        <v-container fluid class="flex-grow-1 overflow-y-auto">
          <v-data-table
            :headers="headers"
            :items="contentOutputsFormatted"
            :items-per-page="10"
            class="elevation-1 custom-table"
            :header-props="{
              class: 'custom-header text-uppercase'
            }"
          >
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
            <template v-slot:item.content="{ item }">
              <span v-if="item.status === 'completed'">{{ truncateContent(item.content) }}</span>
              <span v-else>-</span>
            </template>
          </v-data-table>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useUserDataStore } from '../stores/userdata';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ContentOutputsTable',
  setup() {
    const userStore = useUserDataStore();
    const { contentOutputs, contentTypes, contentSubTypes } = storeToRefs(userStore);

    const headers = [
      { title: 'Date Created', key: 'created_at', sortable: true },
      { title: 'Content Type', key: 'content_type', sortable: true },
      { title: 'Content Subtype', key: 'content_subtype', sortable: true },
      { title: 'Status', key: 'status', sortable: true },
      { title: 'Content', key: 'content', sortable: false },
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

    onMounted(async () => {
      if (userStore.contentOutputs.length === 0) {
        await userStore.fetchUserData();
      }
    });

    return {
      headers,
      contentOutputsFormatted,
      formatDate,
      truncateContent,
    };
  },
});
</script>

<style>
.relative-container {
  position: relative;
}

/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}

/* Custom table styles */
.custom-table {
  border: 1px solid #e0e0e0;
}

.custom-header {
  background-color: #f5f5f5 !important;
  color: #333 !important;
  font-weight: bold !important;
  font-size: 0.875rem !important;
  border-bottom: 2px solid #e0e0e0 !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr:nth-of-type(even) {
  background-color: #f9f9f9;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr:hover {
  background-color: #e3f2fd !important;
}
</style>