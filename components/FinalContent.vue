<template>
  <v-container v-if="contentLoaded">
    <v-card v-if="metadata && metadata.title" class="mb-4">
      <v-card-title> Title </v-card-title>
      <v-card-text>
        <pre>{{metadata.title}}</pre>
      </v-card-text>
    </v-card>
    <v-card v-if="metadata && metadata.meta_description" class="mb-4">
      <v-card-title> Meta Description </v-card-title>
      <v-card-text>
        <pre>{{metadata.meta_description}}</pre>
      </v-card-text>
    </v-card>
    <v-card class="mb-4">
      <v-card-title> {{ contentTypeName }}</v-card-title>
      <v-card-text>
        <pre>{{contentOutput.content}}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { FinalContentItem, ContentOutput, BlogMetadata } from '../types/frontendTypes';
import { ref, onMounted, watch } from 'vue';
import { useUserDataStore } from '~/stores/userdata';

export default {
  props: {
    contentOutputID: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserDataStore();
    const contentLoaded = ref(false);
    const content = ref<FinalContentItem[]>([]);
    const contentOutput = ref<ContentOutput | null>(null);
    const metadata = ref<BlogMetadata | null>(null);
    const contentTypeName = ref('');

    const loadContent = () => {
      content.value = userStore.getFinalContentForContentOutput(props.contentOutputID);
      contentOutput.value = userStore.getSelectedContentOutput(props.contentOutputID);
      if (contentOutput.value.content_type_id === 9) {
        // it a blog post. Also get meta data
        metadata.value = userStore.getBlogMetadataByContentOutputId(props.contentOutputID);
      }
      contentTypeName.value = userStore.getContentTypeDisplayNameById(contentOutput.value.content_type_id);
      contentLoaded.value = true;
      console.log('metadata', metadata.value);
    };

    onMounted(loadContent);
    watch(() => props.contentOutputID, loadContent);

    return {
      content,
      contentOutput,
      metadata,
      contentTypeName,
      contentLoaded,
    };
  },
};
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>