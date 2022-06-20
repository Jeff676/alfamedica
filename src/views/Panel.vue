<script setup>
    import { ref, onMounted } from 'vue'

    // Components
    import NavBar from '../components/NavBar.vue'

    // import { getAuth } from '@firebase/auth'
    // const auth = getAuth()
    // const user = auth.currentUser

    // Toast - Important Messages
    import Toast from 'primevue/toast'
    import { useToast } from "primevue/usetoast"
    
    import Dialog from 'primevue/dialog'
    import ProgressSpinner from 'primevue/progressspinner'
    const waiting = ref(false)

    const menuItems = [
        {to: '/panel/dashboard', icon: 'house-medical', name: 'Dashboard'},
        {to: '/panel/patients', icon: 'wheelchair-move', name: 'Pacientes'},
        {to: '/panel/doctors', icon: 'user-doctor', name: 'Medicos'},
        {to: '/panel/kpis', icon: 'chart-line', name: 'Indicadores'},
        {to: '/panel/kpis', icon: 'gear', name: 'Configuracion'},

    ]

    const toast = useToast('')

    var widthSideBar = ref(1)
    var widthMain = ref(10)
    var rotateAnimation = ref('')
    var displayMenu = ref(false)

    const swichSideBar = () => {
        if (widthSideBar.value === 1) {
            widthSideBar.value = 2
            widthMain.value = 9
            rotateAnimation.value = 'button-side-bar-left'
            setTimeout(() => {
                displayMenu.value = true
            }, 600);
        } else {
            setTimeout(() => {
                widthSideBar.value = 1
                widthMain.value = 10
                rotateAnimation.value = ''
            }, 100);
            displayMenu.value = false
        }
    }

    // onMounted(() => {
    //     toast.add({severity:'error', summary: 'Error al obtener los datos', detail:"Error", life: 4000});
    // })
    
</script>

<template>
    <!-- Important messages -->
    <Toast position="top-center" />

    <Dialog v-model:visible="waiting" modal contentStyle="background-color: transparent;" :closable="false" :showHeader="false">
        <ProgressSpinner strokeWidth="3"/>
    </Dialog>
    
    <!-- <NavBar :displayName="user.displayName"/> -->
    <NavBar displayName="displayName"/>

    <div class="flex mainView text-center">
        <div :class="`col-${widthSideBar}`" class="transitionWidth bg-blue-300">
            <div @click="swichSideBar" class="button-side-bar bg-blue-100 max-w-min cursor-pointer" :class="rotateAnimation">
                <font-awesome-icon icon="arrow-right"/>
            </div>

            <div class="mb-5" v-for="(item, index) in menuItems" :key="index">
                <router-link :to=item.to class=" no-underline">
                    <font-awesome-icon :icon=item.icon size="2x"/>
                    <Transition name="fade">
                        <span v-show="displayMenu" class="ml-2 text-lg"> {{ item.name }} </span>
                    </Transition>
                </router-link>
            </div>
    
        </div>

        <div :class="`col-${widthMain}`" class="transitionWidth bg-blue-100 mainPanel">
            <router-view></router-view>
        </div>
        
        <div class="col-1 bg-blue-300">
             
        </div>
    </div>
</template>

<style>
    .mainView {
        height: 85vh;
    }

    .mainPanel {
        overflow-y: scroll;
    }

    .button-side-bar {
        position: relative;
        top: 50%;
        left: 100%;
        border-radius: 50%;
        padding: 3px;
        transition: 0.5s;
    }

    .button-side-bar-left {
        transform: rotate(180deg);
    }

    .transitionWidth {
        transition: width 0.5s;
        transition-delay: 0.2s;
    }

    .fade-v-enter-active {
        transition: opacity 0.3s ease;
    }

    .fade-v-enter-from {
        opacity: 0;
    }
</style>