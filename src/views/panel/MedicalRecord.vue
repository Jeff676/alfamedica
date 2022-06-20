<script setup>
    import { onMounted, ref, reactive } from 'vue'
    import { useRoute } from 'vue-router'
    import { onGetMedicalRecordDocs, onGetMedicalRecord, getMedicalOrders, addMedicalOrders, getPatientData, getMedicalRecord, addMedicalRecord, getMedicalDocs, addMedicalDoc, updateBackgrounds, updateBasicInfo, updateState } from '@/firebase/patients'

    // PrimeVue components
    import TabView from 'primevue/tabview'
    import TabPanel from 'primevue/tabpanel'
    import InputText from 'primevue/inputtext'
    import Image from 'primevue/image'
    import Button from 'primevue/button'
    import Accordion from 'primevue/accordion'
    import AccordionTab from 'primevue/accordiontab'
    import Dialog from 'primevue/dialog'
    import Chip from 'primevue/chip'
    import Calendar from 'primevue/calendar'
    import Dropdown from 'primevue/dropdown'
    import Textarea from 'primevue/textarea'
    import Fieldset from 'primevue/fieldset'
    import SplitButton from 'primevue/splitbutton'
    import SelectButton from 'primevue/selectbutton'
    import DataTable from 'primevue/datatable'
    import Column from 'primevue/column'
    import ColumnGroup from 'primevue/columngroup'
    import Row from 'primevue/row'

    import Evolutions from '../../components/Evolutions.vue'

    // helpers
    import { patientAge } from '@/helpers/patients'
    import moment from 'moment'
    
    import Toast from 'primevue/toast'
    import { useToast } from "primevue/usetoast"
    const toast = useToast()

    const route = useRoute()

    const patient_id = ref('')
    var patientData = ref(null)
    var id = ref('')
    var name = ref('')
    var profesion = ref('')
    var birthCity = ref('')
    var size = ref('')
    var age = ref(0)
    var gender = ref('')
    var profesion = ref('')
    var birthday = ref('')
    var hospitalized = ref(null)
    var nationalityType = ref('')
    var cedula = ref('')
    var personalBackgrounds = ref('')
    var familyBackgrounds = ref('')

    const genders = ref(['Masculino', 'Femenino'])

    const medicalRecords = ref([])
    const medicalRecordsDocs = ref([])
    
    patient_id.value = route.params.patientid

    var disabledBasicDatafields = ref(true)
    var disabledBackgorunds = ref(true)
    var medicalRecordIsOpen = ref(false)

    const waitDetails = ref(false)

    const saveBasicInfo = async () => {
        const response = await updateBasicInfo(id.value, name.value, size.value, weight.value, gender.value, profesion.value, birthday.value)

        if (response) {
            toast.add({severity:'success', summary: 'Informacion Actualizada', detail: response.id, life: 4000})
            waitSaveMedicalDoc.value = false
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Informacion No fue Guardada' , life: 4000})
            waitSaveMedicalDoc.value = false
        }
        disabledBasicDatafields.value = true
    }

    var medicalDocExiste = ref(false)

    const medicalRecordsContainer = ref(null)

    const showDetails = async (i) => {
        waitDetails.value = true
        const ids = await getMedicalRecord(id.value)
        const medicalRecordId = ids.docs[i].id

        var medicalRecordDocsSnap = []

        onGetMedicalRecordDocs(id.value, medicalRecordId, async () => {
            medicalRecordDocsSnap = await getMedicalDocs(id.value, medicalRecordId)
    
            if (medicalRecordDocsSnap.docs.length > 0) {
                medicalRecordsDocs.value = medicalRecordDocsSnap.docs.map(doc => doc.data())
                medicalRecords.value[i].medicalRecordsDocs = medicalRecordsDocs.value
                medicalDocExiste.value = false
            } else {
                medicalDocExiste.value = true
            }
    
            waitDetails.value = false
            
            setTimeout(() => {
                medicalRecordsContainer.value.$el.parentNode.scrollTo({
                top: screen.height,
                behavior: 'smooth'
            })
            }, 500)
        })
    }


    const showMedicalDocForm = ref(false)
    const medicalDocForm = reactive([])

    const showMedicalDoc = (i, j) => {
        showMedicalDocForm.value = true
        medicalDocForm.title =  medicalRecords.value[i].medicalRecordsDocs[j].title
        medicalDocForm.content =  medicalRecords.value[i].medicalRecordsDocs[j].content
        medicalDocForm.signedBy =  medicalRecords.value[i].medicalRecordsDocs[j].signedBy
    }


    var medicalDocDate = ref(new Date())
    const medicalDocType = ['Informe Medico', 'Informe de Ingreso', 'Informe de Egreso', 'Nota Operatoria']

    var newMedicalDocData = reactive({
        title: '',
        content: '',
        createAt: medicalDocDate,
        signedBy: '' // este campo se debe llenar con los datos del medico que se halla logueado
    })


    var showNewMedicalDocForm = ref(false)

    const newMedicalDocForm = () => {
        showNewMedicalDocForm.value = true
    }


    const currentMedicalRecord = (state) => {
        if (state == 'open') {
            return ' - Historia Actual'
        } else {
            return ''
        }
    }

    var waitSaveMedicalDoc = ref(false)

    const saveMedicalDoc = async () => {
        waitSaveMedicalDoc.value = true
        const ids = await getMedicalRecord(id.value)
        const idMedicalRecord = ids.docs[0].id
        const idPatient = id.value
        
        const response = await addMedicalDoc(newMedicalDocData, idPatient, idMedicalRecord)
        if (response) {
            newMedicalDocData.title = ''
            newMedicalDocData.content = ''
            toast.add({severity:'success', summary: 'Informe Guardado', detail: response.id, life: 4000})
            waitSaveMedicalDoc.value = false
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Informe No fue Guardado' , life: 4000})
            waitSaveMedicalDoc.value = false
        }
        showNewMedicalDocForm.value = false
    }

    const saveBackgrounds = async () => {
        const response = await updateBackgrounds(id.value, personalBackgrounds.value, familyBackgrounds.value)

         if (response) {
            toast.add({severity:'success', summary: 'Antecedentes Actualizados', detail: response.id, life: 4000})
            disabledBackgorunds.value = true
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Antecedentes no fueron actualizados' , life: 4000})

        }
    }

    var newMedicalRecord = reactive({
        reasonForConsultation : '',
        currentIllness: '',
        bloodPresure : '',
        heartRate : '',
        breathingFrequency : '',
        weight : '',
        notes: '',
        diagnostic : '',
        plan : '',
        careBy: '',
        state: '',
        signBy: '' // This field would come from current user if the user us a doctor - don't allow if the user is another type
    })

    var displayNewEntryForm = ref(false)

    const showNewEntryForm = () => {
        displayNewEntryForm.value = true
    }

    const newEntry = async () => {
        const response = await addMedicalRecord(id.value, newMedicalRecord)
        if (response) {
            toast.add({severity:'success', summary: 'Historia Guardada', detail: response.id, life: 4000})
            displayNewEntryForm.value = false
            console.log(response)
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Historia No fue Guardada' , life: 4000})
        }
    }

    const checkOutMedicalRecord = async () => {
        const ids = await getMedicalRecord(id.value)
        const idMedicalRecord = ids.docs[0].id
        const idPatient = id.value

        const response = await updateState(idPatient, idMedicalRecord)

        if (response) {
            toast.add({severity:'success', summary: 'Alta Medica con Exito', detail: response.id, life: 4000})
            displayNewEntryForm.value = false
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Error al Realizar Alta Medica' , life: 4000})
        }
        medicalRecordIsOpen.value = false

    }

     // Example Doctors
    const doctors = [
        {name: 'Dra Torrealba'},
        {name: 'Dr Medina'},
        {name: 'Dr Colmenarez'},
        {name: 'Dra Paez'}
    ]

    const setPatientData = () => {
         patientData.docs.map(doc => {
            id.value = doc.id
            name.value = doc.data().name
            profesion.value = doc.data().profesion
            birthCity.value = doc.data().birthCity
            size.value = doc.data().size
            age.value = patientAge(doc.data().birthday)
            gender.value = doc.data().gender == 'm' ? 'Masculino' : 'Femenino'
            profesion.value = doc.data().profesion
            birthday.value = moment(doc.data().birthday.seconds*1000).format("D-MMM-YYYY")
            hospitalized.value = doc.data().hospitaized
            nationalityType.value = doc.data().nationalityType
            cedula.value = nationalityType.value + "-" + patient_id.value
            personalBackgrounds.value = doc.data().personalBackgrounds
            familyBackgrounds.value = doc.data().familyBackgrounds
        })
    }

    // *** Var Init ***
    const displayMedicalOrdersForm = ref(false)
    const displayMedicalOrders = ref(false)
    const displayMedicineControl = ref(false)
    const medicalOrderType = ref(['Medicamentos', 'Comentarios u Otros'])
    var orderType = ref('Medicamentos')


    // *** Medical Orders Methods ***

    const medicalOrders = ref([]
    )
    const showMedicalOrders = async () => {
        const ids = await getMedicalRecord(id.value)
        const idMedicalRecord = ids.docs[0].id
        const idPatient = id.value

        displayMedicalOrders.value = true
        medicalOrders.value = await getMedicalOrders(idPatient, idMedicalRecord)
    }
    
    const medicalOrdersOptions = [
        {
            label: 'Ver Ordenes Medicas',
            icon: 'pi pi-eye',
            command: () => {
                showMedicalOrders()
            }
        },
        {
            label: 'Agregar Ordenes Medicas',
            icon: 'pi pi-plus',
            command: () => {
                displayMedicalOrdersForm.value = true
            }
        },
    ]

    var medicalOrdersItems = ref([])

    const medicine = ref(null)
    const posology = ref(null)
    const notes = ref(null)
    const customOrder = ref(null)
    const frecuency = [
        {description: 'Stat', frecuency: 0},
        {description: 'Cada hora', frecuency: 1},
        {description: 'Cada 2 horas', frecuency: 2},
        {description: 'Cada 4 horas', frecuency: 4},
        {description: 'Cada 6 horas', frecuency: 6},
        {description: 'Cada 8 horas', frecuency: 8},
        {description: 'Cada 12 horas', frecuency: 12},
        {description: 'Una vez al dia', frecuency: 24},

    ]


    const addMedicalOrder = () => {
        medicalOrdersItems.value.push({medicine: medicine.value, posology: posology.value, notes: notes.value, customOrder: customOrder.value})
        medicine.value=posology.value=notes.value=customOrder.value=null
    }

    const removeMedicalOrder = (i) => {
        medicalOrdersItems.value.splice(i, 1)
        console.log(medicalOrdersItems.value)
    }

    const saveMedicalOrders = async () => {
        const ids = await getMedicalRecord(id.value)
        const idMedicalRecord = ids.docs[0].id
        const idPatient = id.value

        const response = await addMedicalOrders(idPatient, idMedicalRecord, medicalOrdersItems.value)
        if (response) {
            toast.add({severity:'success', summary: 'Ordenes medicas guardas con Exito', detail: response.id, life: 4000})
            medicalOrdersItems.value = []
            displayNewEntryForm.value = false
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Error al Guardar Ordenes medicas' , life: 4000})
        }

        displayMedicalOrdersForm.value = false
        activeIndexPanelPatient.value = 3
    }

    const medicineControlList = ref([])
    const dataTable = ref([])
    const calMedicinesFrecuency = async () => {
        const ids = await getMedicalRecord(id.value)
        const idMedicalRecord = ids.docs[0].id
        const idPatient = id.value

        medicineControlList.value = await getMedicalOrders(idPatient, idMedicalRecord)
        medicineControlList.value.map((orders) => {
            orders.orders.map((order) => {
                if (order.medicine != null) {
                    dataTable.value.push(order)
                }
            })
            })
        console.log(dataTable.value)
    }

    const resetMedicalOrders = () => {
         medicine.value = null
         posology.value = null
         notes.value = null
         customOrder.value = null
    }

    const activeIndexPanelPatient = ref(0)


    onMounted( async () => {
        patientData = await getPatientData(patient_id.value)
        setPatientData()

        var medicalRecordsSnapShot = []
        await onGetMedicalRecord(id.value, async () => {
            medicalRecordsSnapShot = await getMedicalRecord(id.value)
            medicalRecords.value = medicalRecordsSnapShot.docs.map(doc => doc.data())
            medicalRecordIsOpen.value = medicalRecords.value[0].state =='open' ? true : false

        } )
    })

