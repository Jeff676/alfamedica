<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

    import Card from 'primevue/card'
    import Button from 'primevue/button'
    import Dialog from 'primevue/dialog'
    import ProgressSpinner from 'primevue/progressspinner'

    // v-model form
    const email = ref('')
    const displayName = ref('')
    const password = ref('')
    const repeatPassword = ref('')
    const errorMsg = ref('')
    const waiting = ref(false)

    // Inputs Reference to focus
    const userInputRef = ref(null)
    const passwordInputRef = ref(null)

    // Router
    const router = useRouter()


    const register =async  () => {
        const auth = getAuth()
        if (password.value === repeatPassword.value) {
            waiting.value = true
            await createUserWithEmailAndPassword(auth, email.value, password.value)
                .then(async (userCredential) => {
                    await updateProfile(auth.currentUser, {displayName: displayName.value})
                    .catch((error) => {
                        waiting.value = false
                        console.error(error.code)
                        errorMsg.value = error.message
                    })
                    // Signed in
                    waiting.value = false
                    const user = userCredential.user
                    console.log(user.uid)
                    errorMsg.value = ''
                    router.replace({name: 'CompleteRegister'})
                })
                .catch((error) => {
                    waiting.value = false
                    console.error(error.code)
                    errorMsg.value = error.message
                })

        } else {
            errorMsg.value='Las contraseñas no coinciden'
            passwordInputRef.value.focus()
        }
    }

    onMounted(()=> {
        userInputRef.value.focus()
    })

</script>

<template>
    <Dialog v-model:visible="waiting" modal contentStyle="background-color: transparent;" :closable="false" :showHeader="false">
        <ProgressSpinner strokeWidth="3"/>
    </Dialog>

    <div class="flex justify-content-center align-content-center flex-wrap" style="height: 90vh">
        <Card class="col-4 bg-bluegray-100" style="min-width: 330px;">
            <template #title>
                <font-awesome-icon icon="wheelchair-move"/>
                Registre su Usuario
            </template>
            <template #content>
                <form @submit.prevent="register">
                        <label for="displayName" class="text-xs">Nombre</label>
                        <input id="displayName" type="text" v-model="displayName" class="p-inputtext w-full appearance-none" required>
                        
                        <label for="username" class="text-xs">Correo Electronico</label>
                        <input id="username" type="text" v-model="email" ref="userInputRef" class="p-inputtext w-full appearance-none" required>
                        
                        <label for="password" class="text-xs">Contraseña</label>
                        <input id="password" type="text" v-model="password" ref="passwordInputRef" class="p-inputtext w-full appearance-none" required>
                        
                        <label for="repeatPassword" class="text-xs">Repita Contraseña</label>
                        <input id="repeatPassword" type="text" v-model="repeatPassword" class="p-inputtext w-full appearance-none" required>
                    
                <Button label="Registrese" class="w-full mt-4" type="submit"/>
                </form>
            </template>
            <template #footer>
                <span>Ya me he registrado! </span><router-link to="/"><a>Iniciar Sesion</a></router-link>
                
                <p class="text-red-500"> {{ errorMsg }} </p>
            </template>
        </Card>
    </div>
</template>