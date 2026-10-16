<script setup lang="ts">
const props = defineProps<{
  /** Where to land once the provider sends the user back. */
  callbackUrl: string
  disabled?: boolean
}>()

const { signIn } = useAuth()
const toast = useToast()

const loadingProvider = ref<'google' | 'github' | null>(null)

async function onSocialLogin(provider: 'google' | 'github') {
  if (loadingProvider.value)
    return
  loadingProvider.value = provider

  const { error } = await signIn.social({ provider, callbackURL: props.callbackUrl })

  // On success the provider navigates the page away, so the button stays loading.
  if (error) {
    toast.add({
      title: error.message || error.statusText,
      color: 'error'
    })
    loadingProvider.value = null
  }
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-simple-icons-google"
      class="justify-center"
      :loading="loadingProvider === 'google'"
      :disabled="disabled || !!loadingProvider"
      @click="onSocialLogin('google')"
    >
      Google
    </UButton>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-simple-icons-github"
      class="justify-center"
      :loading="loadingProvider === 'github'"
      :disabled="disabled || !!loadingProvider"
      @click="onSocialLogin('github')"
    >
      Github
    </UButton>
  </div>
</template>
