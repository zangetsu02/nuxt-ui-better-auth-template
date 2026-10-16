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
  title: 'Sign Up'
})

const auth = useAuth()
const toast = useToast()
const route = useRoute()

const redirectTo = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || '/'
})

const schema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  password: undefined,
  confirmPassword: undefined
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value)
    return
  loading.value = true
  const { error } = await auth.signUp.email({
    name: event.data.name,
    email: event.data.email,
    password: event.data.password,
    callbackURL: redirectTo.value
  })
  if (error) {
    toast.add({
      title: error.message || error.statusText,
      color: 'error'
    })
  }
  loading.value = false
}
</script>

<template>
  <UContainer class="flex items-center justify-center sm:p-4 sm:min-w-160">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center p-4">
          <h1 class="text-xl font-semibold">
            Nuxt 4 - Nuxt UI - Drizzle - Postgre - Better Auth Template
          </h1>
        </div>
      </template>

      <div class="space-y-4">
        <AuthSocialButtons
          :callback-url="redirectTo"
          :disabled="loading"
        />

        <USeparator label="Or" />

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField
            label="Name"
            name="name"
            required
          >
            <UInput
              v-model="state.name"
              placeholder="Your Name"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Email"
            name="email"
            autocomplete="email"
            required
          >
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Email Address"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Password"
            name="password"
            required
          >
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Password"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Confirm Password"
            name="confirmPassword"
            required
          >
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="Confirm Password"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            block
            :loading="loading"
            :disabled="loading"
          >
            Create Account
          </UButton>
        </UForm>

        <div class="text-center text-sm">
          Already have an account?
          <UButton
            variant="link"
            color="primary"
            :disabled="loading"
            to="/sign-in"
          >
            Sign in here
          </UButton>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
