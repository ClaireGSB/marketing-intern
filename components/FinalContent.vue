<template>
  <v-container>
    <v-card v-for="(item, index) in content" :key="index" class="mb-4">
      <v-card-title>{{ item.title }}</v-card-title>
      <v-card-text>
        <pre>{{ item.content }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { FinalContentItem } from '../types/frontendTypes';
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
    const content = ref<FinalContentItem[]>([]);

    const loadContent = () => {
      content.value = userStore.getFinalContentForContentOutput(props.contentOutputID);
    };

    onMounted(loadContent);
    watch(() => props.contentOutputID, loadContent);

    return {
      content,
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