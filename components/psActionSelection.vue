// psActionSelection.vue

<template>
  <v-select
    :model-value="localSelectedAction"
    @update:model-value="onActionChange"
    :items="availableActions"
    item-title="text"
    item-value="value"
    label="Select a goal"
    return-object
  >
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" :disabled="!isActionAvailable(item.value)">
        <v-list-item-title>{{ item.text }}</v-list-item-title>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserDataStore } from '~/stores/userData';


interface Props {
  actions: Record<string, any>;
  isActionAvailable: (action: string) => boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', action: string): void;
}>();

const userDataStore = useUserDataStore();

const localSelectedAction = ref<{ value: string; text: string } | null>(null);


const availableActions = computed(() => 
  Object.keys(props.actions).map(action => ({
    text: userDataStore.getActionDisplayName(action),
    value: action,
  }))
);

// const onActionChange = (newAction: { value: string, text: string } | null) => {
//   if (newAction && props.isActionAvailable(newAction.value)) {
//     localSelectedAction.value = newAction;
//     emit('update', newAction.value);
//   }
// };

const onActionChange = (newAction: { value: string, text: string } | null) => {
  if (newAction === null || props.isActionAvailable(newAction.value)) {
    localSelectedAction.value = newAction;
    emit('update', newAction ? newAction.value : null);
  }
};

// onMounted(() => {
//   if (localSelectedAction.value === null) {
//     localSelectedAction.value = availableActions.value.find(action => props.isActionAvailable(action.value)) || null;
//   }
// });
</script>
