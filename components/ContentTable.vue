<template>
  <v-data-table :headers="headers" :items="contentOutputsFormatted" :items-per-page="50"
    class="elevation-1 custom-table" :header-props="{
      class: 'custom-header text-uppercase'
    }">
    <template v-slot:item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>
    <template v-slot:item.content="{ item }">
      <span v-if="item.status === 'completed'">{{ truncateContent(item.content) }}</span>
      <span v-else>-</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="plain" @click="handleItemAction(item)" class="pa-0">
            <v-icon :color="getIconColor(item)">
              {{ getActionIcon(item) }}
            </v-icon>
          </v-btn>
        </template>
        <span>{{ actionTooltip }}</span>
      </v-tooltip>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { storeToRefs } from 'pinia';

export default {
  props: {
    selectable: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['select', 'view'],
  setup(props, { emit }) {
    const userStore = useUserDataStore();
    const { contentOutputs } = storeToRefs(userStore);
    const selectedItemId = ref(null);

    const headers = [
      { title: 'Date Created', key: 'created_at', sortable: true },
      { title: 'Created By', key: 'created_by', sortable: true },
      { title: 'Content Type', key: 'content_type', sortable: true },
      { title: 'Content Subtype', key: 'content_subtype', sortable: true },
      { title: 'Status', key: 'status', sortable: true },
      { title: 'Content', key: 'content', sortable: false },
      { title: props.selectable ? 'Select' : 'Actions', key: 'actions', sortable: false },
    ];

    const sortBy = ref('created_at');
    const sortDesc = ref(true);

    const contentOutputsFormatted = computed(() => {
      const userFirstNames = userStore.userFirstNames;
      return contentOutputs.value
        .filter(output => {
          if (props.filters && typeof props.filters === 'object') {
            for (const [key, value] of Object.entries(props.filters)) {
              if (output[key] !== value) {
                return false;
              }
            }
          }
          return true;
        })
        .map(output => ({
          ...output,
          content_type: userStore.getContentTypeDisplayNameById(output.content_type_id),
          content_subtype: userStore.getContentSubTypeNameById(output.content_subtype_id || ''),
          created_by: userFirstNames[output.created_by] || 'Unknown',
        }))
        .sort((a, b) => {
          const modifier = sortDesc.value ? -1 : 1;
          if (a[sortBy.value] < b[sortBy.value]) return -1 * modifier;
          if (a[sortBy.value] > b[sortBy.value]) return 1 * modifier;
          return 0;
        });
    });

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString();
    };

    const truncateContent = (content: string) => {
      return content.length > 50 ? content.slice(0, 50) + '...' : content;
    };

    const handleItemAction = (item) => {
      if (props.selectable) {
        selectedItemId.value = selectedItemId.value === item.id ? null : item.id;
        emit('select', selectedItemId.value ? item : null);
      } else {
        emit('view', item.id);
      }
    };

    const getIconColor = (item) => {
      if (!props.selectable) return 'primary';
      return selectedItemId.value === item.id ? 'primary' : 'grey-darken-2';
    };

    const getActionIcon = (item) => {
      if (!props.selectable) return 'mdi-eye';
      return selectedItemId.value === item.id
        ? 'mdi-checkbox-marked-circle-outline'
        : 'mdi-checkbox-blank-circle-outline';
    };

    const actionTooltip = computed(() => props.selectable ? 'Select Content' : 'View Content');

    return {
      headers,
      contentOutputsFormatted,
      sortBy,
      sortDesc,
      formatDate,
      truncateContent,
      handleItemAction,
      getActionIcon,
      actionTooltip,
      getIconColor,
    };
  },
};
</script>

<style scoped>
.custom-table {
  width: 100%;
  border: 1px solid #e0e0e0;
}

.custom-header {
  background-color: #f5f5f5 !important;
  color: #333 !important;
  font-weight: bold !important;
  font-size: 0.875rem !important;
  border-bottom: 2px solid #e0e0e0 !important;
}

.selected-row {
  background-color: var(--v-primary-lighten-1) !important;
}

.selected-row:hover {
  background-color: var(--v-primary-base) !important;
}

.selected-row td {
  color: red !important;
}
</style>
