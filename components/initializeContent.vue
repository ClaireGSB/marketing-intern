<!-- components/InitializeContent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface InitializeContentPayload {
  orgId: string
  createdBy: string
  contentTypeId: number
  contentSubtypeId: string
}

const contentOutput = ref(null)
const error = ref(null)
const isLoading = ref(false)

async function initializeContent() {
  isLoading.value = true
  error.value = null

  const payload: InitializeContentPayload = {
    orgId: 'your-org-id', // Replace with actual org ID or make it dynamic
    createdBy: 'user-id', // Replace with actual user ID or make it dynamic
    contentTypeId: 1, // Replace with actual content type ID
    contentSubtypeId: 'subtype-id' // Replace with actual subtype ID
  }

  try {
    const { data, error: fetchError } = await useFetch('/api/content-output/initialize', {
      method: 'POST',
      body: payload
    })

    if (fetchError.value) {
      throw new Error(fetchError.value.message)
    }

    contentOutput.value = data.value
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <button @click="initializeContent" :disabled="isLoading">
      {{ isLoading ? 'Initializing...' : 'Initialize Content' }}
    </button>

    <div v-if="contentOutput">
      <h3>Initialized Content:</h3>
      <pre>{{ JSON.stringify(contentOutput, null, 2) }}</pre>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>