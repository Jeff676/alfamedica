import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'slidebar-active-class',
  routes: [
    {
      path: '/',
      name: 'login',
      component: ()=> import('@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: ()=> import('@/views/Register.vue')
    },
    {
      path: '/completeregister',
      name: 'CompleteRegister',
      component: () => import('@/views/CompleteRegister.vue'),
      meta: { requiresAuth: true}
    },
    {
      path: '/panel',
      name: 'panel',
      component: () => import('@/views/Panel.vue'),
      children: [
        {path: 'patients',      name: 'patients',       component: () => import('@/views/panel/Patients.vue')},
        {path: 'doctors',       name: 'doctors',        component: () => import('@/views/panel/Doctors.vue')},
        {path: 'dashboard',     name: 'dashboard',      component: () => import('@/views/panel/Dashboard.vue')},
        {path: 'kpis',          name: 'kpis',           component: () => import('@/views/panel/Kpis.vue')},
        {path: 'newPatient',    name: 'newPatient',     component: () => import('@/views/panel/NewPatient.vue')},
        {path: 'medicalrecord/:patientid', name: 'medicalRecord',  component: () => import('@/views/panel/MedicalRecord.vue')}
      ]
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: ()=> import('@/views/NotFound.vue')
    },
  ]
})

router.beforeEach((to, from, next) => {
  let auth = getAuth()

  console.log(to.name)
  console.log('Usuario actual ', auth.currentUser)

  if (to.meta.requiresAuth == true && auth.currentUser == null) {
    next({ name: 'login' })
  } else next()

})

export default router
