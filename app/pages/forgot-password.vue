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
  title: 'Forgot Password'
})

const auth = useAuth()

const schema = z.object({
  email: z.email('Invalid email address')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined
})

const loading = ref(false)
const sent = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value)
    return
  loading.value = true

  const { error } = await auth.requestPasswordReset({
    email: event.data.email,
    redirectTo: '/reset-password'
  })

  // Always report success: telling the visitor whether the address exists would
  // turn this form into a way to find out who has an account.
  if (error) {
    console.error(error.message)
  }
  sent.value = true
  loading.value = false
}
</script>

<template>
  <UContainer class="flex items-center justify-center sm:p-4 sm:min-w-160">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center p-4">
          <h1 class="text-xl font-semibold">
            Reset your password
          </h1>
        </div>
      </template>

      <div
        v-if="sent"
        class="space-y-4 text-center"
      >
        <UIcon
          name="i-lucide-mail-check"
          class="size-10 text-primary"
        />
        <p class="text-sm">
          If an account exists for <strong>{{ state.email }}</strong>, we have sent it a link to
          choose a new password. The link expires in one hour.
        </p>
        <UButton
          to="/sign-in"
          color="neutral"
          variant="outline"
          block
        >
          Back to sign in
        </UButton>
      </div>

      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <p class="text-sm text-muted">
          Enter the email address you signed up with and we will send you a link to choose a new
          password.
        </p>

        <UFormField
          label="Email"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            class="w-full"
            placeholder="Email address"
            autocomplete="email"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading"
        >
          Send reset link
        </UButton>

        <div class="text-center text-sm">
          Remembered it?
          <UButton
            variant="link"
            color="primary"
            :disabled="loading"
            to="/sign-in"
          >
            Sign in
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
