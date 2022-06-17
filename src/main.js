import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'                  // Prime Vue
import 'primevue/resources/themes/saga-blue/theme.css'  // theme
import 'primevue/resources/primevue.min.css'            // core css
import 'primeflex/primeflex.css'                        // PrimeFlex
import 'primeicons/primeicons.css' 
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip'

import { library } from '@fortawesome/fontawesome-svg-core'  // import the fontawesome core
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'  // import font awesome icon component

/* import specific icons */
import { faSyringe, faListCheck, faFileCircleXmark, faFileMedical, faEye, faWheelchairMove, faArrowRight, faUserDoctor, faClipboardUser, faFilter, faPlus, faPersonCane, faHouseMedical, faStaffAesculapius, faPersonDress, faPerson, faTruckMedical, faWarehouse, faScrewdriverWrench, faChartLine, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import moment from 'moment'

/* add icons to the library */
library.add( faSyringe, faListCheck, faFileCircleXmark, faFileMedical, faEye, faWheelchairMove, faArrowRight, faUserDoctor, faFilter, faPlus, faClipboardUser, faPersonCane, faHouseMedical, faStaffAesculapius, faPersonDress, faPerson, faTruckMedical, faWarehouse, faScrewdriverWrench, faChartLine, faMagnifyingGlass)

import { firebaseApp } from '@/firebase/init.js'

moment.updateLocale('en', {
    months : [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
})

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(router)
    .use(PrimeVue)
    .use(ToastService)
    .use(ConfirmationService)
    .directive('tooltip', Tooltip)
    .mount('#app')
