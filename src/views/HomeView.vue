<script setup>
  import { useRouter } from 'vue-router'
  import  { getAuth, signOut } from  'firebase/auth'
  import Button from 'primevue/button'

  const router =useRouter()
  const auth = getAuth()

  const singOut = ()=>{
    signOut(auth)
    .then(()=> {
      console.log('Singout successfull')
      router.replace({name: 'login'})
    })
    .catch((e)=> console.error(e))
  }
</script>

<template>
  <h1>Home page</h1>
  <router-link to="/panel"> Panel</router-link>
  <Button @click="singOut">Cerrar Sesion</Button>
</template>
