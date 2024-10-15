<template>
  <v-tooltip>
    <template v-slot:activator="{ props }">
      <v-chip
        color="primary"
        variant="tonal"
        v-bind="props"
        @click="navigateToContent"
        :closable="removable"
        @click:close="removeTag"
      >
        {{ truncatedContent }}
      </v-chip>
    </template>
    <div v-html="tooltipText"></div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { useRouter } from 'vue-router';
import { ContentOutput } from '~/types/frontendTypes';

const props = defineProps<{
  contentOutputId: string;
  removable?: boolean;
}>();

const emit = defineEmits(['remove']);

const userStore = useUserDataStore();
const router = useRouter();

const contentOutput = ref<ContentOutput | null>(null);

onMounted(async () => {
  contentOutput.value = userStore.getSelectedContentOutput(props.contentOutputId);
});

const truncatedContent = computed(() => {
  if (!contentOutput.value) return '';
  return contentOutput.value.content.length > 50 
    ? contentOutput.value.content.slice(0, 50) + '...' 
    : contentOutput.value.content;
});

const tooltipText = computed(() => {
  if (!contentOutput.value) return '';
  return `
    <strong>Content Type:</strong> ${userStore.getContentTypeDisplayNameById(contentOutput.value.content_type_id)}<br>
    <strong>Subtype:</strong> ${userStore.getContentSubTypeNameById(contentOutput.value.content_subtype_id)}<br>
    <strong>Created At:</strong> ${new Date(contentOutput.value.created_at).toLocaleString()}<br>
    <strong>Status:</strong> ${contentOutput.value.status}
  `;
});

const navigateToContent = (event: Event) => {
  // Prevent navigation if the click was on the close button
  if ((event.target as HTMLElement).closest('.v-chip__close')) {
    return;
  }
  if (contentOutput.value) {
    router.push(`/Content/${contentOutput.value.id}`);
  }
};

const removeTag = () => {
  emit('remove', props.contentOutputId);
};
</script>

<style scoped>

</style>