</script>

<template>
    <Toast position="top-center" />

    <TabView :activeIndex="activeIndexPanelPatient" ref="medicalRecordsContainer">
    <!-- *** PERSONAL INFORMATION *** -->
        <TabPanel header="Datos Personales">
            <div class="grid">
                <div class="col-3">
                    <Image src="https://cdn.pixabay.com/photo/2017/02/16/23/10/smile-2072907_960_720.jpg" alt="Image Text" preview width="200" height="200">
                        <template #indicator>
                            <font-awesome-icon icon="eye" />
                        </template>
                    </Image>
                </div>
                <div class="col-9 grid">
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="cedula" type="text" v-model="cedula" :disabled="true"/>
                        <label for="cedula">Cedula</label>
                    </span>
                    <div class="p-float-label text-left mt-4 col-9">
                        <InputText name="name" id="name" type="text" v-model="name" :disabled="disabledBasicDatafields" class="w-full ml-1"/>
                        <label for="name">Nombre y Apellidos</label>
                    </div>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="size" type="text" v-model="size" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="size">Estatura</label>
                    </span>
                    <div class="p-float-label mt-4 col-4">
                        <InputText id="birthCity" type="text" v-model="birthCity" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="birthCity">Ciudad de Nacimiento</label>
                    </div>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="age" type="text" v-model="age" :disabled="true" class="w-full"/>
                        <label for="age">Edad</label>
                    </span>
                </div>
                <div class="col-12 grid">
                    <!-- <span class="col-3 align-self-center">
                         <Chip class="px-5 bg-blue-100" label="Paciente Hospitalizado" />
                    </span> -->
                    <span class="p-float-label text-left mt-4 col-3 col-offset-3">
                        <Dropdown id="gender" :options="genders" v-model="gender" class="w-full" :disabled="disabledBasicDatafields"/>
                        <label for="gender">Genero</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="profesion" type="text" v-model="profesion" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="profesion">Profesion</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <Calendar id="birthday" v-model="birthday" dateFormat="dd/mm/yy" showIcon :disabled="disabledBasicDatafields"/>
                        <label for="birthday">Fecha de Nacimiento</label>
                    </span>
                </div>
                <div class="col-12 flex justify-content-center">
                    <Button label="Editar" class="p-button-success" @click="disabledBasicDatafields=!disabledBasicDatafields" :disabled="!disabledBasicDatafields"></Button>
                    <Button label="Guardar" class="p-button-info mx-5" :disabled="disabledBasicDatafields" @click="saveBasicInfo"></Button>
                    <Button label="Cancelar" class="p-button-danger" :disabled="disabledBasicDatafields" @click="disabledBasicDatafields=!disabledBasicDatafields"></Button>
                </div>
            </div>
        </TabPanel>

    <!-- *** BACKGROUNDS *** -->
        <TabPanel header="Antecedentes">
            <div class="col-12 flex justify-content-start relative">
                <Button icon="pi pi-pencil" label="Editar" @click="disabledBackgorunds=false" v-show="disabledBackgorunds" class="p-button-success absolute top-0"></Button>
            </div>

            <label for="personalBackgrounds">Antecedentes Personales</label>
            <Textarea rows="5" id="personalBackgrounds" type="text" v-model="personalBackgrounds" :disabled="disabledBackgorunds" class="w-full my-3"/>

            <label for="familyBackgrounds">Antecedentes Familiares</label>
            <Textarea rows="5" id="familyBackgrounds" type="text" v-model="familyBackgrounds" :disabled="disabledBackgorunds" class="w-full my-3"/>

            <Button icon="pi pi-save" label="Guardar" @click="saveBackgrounds" class="p-button-success" v-show="!disabledBackgorunds"></Button>
            <Button icon="pi pi-times" label="Cancelar" @click="disabledBackgorunds=true" v-show="!disabledBackgorunds" class="p-button-danger mx-3"></Button>
        </TabPanel>

        <!-- *** CONTACT INFORMATION *** -->
        <TabPanel header="Informacion de Contacto">
            Content III
        </TabPanel>

    <!-- *** MEDICAL RECORD *** -->
        <TabPanel header="Historia Medica">
            <div class="grid">
                <div class="col-2 flex align-content-center">
                    <Button label="Nuevo Ingreso" icon="pi pi-plus" class="p-button-success" :disabled="medicalRecordIsOpen" @click="showNewEntryForm"></Button>
                </div>
                <div class="col-2 flex align-content-center">
                    <Button label="Nueva Consulta" icon="pi pi-plus" class="p-button-info" disabled></Button>
                </div>
                <div class="col-2 flex align-content-center">
                    <Button class="p-button-danger" :disabled="!medicalRecordIsOpen" @click="checkOutMedicalRecord"><font-awesome-icon icon="file-circle-xmark" size="2x"/><span class="ml-3">Cerrar Historia</span></Button>
                </div>
                <div class="col flex align-content-center justify-content-end">
                    <Chip class="px-5 bg-blue-100" :label="`Paciente: ${name}`" />
                </div>
            </div>
            <Accordion :activeIndex="0">
                <AccordionTab v-for="(medicalRecord, index) in medicalRecords" :key="index" :header="`${moment(medicalRecord.createAt.seconds*1000).format('D-MMMM-YYYY')} - ${medicalRecord.diagnostic} ${currentMedicalRecord(medicalRecord.state)}   `">
                    <Fieldset :toggleable="true" :collapsed="true" class="text-left">
                        <template #legend>
                                <span class="font-xl font-bold">{{ name }} </span>
                        </template>
                        <div class="grid">
                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="cedula" type="text" class="col-12" v-model="cedula" :disabled="true"/>
                                <label for="cedula" class="text-sm ml-1">Cedula</label>
                            </span>
                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="age" type="text" class="col-12" v-model="age" :disabled="true"/>
                                <label for="age" class="text-sm ml-1">Edad</label>
                            </span>
                            <span class="p-float-label text-left mt-3 col-12">
                                <Textarea :autoResize="true" id="reasonForConsultation" type="text" v-model="medicalRecord.reasonForConsultation" class="w-full" :disabled="true"/>
                                <label for="reasonForConsultation" class="m-1">Motivo de Consulta</label>
                            </span>
                            
                            <span class="p-float-label text-left col-12">
                                <Textarea :autoResize="true" id="currentIllness" type="text" v-model="medicalRecord.currentIllness" class="w-full" :disabled="true"/>
                                <label for="currentIllness" class="m-1">Enfermedad Actual</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="bloodPresure" type="text" class="col-12" v-model="medicalRecord.bloodPresure" :disabled="true"/>
                                <label for="bloodPresure" class="text-sm ml-1">Tension Arterial</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="heartRate" type="text" class="col-12" v-model="medicalRecord.heartRate" :disabled="true"/>
                                <label for="heartRate" class="text-xs ml-1">Frecuencia Cardiaca</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="breathingFrequency" class="col-12" type="text"  v-model="medicalRecord.breathingFrequency" :disabled="true"/>
                                <label for="breathingFrequency" class="text-xs ml-1">Frecuencia Respiratoria</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="weight" type="text" class="col-12" v-model="medicalRecord.weight" :disabled="true"/>
                                <label for="weight" class="text-sm ml-1">Peso</label>
                            </span>

                            <span class="p-float-label text-left col-12 mt-2">
                                <Textarea :autoResize="true" id="notes" type="text" v-model="medicalRecord.notes" class="w-full" :disabled="true"/>
                                <label for="notes" class="m-1">Observaciones</label>
                            </span>

                            <span class="p-float-label text-left col-12 mt-3">
                                <InputText id="diagnostic" type="text" v-model="medicalRecord.diagnostic" class="w-full" :disabled="true"/>
                                <label for="diagnostic" class="ml-1">Diagnostico</label>
                            </span>

                            <span class="p-float-label col-12 mt-3">
                                <InputText id="plan" type="text" v-model="medicalRecord.plan" class="w-full" :disabled="true"/>
                                <label for="plan" class="ml-1">Plan</label>
                            </span>
                        </div>
                    </Fieldset>

                    <div class="flex">
                        <div class="col flex flex-warp">
                            <Button label="Nuevo Informe" icon="pi pi-plus" class="p-button-help mb-3 w-full" @click="newMedicalDocForm" :disabled="!medicalRecordIsOpen" v-if="medicalRecord.state=='open'"></Button>
                        </div>

                        <div class="col flex flex-warp">
                            <Button label="Ver Informes" @click="showDetails(index)" :loading="waitDetails" icon="pi pi-eye" class="p-button-warning mb-3 w-full"></Button>
                        </div>
                        
                        <div class="col flex flex-warp">
                            <Evolutions title="Evolucion Medica" :id="id" evolutionType="medicalEvolution" />
                        </div>
                        <div class="col flex flex-warp">
                            <Evolutions title="Evolucion de Enfermeria" :id="id" evolutionType="nurseEvolution" />
                        </div>
                        <div class="col flex flex-warp">
                            <!-- <Button class="p-button-sucsess mb-3 w-full" @click="displayMedicalOrdersForm=true"><font-awesome-icon icon="list-check" /><span class="ml-3">Ordenes Medicas</span></Button> -->
                            <SplitButton class="p-button-primary bg-primary mb-3 w-full align-items-center text-white pl-3" :model="medicalOrdersOptions"><font-awesome-icon icon="list-check" />Ordenes Medicas</SplitButton>
                        </div>
                        <div class="col flex flex-warp">
                            <Button class="p-button-success mb-3 w-full" @click="displayMedicineControl=true"><font-awesome-icon icon="syringe" /><span class="ml-3">Control de Med</span></Button>
                        </div>
                    </div>

                    <p v-if="medicalDocExiste">No existen Informes</p>
                    <div class="grid">
                        <Button class="p-button-outlined p-button-secondary m-3 col-2" v-for="(doc, jindex) in medicalRecord.medicalRecordsDocs" :key="index" @click="showMedicalDoc(index, jindex)" >
                            <font-awesome-icon icon="file-medical" size="2x" class="mr-1" />

                            <div>
                                {{ doc.title }} <br>
                                <span class="text-xs">{{ moment(doc.createAt.seconds*1000).format("D-MMM-YYYY") }}</span>
                            </div>
                        </Button>
                    </div>
                </AccordionTab>
            </Accordion>
        </TabPanel>
    </TabView>

