<!-- components/InitializeContent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface InitializeContentPayload {
  orgId: string
  createdBy: string
  contentTypeId: number
  contentSubtypeId: string
}

interface UpdateContentPayload {
  content: string
  status?: string
}

const contentOutput = ref(null)
const error = ref(null)
const isLoading = ref(false)
const isUpdating = ref(false)

async function initializeContent() {
  isLoading.value = true
  error.value = null

  const payload: InitializeContentPayload = {
    orgId: '7c9e6679-7425-40de-944b-e07fc1f90ae7', // Replace with actual org ID or make it dynamic
    createdBy: '7c9e6679-7425-40de-954b-e07fc1f90ae7', // Replace with actual user ID or make it dynamic
    contentTypeId: 1, // Replace with actual content type ID
    contentSubtypeId: '7c9e6679-7435-40de-954b-e07fc1f90ae7' // Replace with actual subtype ID
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

async function updateContent() {
  if (!contentOutput.value) {
    error.value = 'No content output to update. Please initialize first.'
    return
  }

  isUpdating.value = true
  error.value = null

  console.log('Updating content... with:', contentOutput.value)

  const payload: UpdateContentPayload = {
    content: 'This is the updated content string.',
    status: 'updated'
  }

  try {
    const { data, error: fetchError } = await useFetch(`/api/content-output/${contentOutput.value.body.id}`, {
      method: 'PATCH',
      body: payload
    })

    if (fetchError.value) {
      throw new Error(fetchError.value.message)
    }

    contentOutput.value = data.value
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred while updating'
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div>
    <button @click="initializeContent" :disabled="isLoading">
      {{ isLoading ? 'Initializing...' : 'Initialize Content' }}
    </button>

    <button @click="updateContent" :disabled="isUpdating || !contentOutput" style="margin-left: 10px;">
      {{ isUpdating ? 'Updating...' : 'Update Content' }}
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