<template>
  <v-app-bar
    color="primary"
    :elevation="2"
    app
  >
    <v-app-bar-title>Marketing Intern</v-app-bar-title>

    <!-- You can add more items here if needed -->
  </v-app-bar>
</template>

<script setup lang="ts">
// No additional script needed for this basic setup
</script>

<style scoped>
/* Optional: If you want to ensure the title text is white */
:deep(.v-app-bar-title) {
  color: white;
}
</style>