<!-- *** DISPLAY MEDICAL ORDERS *** -->
    <Dialog v-model:visible="displayMedicalOrders" class="w-9">
        <template #header>
                <h3 class="font-bold">Ordenes Medicas</h3>
        </template>
            <Accordion :activeIndex="0" class="mt-1">
                <AccordionTab v-for="(item, index) in medicalOrders" :key="index" :header="`${moment(item.createAt.seconds*1000).format('D MMMM YYYY -- h:mm a')}`">
                    <div v-for="(order, subIndex) in item.orders" :key="index" class="flex my-1">
                        <InputText :placeholder="subIndex+1" :disabled="true" class="w-2rem text-center h-auto py-1"/>
                        <div v-if="order.medicine" class="min-w-max py-1 ml-3 itemOrder" :class="`${subIndex % 2 == 0 ? 'bg-custom-1' : 'bg-custom-2'}`"> {{ order.medicine }} </div>
                        <div v-if="order.medicine" class="min-w-max py-1 mx-1 itemOrder" :class="`${subIndex % 2 == 0 ? 'bg-custom-1' : 'bg-custom-2'}`"> {{ order.posology.description }} </div>
                        <div v-if="order.medicine" class="col py-1 itemOrder" :class="`${subIndex % 2 == 0 ? 'bg-custom-1' : 'bg-custom-2'}`"> {{ order.notes }} </div>
                        <div v-if="order.customOrder" class="col py-1 ml-3 itemOrder" :class="`${subIndex % 2 == 0 ? 'bg-custom-1' : 'bg-custom-2'}`"> {{ order.customOrder }} </div>
                    </div>
                    <h3 class="font-bold text-center"> {{ item.signBy }} </h3>

                </AccordionTab>
            </Accordion>
    </Dialog>

