// Pages/Campaign/index.vue

<template>
  <v-container class="fill-height pa-0">
    <v-row no-gutters class="fill-height justify-center">
      <v-col cols="12" class="d-flex flex-column relative-container pa-0">
        <div class="d-flex align-center px-4 py-10">
          <h1 class="text-h4 flex-grow-1">{{ pageTitle }}</h1>
        </div>

        <v-row v-if="!campaign.id">
          <v-col cols="12">
            <v-card>
              <v-card-title>Campaign Brief</v-card-title>
              <v-card-text>
                <p>No campaign has been created yet. Click the button below to create a new campaign.</p>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="openCampaignBrief">Create Campaign</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col cols="12">
            <CampaignBriefReadOnly :campaign="campaign" @edit="openCampaignBrief" />
          </v-col>
        </v-row>

        <CampaignContentTable
          :campaign-action="campaign.action"
          :campaign-fields="campaign.action_inputs"
          :campaign-id="campaign.id"
        />

        <div class="my-10"></div>
        <div class="my-10"></div>
      </v-col>
    </v-row>
  </v-container>

  <v-container class="button-container px-0">
    <v-row no-gutters justify="center">
      <v-col cols="auto">
        <v-btn color="primary" @click="saveCampaign" class="generate-btn">
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <CampaignBrief
    v-model="showCampaignBrief"
    :campaign="campaign"
    :is-edit-mode="!!campaign.id"
    @save="saveCampaign"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Campaign } from '../../types/frontendTypes';
import { inputFields } from '../../types/inputFieldTypes';
import { useUserDataStore } from '../../stores/userData';

const userStore = useUserDataStore();

const pageTitle = 'Create Campaign';
const campaign = ref<Campaign>({
  name: '',
  guidelines: '',
  context: '',
  action: '',
  action_inputs: {},
});

const showCampaignBrief = ref(false);

const openCampaignBrief = () => {
  showCampaignBrief.value = true;
};

const saveCampaign = async (updatedCampaign: Campaign) => {
  if (campaign.value.id) {
    // Update existing campaign
    console.log('Updating campaign', updatedCampaign);
    const fullUpdatedCampaign= await userStore.updateCampaign(campaign.value.id, updatedCampaign);
    campaign.value = fullUpdatedCampaign;
    console.log('INDEX has Updated campaign:', fullUpdatedCampaign);
  } else {
    // Create new campaign
    console.log('Creating campaign', updatedCampaign);
    const newCampaign = await userStore.createCampaign(updatedCampaign);
    campaign.value = newCampaign;
    console.log('INDEX has New campaign:', newCampaign);
  }
  showCampaignBrief.value = false;
};
</script>

<style scoped>
.relative-container {
  position: relative;
}

.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.generate-btn {
  width: 200px;
}

/* Add max-width to v-col for extra large screens */
@media (min-width: 1000px) {
  .v-container {
    max-width: 1000px !important;
  }
}
</style>
