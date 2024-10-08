<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" @click="cancel">Cancel</v-btn>
        <v-btn color="red darken-1" @click="confirm">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ConfirmDialog',
  props: {
    title: {
      type: String,
      default: 'Confirm Action',
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: 'Confirm',
    },
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const dialog = ref(false);

    const open = () => {
      dialog.value = true;
    };

    const confirm = () => {
      dialog.value = false;
      emit('confirm');
    };

    const cancel = () => {
      dialog.value = false;
      emit('cancel');
    };

    return {
      dialog,
      open,
      confirm,
      cancel,
    };
  },
});
</script>