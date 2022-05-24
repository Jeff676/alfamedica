<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

    import Card from 'primevue/card'
    import Button from 'primevue/button'
    import Dialog from 'primevue/dialog'
    import ProgressSpinner from 'primevue/progressspinner'

    // v-model form
    const email = ref('')
    const password = ref('')
    const errorMsg = ref('')
    const waiting = ref(false)

    // Inputs Reference to focus
    const userInputRef = ref(null)
    const passwordInputRef = ref(null)

    // Router
    const router = useRouter()

    const login = ()=> {
        const auth = getAuth()
        waiting.value = true

        signInWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential)=> {
                const user = userCredential.user
                errorMsg.value = ''
                router.replace({name: 'home'})
                waiting.value = false
            })
            .catch((error) => {
                waiting.value = false
                console.error(error.code)
                if (error.code == 'auth/wrong-password') {
                    passwordInputRef.value.focus()
                    errorMsg.value = 'Contaseña Incorrecta'
                } else if (error.code == 'auth/user-not-found') {
                        userInputRef.value.focus()
                        errorMsg.value = 'Usuario Incorrecto'
                    } else {
                        errorMsg.value = error.code
                        userInputRef.value.focus()
                    }
            });

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
                Iniciar Sesion
            </template>
            <template #content>
                <form @submit.prevent="login">
                        <label for="username" class="text-xs">Correo Electronico</label>
                        <input id="username" type="text" v-model="email" ref="userInputRef" class="p-inputtext w-full appearance-none" required>
                        
                        <label for="password" class="text-xs">Contraseña</label>
                        <input id="password" type="text" v-model="password" ref="passwordInputRef" class="p-inputtext w-full appearance-none" required>
                    
                <Button label="Iniciar Sesion" class="w-full mt-4" type="submit"/>
                </form>
            </template>
            <template #footer>
                <span>Registrate  </span><router-link to="/register"><a>Aqui!</a></router-link>

                <p class="text-red-500"> {{ errorMsg }} </p>
            </template>
        </Card>
    </div>
</template>