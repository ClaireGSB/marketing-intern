// psActionSelection.vue

<template>
  <!-- <v-col cols="12"> -->
    <h3 class="mb-4">3. Select Action</h3>
    <v-radio-group :modelValue="localSelectedAction" @update:modelValue="onActionChange">
      <template v-for="action in Object.keys(actions)" :key="action">
        <v-tooltip :disabled="isActionAvailable(action)" text="Unavailable for this content type" location="top start">
          <template v-slot:activator="{ props }">
            <div v-bind="props">
              <v-radio :label="action" :value="action" :disabled="!isActionAvailable(action)"></v-radio>
            </div>
          </template>
        </v-tooltip>
      </template>
    </v-radio-group>
  <!-- </v-col> -->
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  interface Props {
    actions: Record<string, any>;
    isActionAvailable: (action: string) => boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update', action: string): void;
  }>();

  const localSelectedAction = ref('');

  const onActionChange = (newAction: string) => {
    localSelectedAction.value = newAction;
    emit('update', localSelectedAction.value);
  };
</script>