<!-- *** ADD MEDICAL ORDERES *** -->
    <Dialog v-model:visible="displayMedicalOrdersForm" class="w-9">
        <template #header>
            <h3 class="font-bold">Ordenes Medicas</h3>
        </template>
        <div class="grid align-items-center">
            <div v-for="(item, index) in medicalOrdersItems" :key="index"  class="flex gap-1 col-12">
                <InputText :placeholder="index+1" :disabled="true" class="w-2rem text-center"/>
                <InputText id="medicine" v-model="medicalOrdersItems[index].medicine" v-if="medicalOrdersItems[index].medicine" class="col-3" type="text" placeholder="Medicamento" :disabled="true"/>
                <InputText id="posology" v-model="medicalOrdersItems[index].posology.description" v-if="medicalOrdersItems[index].medicine" type="text" class="col-3" placeholder="Posologia" :disabled="true"/>
                <InputText id="notes" v-model="medicalOrdersItems[index].notes" v-if="medicalOrdersItems[index].medicine" type="text" class="col" placeholder="Observaciones" :disabled="true"/>
                <InputText id="description" v-model="medicalOrdersItems[index].customOrder" v-if="medicalOrdersItems[index].customOrder" type="text" class="col-11" placeholder="Escriba la orden aqui" :disabled="true"></InputText>
                <Button class="p-button-rounded p-button-danger" icon="pi pi-times" @click="removeMedicalOrder(index)"></Button>
            </div>
            
            <div class="col-12">
                <label for="orderType" class="font-bold">Tipo de Orden</label>
                <SelectButton id="orderType" v-model="orderType" :options="medicalOrderType" @click="resetMedicalOrders"/>
            </div>
            <div class="col-12">
                <div class="flex gap-1" v-if="orderType=='Medicamentos'" >
                    <InputText v-model="medicine"  class="col-3" type="text" placeholder="Medicamento" autofocus/>
                    <Dropdown v-model="posology" :options="frecuency" optionLabel="description" placeholder="Posologia" class="col-3"/>
                    <InputText v-model="notes"  type="text" class="col" placeholder="Observaciones"/>
                    <Button class="p-button-rounded p-button-success" icon="pi pi-plus" @click="addMedicalOrder"></Button>
                </div>
                <div class="flex gap-1" v-if="orderType!='Medicamentos'" >
                    <InputText v-model="customOrder" type="text" class="col-11" placeholder="Escriba la orden aqui"></InputText>
                    <Button class="p-button-rounded p-button-success" icon="pi pi-plus" @click="addMedicalOrder"></Button>
                </div>
            </div>

        </div>
        <template #footer>
                <Button @click="saveMedicalOrders">Guardar</Button>
                <Button class="p-button-danger">Cancelar</Button>
        </template>
    </Dialog>


