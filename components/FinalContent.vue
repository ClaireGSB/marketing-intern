<template>
  <v-container v-if="contentLoaded">
    <v-card v-if="metadata && metadata.title" class="mb-4">
      <v-card-title> Title </v-card-title>
      <v-card-text>
        <pre>{{ metadata.title }}</pre>
      </v-card-text>
    </v-card>
    <v-card v-if="metadata && metadata.meta_description" class="mb-4">
      <v-card-title> Meta Description </v-card-title>
      <v-card-text>
        <pre>{{ metadata.meta_description }}</pre>
      </v-card-text>
    </v-card>
    <v-card class="mb-4">
      <v-card-title> {{ contentTypeName }}</v-card-title>
      <v-card-text>
        <pre>{{ contentOutput.content }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { ContentOutput, BlogMetadata } from '../types/frontendTypes';
  import { ref, onMounted, watch } from 'vue';
  import { useUserDataStore } from '~/stores/userdata';

  interface Props {
    contentOutputID: string;
  }

  const props = defineProps<Props>();

  const userStore = useUserDataStore();
  const contentLoaded = ref(false);
  const contentOutput = ref<ContentOutput | null>(null);
  const metadata = ref<BlogMetadata | null>(null);
  const contentTypeName = ref('');

  const loadContent = async () => {
    contentOutput.value = userStore.getSelectedContentOutput(props.contentOutputID);
    if (contentOutput.value?.content_type_id === 9) {
      // it's a blog post. Also get meta data
      metadata.value = await userStore.getBlogMetadataByContentOutputId(props.contentOutputID);
    }
    contentTypeName.value = userStore.getContentTypeDisplayNameById(contentOutput.value?.content_type_id);
    contentLoaded.value = true;
    console.log('metadata', metadata.value);
  };

  onMounted(loadContent);
  watch(() => props.contentOutputID, loadContent);
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
