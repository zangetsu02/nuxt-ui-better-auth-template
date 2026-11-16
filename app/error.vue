<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => is404.value ? 'Page not found' : 'Something went wrong'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UError
        :error="is404 ? { statusCode: 404, statusMessage: 'Page not found', message: 'The page you are looking for does not exist.' } : error"
      />
    </NuxtLayout>
  </UApp>
</template>
