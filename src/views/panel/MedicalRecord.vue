<script setup>
    import { onMounted, ref, reactive } from 'vue'
    import { useRoute } from 'vue-router'
    import { getPatientData, getMedicalRecord, addMedicalRecord, getMedicalDocs, addMedicalDoc } from '@/firebase/patients'

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
    import ProgressSpinner from 'primevue/progressspinner'
    import Calendar from 'primevue/calendar'
    import Dropdown from 'primevue/dropdown'
    import Textarea from 'primevue/textarea'

    // helpers
    import { patientAge } from '@/helpers/patients'
    import moment from 'moment'
    
    import Toast from 'primevue/toast'
    import { useToast } from "primevue/usetoast"
    const toast = useToast()

    const route = useRoute()
    // const displayDetails = ref(false)

    // Cuando haga un nuevo documento necesitare esto
    // const medicalRecordDocs = [
    //     {label: 'Evolucion de enfermeria', icon: 'pi pi-book'},
    //     {label: 'Evolucion Medica', icon: 'pi pi-plus'},
    //     {label: 'Informe Ingreso', icon: 'pi pi-plus'},
    //     {label: 'Informe de Egreso', icon: 'pi pi-book'},
    //     {label: 'Nota Operatoria', icon: 'pi pi-plus'},
    //     {label: 'Odenes Medicas', icon: 'pi pi-book'},
    // ]

    // Items para boton tipo split tal vez no los use
    // const newMedicalRecorditems = [
    //     {
    //         label: 'Consulta',
    //         icon: 'pi pi-plus-circle',
    //         command: () => {
    //             console.log('Nueva historia de consulta')
    //         }
    //     },
    //     {
    //         label: 'Quirurgica',
    //         icon: 'pi pi-plus-circle',
    //         command: () => {
    //             console.log('Nueva historia de Cirugia')
    //         }
    //     },
    // ]

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

    const medicalRecords = ref([])
    
    patient_id.value = route.params.patientid

    const saveMedicalRecor = async () => {
        const docId = await addMedicalRecord(id.value, 'Dolor abdominal', 'Apendicitis aguda')
        console.log(docId)
    }

    const medicalRecordsDocs = ref([])
    const waitDetails = ref(false)
    const showDetails = async (i) => {
        waitDetails.value = true
        const ids = await getMedicalRecord(id.value)
        const medicalRecordId = ids.docs[i].id

        const medicalRecordDocsSnap = await getMedicalDocs(id.value, medicalRecordId)
        medicalRecordsDocs.value = medicalRecordDocsSnap.docs.map(doc => doc.data())
        medicalRecords.value[i].medicalRecordsDocs = medicalRecordsDocs.value
        waitDetails.value = false
    }

    const medicalDocForm = reactive([])
    const showMedicalDoc = (i, j) => {
        showMedicalDocForm.value = true
        medicalDocForm.title =  medicalRecords.value[i].medicalRecordsDocs[j].title
        medicalDocForm.content =  medicalRecords.value[i].medicalRecordsDocs[j].content
        medicalDocForm.signedBy =  medicalRecords.value[i].medicalRecordsDocs[j].signedBy
    }

    
    var showNewMedicalDocForm = ref(false)
    var medicalDocDate = ref(new Date())
    const medicalDocType = ['Informe Medico', 'Informe de Ingreso', 'Informe de Egreso', 'Nota Operatoria']

    var newMedicalDocData = reactive({
        title: '',
        content: '',
        createAt: medicalDocDate,
        signedBy: '' // este campo se debe llenar con los datos del medico que se halla logueado
    })

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

    const showMedicalDocForm = ref(false)

    const saveMedicalDoc = async () => {
        const ids = await getMedicalRecord(id.value)
        const idMedicalRecord = ids.docs[0].id
        const idPatient = id.value
        
        const response = await addMedicalDoc(newMedicalDocData, idPatient, idMedicalRecord)
        console.log(response)
        if (response) {
            toast.add({severity:'success', summary: 'Informe Guardado', detail: response.id, life: 4000})
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Informe No fue Guardado' , life: 4000})

        }
        showNewMedicalDocForm.value = false
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
        })
        const medicalRecordsSnapShot = await getMedicalRecord(id.value)
        medicalRecords.value = medicalRecordsSnapShot.docs.map(doc => doc.data())
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
                        <InputText id="cedula" type="text" v-model="cedula" disabled/>
                        <label for="cedula">Cedula</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-9">
                        <InputText id="name" type="text" v-model="name" disabled class="w-full ml-1"/>
                        <label for="name">Nombre y Apellidos</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="size" type="text" v-model="size" disabled class="w-full"/>
                        <label for="size">Estatura</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="weight" type="text" v-model="weight" disabled class="w-full"/>
                        <label for="weight">Peso (Kg)</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-4">
                        <InputText id="age" type="text" v-model="age" disabled class="w-full"/>
                        <label for="age">Edad</label>
                    </span>
                </div>
                <div class="col-12 grid">
                    <span class="col-3">
                        <span>Paciente Hospitalizado</span><br>
                        <InputSwitch v-model="hospitalized" class=" mt-2" disabled/>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="gender" type="text" v-model="gender" disabled class="w-full"/>
                        <label for="gender">Genero</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="profesion" type="text" v-model="profesion" disabled class="w-full"/>
                        <label for="profesion">Profesion</label>
                    </span>
                    <span class="p-float-label text-left mt-4 col-3">
                        <InputText id="birthday" type="text" v-model="birthday" disabled class="w-full"/>
                        <label for="birthday">Fecha de Nacimiento</label>
                    </span>
                </div>
            </div>
        </TabPanel>
        <TabPanel header="Antecedentes">
            Content II
        </TabPanel>
        <TabPanel header="Informacion de Contacto">
            Content III
        </TabPanel>
        <TabPanel header="Historia Medica">
            <div class="grid">
                <div class="col-2 flex align-content-center">
                    <Button label="Nuevo Ingreso" icon="pi pi-plus" class="p-button-success" :disabled="hospitalized"></Button>
                </div>
                <div class="col-2 flex align-content-center">
                    <Button label="Nueva Consulta" icon="pi pi-plus" class="p-button-info"></Button>
                </div>
                <div class="col flex align-content-center justify-content-end">
                    <Chip class="px-5 bg-blue-100" :label="`Paciente: ${name}`" />
                </div>
                
                
            </div>
            <Accordion  :multiple="true" :activeIndex="0">
                <AccordionTab v-for="(medicalRecord, index) in medicalRecords" :key="index" :header="`${moment(medicalRecord.createAt.seconds*1000).format('D-MMM-YYYY')} - ${medicalRecord.diagnostic} ${currentMedicalRecord(medicalRecord.state)}   `">
                    <div class="col-2 flex align-content-center">
                        <Button label="Nuevo Documento" icon="pi pi-plus" class="p-button-help" @click="newMedicalDocForm" :disabled="!hospitalized" v-if="medicalRecord.state=='open'"></Button>
                    </div>
                    <p class="text-justify">Enfermedad Actual: {{ medicalRecord.currentSick }}</p>
                    <p class="text-justify">Plan: {{ medicalRecord.plan }}</p>

                    <div class="col-4 flex flex-warp">
                        <Button label="Ver Detalles" @click="showDetails(index)" icon="pi pi-plus" class="p-button-warning mb-3 min-w-min"></Button>
                        <ProgressSpinner class="h-2rem mx-0" v-if="waitDetails"/>
                    </div>

                    <div class="flex justify-content-start">
                        <Button class="p-button-outlined p-button-secondary mr-3" v-for="(doc, jindex) in medicalRecord.medicalRecordsDocs" :key="index" @click="showMedicalDoc(index, jindex)" >
                            <font-awesome-icon icon="file-medical" size="2x" class="mr-1" />
                            {{ doc.title }}
                        </Button>
                    </div>

                    <!-- <SplitButton label="Save" icon="pi pi-plus" :model="medicalRecordDocs"></SplitButton> -->
                    <!-- <SpeedDial :model="medicalRecordDocs" :radius="120" direction="up-right" type="quarter-circle" buttonClass="p-button-success" /> -->
                            <!-- <Button type="button" class="p-button-help p-button-rounded" @click="showDetails(medicalRecord)">Ver Detalles</Button> -->
                </AccordionTab>
            </Accordion>
        </TabPanel>
    </TabView>


    <Button  type="button" class="text-white mt-5" @click="saveMedicalRecor">Guardar Historia</Button>

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
                <Button  type="button" class="text-white" @click="saveMedicalDoc">Guardar Historia</Button>
        </template>
    </Dialog>
</template>

<style>
    .p-disabled, .p-component:disabled  {
        background-color: rgb(226, 226, 226);
        border: 1px solid rgb(226, 226, 226);
    }
</style>