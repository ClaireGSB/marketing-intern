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

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'ConfirmDialog',
});

const props = withDefaults(defineProps<{
  title?: string;
  message: string;
  confirmText?: string;
}>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

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

defineExpose({
  open,
});
</script>