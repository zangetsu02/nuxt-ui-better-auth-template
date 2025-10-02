<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { output as ZodOutput } from 'zod'

definePageMeta({
  layout: 'login',
  auth: {
    only: 'guest'
  }
})

useHead({
  title: 'Sign In'
})
const auth = useAuth()
const toast = useToast()
const route = useRoute()

const redirectTo = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || '/'
})

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
})

type Schema = ZodOutput<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
  rememberMe: false
})

const loading = ref(false)
const loadingAction = ref('')

async function onSocialLogin(action: 'google' | 'github') {
  loading.value = true
  loadingAction.value = action
  auth.signIn.social({ provider: action, callbackURL: redirectTo.value })
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value)
    return
  loading.value = true
  loadingAction.value = 'submit'
  const { error } = await auth.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: event.data.rememberMe,
    callbackURL: redirectTo.value
  })
  if (error) {
    toast.add({
      title: error.message,
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-simple-icons-google"
            class="justify-center"
            :loading="loading && loadingAction === 'google'"
            :disabled="loading"
            @click="onSocialLogin('google')"
          >
            Google
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-simple-icons-github"
            class="justify-center"
            :loading="loading && loadingAction === 'github'"
            :disabled="loading"
            @click="onSocialLogin('github')"
          >
            Github
          </UButton>
        </div>

        <USeparator label="Or" />

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
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

          <UFormField
            label="Password"
            name="password"
            required
          >
            <UInput
              v-model="state.password"
              type="password"
              class="w-full"
              placeholder="Password"
            />
          </UFormField>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <UFormField name="rememberMe">
              <UCheckbox
                v-model="state.rememberMe"
                label="Remember me"
              />
            </UFormField>
            <UButton
              variant="link"
              color="neutral"
              to="/forgot-password"
            >
              Forgot your password?
            </UButton>
          </div>

          <UButton
            type="submit"
            color="primary"
            block
            :disabled="loading"
            :loading="loading && loadingAction === 'submit'"
          >
            Sign In
          </UButton>

          <div class="text-center text-sm">
            Don't have an account?
            <UButton
              variant="link"
              color="primary"
              :disabled="loading"
              to="/sign-up"
            >
              Create today!
            </UButton>
          </div>
        </UForm>
      </div>
    </UCard>
  </UContainer>
</template>
