// psActionSelection.vue

<template>
  <v-col cols="12">
    <h3 class="mb-4">3. Select Action</h3>
    <v-radio-group :modelValue="localSelectedAction" @update:modelValue="onActionChange">
      <v-tooltip v-for="action in Object.keys(actions)" :key="action" :disabled="isActionAvailable(action)"
        text="Unavailable for this content type" location="top start">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-radio :label="action" :value="action" :disabled="!isActionAvailable(action)"></v-radio>
          </div>
        </template>
      </v-tooltip>
    </v-radio-group>
  </v-col>
</template>

<script lang="ts">
import { watch, ref } from 'vue';

export default {
  props: {
    actions: {
      type: Object,
      required: true,
    },
    isActionAvailable: {
      type: Function as () => (action: string) => boolean,
      required: true,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localSelectedAction = ref('');

    const onActionChange = (newAction: string) => {
      localSelectedAction.value = newAction;
      emit('update', localSelectedAction.value);
    };

    return {
      onActionChange,
      localSelectedAction
    };
  },
};
</script>