<!-- *** New Entry form *** -->
    <Dialog v-model:visible="displayNewEntryForm" :maximizable="true" class="m-5 w-7 h-60">
        <template #header>
            <Chip class="px-5 py-3 bg-blue-100 font-bold w-full mr-3">NUEVO INGRESO</Chip>
                
        </template>
        <div class="grid">
            <span class="p-float-label text-left mt-3 col-12">
                <Textarea rows="5" id="reasonForConsultation" type="text" v-model="newMedicalRecord.reasonForConsultation" class="w-full"/>
                <label for="reasonForConsultation" class="m-1">Motivo de Consulta</label>
            </span>
            
            <span class="p-float-label text-left col-12">
                <Textarea rows="5" id="currentIllness" type="text" v-model="newMedicalRecord.currentIllness" class="w-full"/>
                <label for="currentIllness" class="m-1">Enfermedad Actual</label>
            </span>

            <span class="p-float-label text-left mt-4 col-3">
                <InputText id="bloodPresure" type="text" class="col-12" v-model="newMedicalRecord.bloodPresure"/>
                <label for="bloodPresure" class="text-sm ml-1">Tension Arterial</label>
            </span>

            <span class="p-float-label text-left mt-4 col-3">
                <InputText id="heartRate" type="text" class="col-12" v-model="newMedicalRecord.heartRate"/>
                <label for="heartRate" class="text-xs ml-1">Frecuencia Cardiaca</label>
            </span>

            <span class="p-float-label text-left mt-4 col-3">
                <InputText id="breathingFrequency" class="col-12" type="text"  v-model="newMedicalRecord.breathingFrequency"/>
                <label for="breathingFrequency" class="text-xs ml-1">Frecuencia Respiratoria</label>
            </span>

            <span class="p-float-label text-left mt-4 col-3">
                <InputText id="weight" type="text" class="col-12" v-model="newMedicalRecord.weight"/>
                <label for="weight" class="text-sm ml-1">Peso</label>
            </span>

            <span class="p-float-label text-left col-12 mt-2">
                <Textarea rows="5" id="notes" type="text" v-model="newMedicalRecord.notes" class="w-full"/>
                <label for="notes" class="m-1">Observaciones</label>
            </span>

            <span class="p-float-label text-left col-12 mt-3">
                <InputText id="diagnostic" type="text" v-model="newMedicalRecord.diagnostic" class="w-full"/>
                <label for="diagnostic" class="ml-1">Diagnostico</label>
            </span>

            <span class="p-float-label col-12 mt-3">
                <InputText id="plan" type="text" v-model="newMedicalRecord.plan" class="w-full"/>
                <label for="plan" class="ml-1">Plan</label>
            </span>

            <span class="p-float-label col-12 mt-3">
                <Dropdown v-model="newMedicalRecord.careBy" :options="doctors" :filter="true" optionLabel="name" class="w-full"/>
                <label for="plan" class="ml-1">A cargo de</label>
            </span>

        </div>
        <template #footer>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <Button label="Guardar" icon="pi pi-save" class="p-button-success m-2" @click="newEntry"></Button>
                    <Button label="Cancelar" icon="pi pi-times" class="p-button-danger m-2" @click=""></Button>
                </div>
                
                <span class="font-bold">SignedBy Doctor</span>
            </div>
        </template>
    </Dialog>

