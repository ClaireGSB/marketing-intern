<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" xl="8" class="d-flex flex-column relative-container pa-0">
        <h1 class="text-h4 px-4 py-10">Content Settings</h1>
        <v-container fluid class="flex-grow-1 overflow-y-auto">
          <template v-if="isDataFetched">
            <FieldCard :value="generalSettings.companyDescription" fieldName="Company description"
              @update:value="updateField('companyDescription', $event)" :maxChars="maxChars" />
            <FieldCard :value="generalSettings.contentStrategy" fieldName="Content strategy info"
              @update:value="updateField('contentStrategy', $event)" :maxChars="maxChars" />
          </template>

          <!-- Content Types and Subtypes Section -->
          <v-card>
            <v-card-title>Content Types and Subtypes</v-card-title>
            <v-card-text>
              <v-expansion-panels>
                <v-expansion-panel v-for="contentType in contentTypes" :key="contentType.id">
                  <v-expansion-panel-title class="font-weight-bold">{{ contentType.display_name
                    }}</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list>
                      <!-- Subtypes List -->
                      <v-list-item v-for="subtype in getSubtypesForContentType(contentType.id)" :key="subtype.id"
                        @click="openSubtypePanel(contentType.id, subtype.id)">
                        <v-list-item-title>
                          <v-icon color="secondary" class="mx-2">mdi-pencil</v-icon>
                          {{ subtype.name }}
                        </v-list-item-title>
                      </v-list-item>
                      <!-- Add New Subtype -->
                      <v-list-item @click="openNewSubtypePanel(contentType.id)">
                        <v-list-item-title class="font-italic">
                          <v-icon color="secondary" class="mx-2">mdi-plus</v-icon>
                          Add New
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-container>
      </v-col>
    </v-row>

    <!-- Side Panel for Type and Subtype Settings -->
    <ContentSettingsDialog v-model="showSettingsPanel" :content-type-id="selectedContentTypeID || 0"
      :content-subtype-id="selectedSubtypeId !== null ? selectedSubtypeId : undefined" @saved="handleSaved" />
  </v-container>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useUserDataStore } from '../stores/userdata';
import { storeToRefs } from 'pinia';
const userStore = useUserDataStore();


export default {
  setup() {
    const generalSettings = ref({
      companyDescription: '',
      contentStrategy: '',
    });

    // Use storeToRefs to make store properties reactive
    const { contentTypes, contentSubTypes } = storeToRefs(userStore);

    // Use computed properties to access store data
    const getSubtypesForContentType = computed(() => (contentTypeId: number) => {
      return contentSubTypes.value.filter(subtype => subtype.content_type_id === contentTypeId);
    });

    const showSettingsPanel = ref(false);
    const selectedContentTypeID = ref<number | null>(null);
    const selectedSubtypeId = ref<string | null>(null);
    const maxChars = 500;  // Maximum characters for guidelines
    const isDataFetched = ref(false);

    const openSubtypePanel = (contentTypeID: number, subtypeId: string) => {
      selectedContentTypeID.value = contentTypeID;
      selectedSubtypeId.value = subtypeId;
      showSettingsPanel.value = true;
    };

    const openNewSubtypePanel = (contentTypeID: number) => {
      selectedContentTypeID.value = contentTypeID;
      selectedSubtypeId.value = null;
      showSettingsPanel.value = true;
    };

    const handleSaved = () => {

    };

    const updateField = (field: 'companyDescription' | 'contentStrategy', value: string) => {
      console.log('Updating field:', field, value);
    };

    return {
      getSubtypesForContentType,
      isDataFetched,
      generalSettings,
      contentTypes,
      showSettingsPanel,
      selectedContentTypeID,
      selectedSubtypeId,
      maxChars,
      openSubtypePanel,
      openNewSubtypePanel,
      handleSaved,
      updateField,
    };
  },
};
</script>

<style scoped>
.relative-container {
  position: relative;
}

/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}

/* Remove padding from v-expansion-panel-text__wrapper */
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
</style>
