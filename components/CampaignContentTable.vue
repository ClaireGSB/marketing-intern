<template>
  <v-data-table
    :headers="headers"
    :items="contentPieces"
    :items-per-page="5"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Campaign Content Pieces</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn color="primary" dark class="mb-2" @click="addNewRow">
          Add Content Piece
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.content_type="{ item }">
      <v-select
        v-model="item.content_type_id"
        :items="contentTypes"
        item-title="display_name"
        item-value="id"
        dense
        @change="updateContentSubtypes(item)"
      ></v-select>
    </template>
    <template v-slot:item.content_subtype="{ item }">
      <v-select
        v-model="item.content_subtype_id"
        :items="getContentSubtypes(item.content_type_id)"
        item-title="name"
        item-value="id"
        dense
      ></v-select>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { UserInput } from '../../types/frontendTypes';

const props = defineProps<{
  campaignAction: string;
}>();

const userStore = useUserDataStore();
const contentPieces = ref<UserInput[]>([]);

const headers = [
  { title: 'Content Type', key: 'content_type', sortable: false },
  { title: 'Content Subtype', key: 'content_subtype', sortable: false },
  { title: 'Action', key: 'action', sortable: false },
];

const contentTypes = computed(() => userStore.contentTypes);

const getContentSubtypes = (contentTypeId: number) => {
  return userStore.getSubtypesForContentType(contentTypeId);
};

const updateContentSubtypes = (item: UserInput) => {
  item.content_subtype_id = '';
};

const addNewRow = () => {
  contentPieces.value.push({
    content_type_id: 0,
    content_subtype_id: '',
    action: props.campaignAction,
  } as UserInput);
};
</script>