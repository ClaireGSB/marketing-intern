// CampaignBriefReadOnly.vue

<template>
  <v-card>
    <v-card-title>Campaign Brief</v-card-title>
    <v-card-text>
      <p v-for="prop in campaignProperties" :key="prop.key" class="mb-2">
        <strong>{{ prop.label }}: </strong>
        <span v-if="prop.value.length <= maxCharDisplay">{{ prop.value }}</span>
        <span v-else>
          {{ showFullText[prop.key] ? prop.value : prop.value.slice(0, maxCharDisplay) + '...' }}
          <a class="text-grey-darken-2" href="#" @click.prevent="toggleShowMore(prop.key)">
            {{ showFullText[prop.key] ? 'See less' : 'See more' }}
          </a>
        </span>
      </p>
      <template v-if="campaign.action_inputs.selected_content_output_id">
        <p><strong>Content: </strong></p>
        <SelectedContentTag :content-output-id="campaign.action_inputs.selected_content_output_id" />
      </template>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="$emit('edit')">Edit</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Campaign } from '../../types/frontendTypes';
import { useUserDataStore } from '~/stores/userdata';


const userStore = useUserDataStore();

const props = defineProps<{
  campaign: Campaign;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const formatFieldName = (key: string): string => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const showFullText = ref<{ [key: string]: boolean }>({});
const maxCharDisplay = 200;

const toggleShowMore = (key: string) => {
  showFullText.value[key] = !showFullText.value[key];
};

const getActionDisplayName = (action: string): string => {
  return userStore.getActionCampaignDisplayName(action);
};

const campaignProperties = computed(() => {
  if (!props.campaign) return [];

  return [
    { key: 'name', label: 'Name', value: props.campaign.name },
    { key: 'action', label: 'Goal', value: getActionDisplayName(props.campaign.action) },
    { key: 'topic', label: 'Topic', value: props.campaign.action_inputs.topic },
    { key: 'product_description', label: 'Product Description', value: props.campaign.action_inputs.product_description },
    { key: 'guidelines', label: 'Guidelines', value: props.campaign.guidelines },
    { key: 'context', label: 'Context', value: props.campaign.context },
  

    // Only add 'content' if there's no selected content
    ...(props.campaign.action_inputs.selected_content_output_id ? [] : [{ key: 'content', label: 'Content', value: props.campaign.action_inputs.content }]),
    ].filter(prop => prop.value != null && prop.value !== '' && (typeof prop.value !== 'string' || prop.value.trim() !== ''));

});


</script>