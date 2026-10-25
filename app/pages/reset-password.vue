<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'login',
  auth: {
    only: 'guest'
  }
})

useHead({
  title: 'Choose a new password'
})

const auth = useAuth()
const toast = useToast()
const route = useRoute()

// Better Auth redirects here from the email link with the token in the query string.
const token = computed(() => route.query.token as string | undefined)

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value || !token.value)
    return
  loading.value = true

  const { error } = await auth.resetPassword({
    newPassword: event.data.password,
    token: token.value
  })

  if (error) {
    toast.add({
      title: error.message || error.statusText,
      color: 'error'
    })
    loading.value = false
    return
  }

  toast.add({
    title: 'Password updated. You can sign in now.',
    color: 'success'
  })
  await navigateTo('/sign-in')
}
</script>

<template>
  <UContainer class="flex items-center justify-center sm:p-4 sm:min-w-160">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center p-4">
          <h1 class="text-xl font-semibold">
            Choose a new password
          </h1>
        </div>
      </template>

      <div
        v-if="!token"
        class="space-y-4 text-center"
      >
        <UIcon
          name="i-lucide-link-2-off"
          class="size-10 text-error"
        />
        <p class="text-sm">
          This link is missing its token. Reset links can only be used once and expire after an
          hour — request a new one.
        </p>
        <UButton
          to="/forgot-password"
          color="primary"
          block
        >
          Request a new link
        </UButton>
      </div>

      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="New password"
          name="password"
          required
        >
          <UInput
            v-model="state.password"
            type="password"
            class="w-full"
            placeholder="New password"
            autocomplete="new-password"
          />
        </UFormField>

        <UFormField
          label="Confirm new password"
          name="confirmPassword"
          required
        >
          <UInput
            v-model="state.confirmPassword"
            type="password"
            class="w-full"
            placeholder="Confirm new password"
            autocomplete="new-password"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading"
        >
          Update password
        </UButton>
      </UForm>
    </UCard>
  </UContainer>
</template>
