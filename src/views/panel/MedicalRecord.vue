<script setup>
    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import { getPatientData, getMedicalRecord, addMedicalRecord } from '@/firebase/patients'

    import TabView from 'primevue/tabview'
    import TabPanel from 'primevue/tabpanel'
    import InputText from 'primevue/inputtext'
    import Image from 'primevue/image'
    import InputSwitch from 'primevue/inputswitch'
    import Button from 'primevue/button'
    import Accordion from 'primevue/accordion'
    import AccordionTab from 'primevue/accordiontab'
    import Dialog from 'primevue/dialog'
    import SpeedDial from 'primevue/speeddial'

    import SplitButton from 'primevue/splitbutton'

    // helpers
    import { patientAge } from '@/helpers/patients'
    import moment from 'moment'

    const route = useRoute()
    const displayDetails = ref(false)

    const medicalRecordDocs = [
        {label: 'Evolucion de enfermeria', icon: 'pi pi-book'},
        {label: 'Evolucion Medica', icon: 'pi pi-plus'},
        {label: 'Informe Ingreso', icon: 'pi pi-plus'},
        {label: 'Informe de Egreso', icon: 'pi pi-book'},
        {label: 'Nota Operatoria', icon: 'pi pi-plus'},
        {label: 'Odenes Medicas', icon: 'pi pi-book'},
    ]

    const newMedicalRecorditems = [
        {
            label: 'Consulta',
            icon: 'pi pi-plus-circle',
            command: () => {
                console.log('Nueva historia de consulta')
            }
        },
        {
            label: 'Quirurgica',
            icon: 'pi pi-plus-circle',
            command: () => {
                console.log('Nueva historia de Cirugia')
            }
        },
    ]

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

    var medicalRecords = ref([])
    
    patient_id.value = route.params.patientid

    const saveMedicalRecor = async () => {
        const docId = await addMedicalRecord(id.value, 'Dolor abdominal', 'Apendicitis aguda')
        console.log(docId)
    }

    var diagnostic = ref('')
    const showDetails = (data) => {
        diagnostic.value = data.diagnostic
        displayDetails.value = true
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
    <div class="grid">
        <div class="col-2 flex align-content-center">
            <SplitButton label="Nueva Historia" icon="pi pi-plus" :model="newMedicalRecorditems" class="p-button-success"></SplitButton>
        </div>
        <div class="col-10">
            <h1>Historia Medica</h1>
        </div>

    </div>

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
    </TabView>

    <Accordion  :multiple="true">
        <AccordionTab v-for="(medicalRecord, index) in medicalRecords" :key="index" :header="`${moment(medicalRecord.createAt.seconds*1000).format('D-MMM-YYYY')} - ${medicalRecord.diagnostic}`">
            <p class="text-justify">Enfermedad Actual: {{ medicalRecord.currentSick }}</p>
            <p class="text-justify">Plan: {{ medicalRecord.plan }}</p>
            <SplitButton label="Save" icon="pi pi-plus" :model="medicalRecordDocs"></SplitButton>
            <!-- <SpeedDial :model="medicalRecordDocs" :radius="120" direction="up-right" type="quarter-circle" buttonClass="p-button-success" /> -->
                    <!-- <Button type="button" class="p-button-help p-button-rounded" @click="showDetails(medicalRecord)">Ver Detalles</Button> -->
        </AccordionTab>
    </Accordion>

    <Button  type="button" class="text-white mt-5" @click="saveMedicalRecor">Guardar Historia</Button>

    <Dialog v-model:visible="displayDetails" :maximizable="true" class="m-5">
        <template #header>
            <h3>Detalles</h3>
        </template>
            {{ diagnostic }} <br><br>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proi
    </Dialog>
</template>