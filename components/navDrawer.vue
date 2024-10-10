<template>
  <v-navigation-drawer
    expand-on-hover
    rail
  >
    <v-list>
      <v-list-item 
        v-for="item in menuItems" 
        :key="item.value"
        :prepend-icon="item.icon" 
        :title="item.title" 
        :value="item.value" 
        :to="item.to"
        router
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon" color="primary"></v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const menuItems = ref([
  { icon: 'mdi-creation', title: 'Create Content', value: 'createContent', to: '/createContent2' },
  { icon: 'mdi-bullhorn', title: 'Create Campaign', value: 'createCampaign', to: '' },
  { icon: 'mdi-calendar-multiselect', title: 'Content Calendar', value: 'calendar', to: '' },
  { icon: 'mdi-tune', title: 'Content Settings', value: 'contentSettings', to: '/ContentSettings' },
  { icon: 'mdi-account', title: 'My Account', value: 'myAccount', to: '' },
])
</script>