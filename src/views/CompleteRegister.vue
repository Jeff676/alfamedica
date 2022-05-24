<script setup>
    import { getAuth } from 'firebase/auth'

    const auth = getAuth()
    const user = auth.currentUser

</script>


<template>
    <h1>
       Welcome {{ user.displayName }} - {{ user.userLevel }}
    </h1>
</template>