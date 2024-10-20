<template>
  <v-data-table :headers="headers" :items="contentPieces" :items-per-page="5" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Campaign Content Pieces</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props" @click="addItem">
              Add Content Piece
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-select v-model="editedItem.content_type_id" :items="contentTypes" item-title="display_name"
  item-value="id" label="Content Type" @update:model-value="updateContentSubtypes"
  :rules="[v => !!v || 'Content Type is required']"></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select v-model="editedItem.content_subtype_id"
  :items="getContentSubtypes(editedItem.content_type_id)" item-title="name" item-value="id"
  label="Content Subtype" :disabled="!editedItem.content_type_id" :rules="[v => !!v || 'Content Subtype is required']"></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.action" label="Action" disabled></v-text-field>
                  </v-col>
                  <v-col v-for="field in requiredFields" :key="field" cols="12" sm="6" md="4">
                    <v-text-field v-if="!(field === 'content' && editedItem.selected_content_output_id)"
                      v-model="editedItem[field]"
                      :label="field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')" disabled></v-text-field>
                  </v-col>
                  <v-col v-if="editedItem.selected_content_output_id" cols="12">
                    <SelectedContentTag :contentOutputId="editedItem.selected_content_output_id" :short="false" />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.content_type_id="{ item }">
    {{ getContentTypeName(item.content_type_id) }}
  </template>
  <template v-slot:item.content_subtype_id="{ item }">
    {{ getContentSubtypeName(item.content_subtype_id) }}
  </template>
    <template v-slot:item.content="{ item }">
      <SelectedContentTag v-if="item.selected_content_output_id" :contentOutputId="item.selected_content_output_id"
        :short="true" />
      <span v-else>{{ item.content }}</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="deleteItem(item)">
        mdi-delete
      </v-icon>
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

const getContentTypeName = (id: number) => userStore.getContentTypeDisplayNameById(id);
const getContentSubtypeName = (id: string) => userStore.getContentSubTypeNameById(id);

const contentPieces = ref<UserInput[]>([]);
const dialog = ref(false);
const dialogDelete = ref(false);

const editedIndex = ref(-1);

const requiredFields = computed(() => {
  return actions.value[props.campaignAction]?.requiredFieldsForCampaigns || [];
});

const defaultItem = computed(() => {
  const item: UserInput = {
    content_type_id: 0,
    content_subtype_id: '',
    action: props.campaignAction,
    selected_content_output_id: null,
  };
  
  requiredFields.value.forEach(field => {
    if (field === 'content' && props.campaignFields.selected_content_output_id) {
      item.selected_content_output_id = props.campaignFields.selected_content_output_id;
      item.content = '';
    } else {
      item[field] = props.campaignFields[field];
    }
  });

  return item;
});

const editedItem = ref<UserInput>({} as UserInput);


const formTitle = computed(() => editedIndex.value === -1 ? 'New Item' : 'Edit Item');

const headers = computed(() => [
  { title: 'Content Type', key: 'content_type_id', sortable: false },
  { title: 'Content Subtype', key: 'content_subtype_id', sortable: false },
  { title: 'Action', key: 'action', sortable: false },
  ...requiredFields.value.map(field => ({
    title: field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' '),
    key: field,
    sortable: false,
  })),
  { title: 'Actions', key: 'actions', sortable: false },
]);

const getContentSubtypes = (contentTypeId: number) => {
  return userStore.getSubtypesForContentType(contentTypeId);
};

const updateContentSubtypes = () => {
  editedItem.value.content_subtype_id = '';
};

const addItem = () => {
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem.value };
  dialog.value = true;
};

const editItem = (item: UserInput) => {
  editedIndex.value = contentPieces.value.indexOf(item);
  editedItem.value = { ...defaultItem.value, ...item };
  dialog.value = true;
};

const deleteItem = (item: UserInput) => {
  editedIndex.value = contentPieces.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const deleteItemConfirm = () => {
  contentPieces.value.splice(editedIndex.value, 1);
  closeDelete();
};

const close = () => {
  dialog.value = false;
  editedIndex.value = -1;
};

const closeDelete = () => {
  dialogDelete.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem.value };
};

const save = () => {
  if (!editedItem.value.content_type_id || !editedItem.value.content_subtype_id) {
    // You might want to show an error message here
    return;
  }
  if (editedIndex.value > -1) {
    Object.assign(contentPieces.value[editedIndex.value], editedItem.value);
  } else {
    contentPieces.value.push(editedItem.value);
  }
  close();
};

watch(() => props.campaignAction, (newAction) => {
  contentPieces.value.forEach(piece => {
    piece.action = newAction;
    requiredFields.value.forEach(field => {
      piece[field] = props.campaignFields[field];
    });
  });
});

watch(() => props.campaignFields, (newFields) => {
  console.log('TABLE: New Campaign fields:', newFields);
  console.log('TABLE: requiredFields:', requiredFields.value);
  console.log('TABLE: defaultItem:', defaultItem.value);
  contentPieces.value.forEach(piece => {

    requiredFields.value.forEach(field => {
      if (field === 'content' && newFields.selected_content_output_id) {
        piece.selected_content_output_id = newFields.selected_content_output_id;
        piece.content = '';
      } else {
        piece[field] = newFields[field];
      }
    });
  });
}, { deep: true });
</script>