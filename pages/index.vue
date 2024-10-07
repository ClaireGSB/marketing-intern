<template>
  <div>
    <h1>{{ data.hello }}</h1>
  </div>
  <HelloWorld />
</template>

<script lang="ts" setup>
  const { data } = await useFetch('/api/hello')
</script>
