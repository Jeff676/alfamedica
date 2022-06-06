<script setup>
    import { onMounted, ref, reactive } from 'vue'
    import { useRoute } from 'vue-router'
    import { getPatientData, getMedicalRecord, addMedicalRecord, getMedicalDocs, addMedicalDoc, updateBackgrounds } from '@/firebase/patients'

    // PrimeVue components
    import TabView from 'primevue/tabview'
    import TabPanel from 'primevue/tabpanel'
    import InputText from 'primevue/inputtext'
    import Image from 'primevue/image'
    import InputSwitch from 'primevue/inputswitch'
    import Button from 'primevue/button'
    import Accordion from 'primevue/accordion'
    import AccordionTab from 'primevue/accordiontab'
    import Dialog from 'primevue/dialog'
    import Chip from 'primevue/chip'
    // import ProgressSpinner from 'primevue/progressspinner'
    import Calendar from 'primevue/calendar'
    import Dropdown from 'primevue/dropdown'
    import Textarea from 'primevue/textarea'
    // import Card from 'primevue/card'
    import Fieldset from 'primevue/fieldset';

    import Evolutions from '../../components/Evolutions.vue'

    // helpers
    import { patientAge } from '@/helpers/patients'
    // import { fixLocalTimeVZLA } from '@/helpers/fixLocalTimeVZLA'
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
    var weight = ref(0)
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

    const medicalRecords = ref([])
    
    patient_id.value = route.params.patientid

    var disabledBasicDatafields = ref(true)
    var disabledBackgorunds = ref(true)

    const medicalRecordsDocs = ref([])
    const waitDetails = ref(false)
    var disabledNewEntryButton = ref(false)

    var medicalDocExiste = ref(false)

    const showDetails = async (i) => {
        waitDetails.value = true
        const ids = await getMedicalRecord(id.value)
        const medicalRecordId = ids.docs[i].id

        const medicalRecordDocsSnap = await getMedicalDocs(id.value, medicalRecordId)
        if (medicalRecordDocsSnap.docs.length > 0) {
            medicalRecordsDocs.value = medicalRecordDocsSnap.docs.map(doc => doc.data())
            medicalRecords.value[i].medicalRecordsDocs = medicalRecordsDocs.value
            medicalDocExiste.value = false
        } else {
            medicalDocExiste.value = true
        }

        waitDetails.value = false
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

    onMounted( async () => {
        patientData = await getPatientData(patient_id.value)
        patientData.docs.map(doc => {
            id.value = doc.id
            name.value = doc.data().name
            profesion.value = doc.data().profesion
            weight.value = doc.data().weight
            size.value = doc.data().size
            age.value = patientAge(doc.data().birthday)
            gender.value = doc.data().gender.value == 'm' ? 'Masculino' : 'Femenino'
            profesion.value = doc.data().profesion
            birthday.value = moment(doc.data().birthday.seconds*1000).format("D-MMM-YYYY")
            hospitalized.value = doc.data().hospitaized
            nationalityType.value = doc.data().nationalityType
            cedula.value = nationalityType.value + "-" + patient_id.value
            personalBackgrounds.value = doc.data().personalBackgrounds
            familyBackgrounds.value = doc.data().familyBackgrounds
        })
        const medicalRecordsSnapShot = await getMedicalRecord(id.value)
        medicalRecords.value = medicalRecordsSnapShot.docs.map(doc => doc.data())
        disabledNewEntryButton.value = medicalRecords.value[0].state =='open' ? true : false

    })

</script>

<template>
    <Toast position="top-center" />

    <TabView>
        <TabPanel header="Datos Personales">
            <div class="grid">
                <div class="col-3">
                    <Image src="https://cdn.pixabay.com/photo/2017/02/16/23/10/smile-2072907_960_720.jpg" alt="Image Text" preview width="150" height="150">
                        <template #indicator>
                            <font-awesome-icon icon="eye" />
                        </template>
                    </Image>
                </div>
                <div class="col-9 grid">
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="cedula" type="text" v-model="cedula" :disabled="disabledBasicDatafields"/>
                        <label for="cedula">Cedula</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-9">
                        <InputText id="name" type="text" v-model="name" :disabled="disabledBasicDatafields" class="w-full ml-1"/>
                        <label for="name">Nombre y Apellidos</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="size" type="text" v-model="size" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="size">Estatura</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="weight" type="text" v-model="weight" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="weight">Peso (Kg)</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="age" type="text" v-model="age" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="age">Edad</label>
                    </span>
                </div>
                <div class="col-12 grid">
                    <span class="col-3">
                        <span>Paciente Hospitalizado</span><br>
                        <InputSwitch v-model="hospitalized" class=" mt-2" :disabled="disabledBasicDatafields"/>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="gender" type="text" v-model="gender" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="gender">Genero</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="profesion" type="text" v-model="profesion" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="profesion">Profesion</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="birthday" type="text" v-model="birthday" :disabled="disabledBasicDatafields" class="w-full"/>
                        <label for="birthday">Fecha de Nacimiento</label>
                    </span>
                </div>
                <div class="col-12 flex">
                    <Button label="Editar" class="p-button-success" @click="disabledBasicDatafields=!disabledBasicDatafields"></Button>
                </div>
            </div>
        </TabPanel>

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

        <TabPanel header="Informacion de Contacto">
            Content III
        </TabPanel>

        <TabPanel header="Historia Medica">
            <div class="grid">
                <div class="col-2 flex align-content-center">
                    <Button label="Nuevo Ingreso" icon="pi pi-plus" class="p-button-success" :disabled="disabledNewEntryButton" @click="showNewEntryForm"></Button>
                </div>
                <div class="col-2 flex align-content-center">
                    <Button label="Nueva Consulta" icon="pi pi-plus" class="p-button-info" disabled></Button>
                </div>
                <div class="col flex align-content-center justify-content-end">
                    <Chip class="px-5 bg-blue-100" :label="`Paciente: ${name}`" />
                </div>
            </div>
            <Accordion :activeIndex="0">
                <AccordionTab v-for="(medicalRecord, index) in medicalRecords" :key="index" :header="`${moment(medicalRecord.createAt.seconds*1000).format('D-MMMM-YYYY')} - ${medicalRecord.diagnostic} ${currentMedicalRecord(medicalRecord.state)}   `">
                    <Fieldset :toggleable="true" :collapsed="true">
                        <template #legend class="">
                            <span class="font-xl font-bold">{{ name }}</span>
                            {{ cedula }} <br/>
                            {{ age }}
                        </template>
                        Content
                        <div class="grid">
                            <span class="p-float-label text-left mt-3 col-12">
                                <Textarea :autoResize="true" id="reasonForConsultation" type="text" v-model="medicalRecord.reasonForConsultation" class="w-full"/>
                                <label for="reasonForConsultation" class="m-1">Motivo de Consulta</label>
                            </span>
                            
                            <span class="p-float-label text-left col-12">
                                <Textarea rows="5" id="currentIllness" type="text" v-model="medicalRecord.currentIllness" class="w-full"/>
                                <label for="currentIllness" class="m-1">Enfermedad Actual</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="bloodPresure" type="text" class="col-12" v-model="medicalRecord.bloodPresure"/>
                                <label for="bloodPresure" class="text-sm ml-1">Tension Arterial</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="heartRate" type="text" class="col-12" v-model="medicalRecord.heartRate"/>
                                <label for="heartRate" class="text-xs ml-1">Frecuencia Cardiaca</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="breathingFrequency" class="col-12" type="text"  v-model="medicalRecord.breathingFrequency"/>
                                <label for="breathingFrequency" class="text-xs ml-1">Frecuencia Respiratoria</label>
                            </span>

                            <span class="p-float-label text-left mt-4 col-3">
                                <InputText id="weight" type="text" class="col-12" v-model="medicalRecord.weight"/>
                                <label for="weight" class="text-sm ml-1">Peso</label>
                            </span>

                            <span class="p-float-label text-left col-12 mt-2">
                                <Textarea rows="5" id="notes" type="text" v-model="medicalRecord.notes" class="w-full"/>
                                <label for="notes" class="m-1">Observaciones</label>
                            </span>

                            <span class="p-float-label text-left col-12 mt-3">
                                <InputText id="diagnostic" type="text" v-model="medicalRecord.diagnostic" class="w-full"/>
                                <label for="diagnostic" class="ml-1">Diagnostico</label>
                            </span>

                            <span class="p-float-label col-12 mt-3">
                                <InputText id="plan" type="text" v-model="medicalRecord.plan" class="w-full"/>
                                <label for="plan" class="ml-1">Plan</label>
                            </span>
                        </div>
                    </Fieldset>

                            <!-- <p>Enfermedad Actual: {{ medicalRecord.currentIllness }}</p>
                            <p>Plan: {{ medicalRecord.plan }}</p> -->
                    
                    <div class="flex">
                        <div class="col-3 flex flex-warp">
                            <Button label="Nuevo Informe" icon="pi pi-plus" class="p-button-help mb-3 w-full" @click="newMedicalDocForm" :disabled="!hospitalized" v-if="medicalRecord.state=='open'"></Button>
                        </div>

                        <div class="col-3 flex flex-warp">
                            <Button label="Ver Informes" @click="showDetails(index)" :loading="waitDetails" icon="pi pi-eye" class="p-button-warning mb-3 w-full"></Button>
                        </div>
                        
                        <div class="col-3 flex flex-warp">
                            <Evolutions title="Evolucion Medica" :id="id" evolutionType="medicalEvolution" />
                        </div>
                        <div class="col-3 flex flex-warp">
                            <Evolutions title="Evolucion de Enfermeria" :id="id" evolutionType="nurseEvolution" />
                        </div>
                    </div>

                    <p v-if="medicalDocExiste">No existen Domuentos</p>
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

    <Dialog v-model:visible="showMedicalDocForm" :maximizable="true" class="m-5 w-6 h-6">
        <template #header>
            <h3 class="font-bold"> {{ medicalDocForm.title }} </h3>
        </template>
            
            <p> {{ medicalDocForm.content }} </p>

        <template #footer>
                <h3 class="font-bold"> {{ medicalDocForm.signedBy }} </h3>
        </template>
    </Dialog>

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

</template>

<style>
    .p-disabled, .p-component:disabled  {
        background-color: rgb(245, 245, 245);
        border: 1px solid rgb(226, 226, 226);
    }
</style>