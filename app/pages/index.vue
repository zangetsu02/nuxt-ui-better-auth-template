<script setup lang="ts">
const { user, session } = useAuth()
</script>

<template>
  <div>
    <UPageBody>
      <h3 class="text-xl font-bold">
        User
      </h3>
      <pre>{{ user }}</pre>
      <h3 class="text-xl font-bold mt-2">
        Session
      </h3>
      <pre>{{ session }}</pre>
    </UPageBody>
  </div>
</template>