<!-- *** SHOW MEDICAL DOC *** -->
    <Dialog v-model:visible="showMedicalDocForm" :maximizable="true" class="m-5 w-6 h-6">
        <template #header>
            <h3 class="font-bold"> {{ medicalDocForm.title }} </h3>
        </template>
            
            <p> {{ medicalDocForm.content }} </p>

        <template #footer>
            <h3 class="font-bold"> {{ medicalDocForm.signedBy }} </h3>
        </template>
    </Dialog>

<!-- *** ADD MEDICAL DOCS *** -->
    <Dialog v-model:visible="showNewMedicalDocForm" class="m-5 max-w-max h-8">
        <template #header>
            <h3 class="font-bold"> Nuevo Documento Medico </h3>
        </template>
        <div class="flex justify-content-between">
            <div>
                <Dropdown v-model="newMedicalDocData.title" :options="medicalDocType" placeholder="Seleccione el Tipo de Informe" />
            </div>
            <div>
                <Calendar v-model="medicalDocDate" dateFormat="dd/mm/yy" showIcon /><br>
            </div>
        </div>

            <Textarea v-model="newMedicalDocData.content" rows="10" cols="80" :autoResize="true" class="mt-5" />

        <template #footer>
                <h3 class="font-bold"> Dr Jose Perez </h3>
                <Button label="Guardar Informe" type="button" class="text-white m-2" @click="saveMedicalDoc" :loading="waitSaveMedicalDoc" icon="pi pi-save"></Button>
        </template>
    </Dialog>

<!-- *** MEDICINE CONTROL *** -->
    <Dialog v-model:visible="displayMedicineControl" class="col-8">
        <template #header>
            <h3 class="font-bold">Control de Medicamentos</h3>
        </template>
            <DataTable :value="dataTable">
                <Column field="medicine" header="Medicamento"></Column>
                <Column field="Via" header="Via"></Column>
                <Column field="posology.description" header="Frecuencia"></Column>
                <Column field="posology." header="Dosis"></Column>
            </DataTable>
            <Button @click="calMedicinesFrecuency">Calcular Dosis de Medicamentos</Button>
    </Dialog>

</template>

<style scoped>
    .p-disabled, .p-component:disabled  {
        background-color: rgb(250, 250, 250);
        border: none;
        color: black;
    }

    .itemOrder {
        border: 1px solid rgb(228, 228, 228);
        border-radius: 5px;
        padding: 8px;
    }

    .bg-custom-1 {
        background-color: rgb(220, 245, 253);
        color: #000000;
    }
    .bg-custom-2 {
        background-color: #fdfdfd;
        color: #000000;
    }
</style>