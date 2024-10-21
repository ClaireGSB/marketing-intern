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
import { ref, computed } from 'vue';

interface Props {
  actions: Record<string, any>;
  isActionAvailable: (action: string) => boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', action: string): void;
}>();

const localSelectedAction = ref('');

const availableActions = computed(() => 
  Object.keys(props.actions).map(action => ({
    text: action,
    value: action,
  }))
);

const onActionChange = (newAction: { value: string }) => {
  if (newAction && props.isActionAvailable(newAction.value)) {
    localSelectedAction.value = newAction.value;
    emit('update', localSelectedAction.value);
  }
};
</script>
