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
    <template v-slot:item.action="{ item }">
      {{ item.action }}
    </template>
    <template v-for="field in requiredFields" :key="field" v-slot:[`item.${field}`]="{ item }">
      <template v-if="field === 'content' && item.selected_content_output_id">
        <SelectedContentTag
          :contentOutputId="item.selected_content_output_id"
          :short="true"
        />
      </template>
      <template v-else>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              {{ truncate(item[field]) }}
            </span>
          </template>
          <span>{{ item[field] }}</span>
        </v-tooltip>
      </template>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { UserInput } from '../../types/frontendTypes';

const userStore = useUserDataStore();
const { actions, contentTypes } = storeToRefs(userStore);

const props = defineProps<{
  campaignAction: string;
  campaignFields: Record<string, string>;
}>();

const contentPieces = ref<UserInput[]>([]);

const requiredFields = computed(() => {
  return actions.value[props.campaignAction]?.requiredFieldsForCampaigns || [];
});

const headers = computed(() => [
  { title: 'Content Type', key: 'content_type', sortable: false },
  { title: 'Content Subtype', key: 'content_subtype', sortable: false },
  { title: 'Action', key: 'action', sortable: false },
  ...requiredFields.value.map(field => ({
    title: field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' '),
    key: field,
    sortable: false
  }))
]);

const getContentSubtypes = (contentTypeId: number) => {
  return userStore.getSubtypesForContentType(contentTypeId);
};

const updateContentSubtypes = (item: UserInput) => {
  item.content_subtype_id = '';
};

const addNewRow = () => {
  const newRow = {
    content_type_id: 0,
    content_subtype_id: '',
    action: props.campaignAction,
    selected_content_output_id: null,
  } as UserInput;

  console.log('requiredFields', requiredFields.value);
  
  // Add required fields from campaignFields
  for (const field of requiredFields.value) {
    newRow[field] = props.campaignFields[field];
    if (field === 'content' && props.campaignFields.selected_content_output_id) {
      newRow.selected_content_output_id = props.campaignFields.selected_content_output_id;
    }
  }
  
  contentPieces.value.push(newRow);
};

const truncate = (value: string) => {
  return value && value.length > 50 ? value.slice(0, 47) + '...' : value;
};

// Watch for changes in campaignAction and update existing rows
watch(() => props.campaignAction, (newAction) => {
  console.log('Campaign action changed:', newAction);
  contentPieces.value.forEach(piece => {
    piece.action = newAction;
    // Update required fields for existing rows
    requiredFields.value.forEach(field => {
      piece[field] = props.campaignFields[field];
    });
  });
});

// Watch for changes in campaignFields and update existing rows
watch(() => props.campaignFields, (newFields) => {
  console.log('Campaign fields changed:', newFields);
  contentPieces.value.forEach(piece => {
    requiredFields.value.forEach(field => {
      if (field === 'content' && newFields.selected_content_output_id) {
        piece.selected_content_output_id = newFields.selected_content_output_id;
        piece.content = '';  // Clear the content field when a content is selected
        console.log('Selected content:', newFields.selected_content_output_id);
      } else {
        piece[field] = newFields[field];
      }
    });
  });
}, { deep: true });
</script>