// CampaignBriefReadOnly.vue

<template>
  <v-card>
    <v-card-title>Campaign Brief</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <strong>Campaign Name:</strong> {{ campaign.name }}
        </v-col>
        <v-col cols="12">
          <strong>Action:</strong> {{ campaign.action }}
        </v-col>
        <v-col cols="12" v-for="(value, key) in campaign.action_inputs" :key="key">
          <strong>{{ formatFieldName(key) }}:</strong> {{ value }}
        </v-col>
        <v-col cols="12">
          <strong>Guidelines:</strong>
          <div v-html="formattedText(campaign.guidelines)"></div>
        </v-col>
        <v-col cols="12">
          <strong>Context:</strong>
          <div v-html="formattedText(campaign.context)"></div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="$emit('edit')">Edit</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Campaign } from '../../types/frontendTypes';

const props = defineProps<{
  campaign: Campaign;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const formatFieldName = (key: string): string => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formattedText = (text: string): string => {
  return text.replace(/\n/g, '<br>');
};
</script>