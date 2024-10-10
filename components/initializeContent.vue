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
const contentOutputs = ref([])
const contentSubtypes = ref([])
const error = ref(null)
const isLoading = ref(false)
const isUpdating = ref(false)

const orgId = ref('7c9e6679-7425-40de-944b-e07fc1f90ae7') // Replace with actual org ID or make it dynamic


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
    id: contentOutput.value.body.id,
    content: 'This is the updated content string.',
    status: 'updated'
  }

  try {
    const { data, error: fetchError } = await useFetch(`/api/content-output/update`, {
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

async function fetchContentOutputs() {
  // try {
    console.log('Fetching content outputs... for org:', orgId.value)
    const data = await $fetch(`/api/content-output/get-by-org`)

    console.log('Fetched content outputs')
    // console.log('error:', fetchError)
    
    // if (fetchError?.value) {
    //   throw new Error(fetchError.value.message)
    // }
    console.log('Fetched content outputs:', data)
    console.log('Fetched content outputs:', data.value)

    contentOutputs.value = data.body
  // } catch (e) {
  //   error.value = e instanceof Error ? e.message : 'Error fetching content outputs'
  // }
}

async function fetchContentSubtypes() {
  try {
    const { data, error: fetchError } = await useFetch(`/api/content-subtype/get-by-org`)
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message)
    }

    contentSubtypes.value = data.value
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error fetching content subtypes'
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

    <div style="margin-top: 20px;">
      <button @click="fetchContentOutputs">Fetch Content Outputs</button>
      <button @click="fetchContentSubtypes" style="margin-left: 10px;">Fetch Content Subtypes</button>
    </div>

    <div v-if="contentOutput">
      <h3>Current Content Output:</h3>
      <pre>{{ JSON.stringify(contentOutput, null, 2) }}</pre>
    </div>

    <div v-if="contentOutputs.length">
      <h3>All Content Outputs:</h3>
      <pre>{{ JSON.stringify(contentOutputs, null, 2) }}</pre>
    </div>

    <div v-if="contentSubtypes.length">
      <h3>Content Subtypes:</h3>
      <pre>{{ JSON.stringify(contentSubtypes, null, 2) }}</pre>
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