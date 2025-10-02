<script setup lang="ts">
const { loggedIn, signOut } = useAuth()

const clickSignOut = () => {
  signOut({ redirectTo: '/sign-in' })
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <UHeader
      title="Nuxt 4 - Nuxt UI - Drizzle - Postgre - Better Auth Template"
    >
      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/zangetsu02/nuxt-ui-better-auth-template"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          target="_blank"
        />
        <UButton
          v-if="loggedIn"
          color="neutral"
          @click="clickSignOut"
        >
          Sign Out
        </UButton>
      </template>
    </UHeader>
    <UContainer>
      <UMain class="min-h-[calc(100vh-160px)]">
        <slot />
      </UMain>
    </UContainer>
  </div>
</template>
