<template>
  <v-tooltip :text="tooltipText">
    <template v-slot:activator="{ props }">
      <v-chip
        color="primary"
        class="content-output-tag"
        v-bind="props"
        @click="navigateToContent"
      >
        {{ truncatedContent }}
      </v-chip>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserDataStore } from '~/stores/userdata';
import { useRouter } from 'vue-router';
import { ContentOutput } from '~/types/frontendTypes';

const props = defineProps<{
  contentOutputId: string;
}>();

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
    Content Type: ${userStore.getContentTypeDisplayNameById(contentOutput.value.content_type_id)}
    Subtype: ${userStore.getContentSubTypeNameById(contentOutput.value.content_subtype_id)}
    Created At: ${new Date(contentOutput.value.created_at).toLocaleString()}
    Status: ${contentOutput.value.status}
  `;
});

const navigateToContent = () => {
  if (contentOutput.value) {
    router.push(`/Content/${contentOutput.value.id}`);
  }
};
</script>

<style scoped>
.content-output-tag {
  cursor: pointer;
  transition: opacity 0.3s;
}

.content-output-tag:hover {
  opacity: 0.8;
}
</style>