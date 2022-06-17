<script setup>
import { ref, reactive } from 'vue'
import { firebaseApp } from '@/firebase/init.js'
import { addDoc, query, collection, orderBy, onSnapshot, getFirestore } from 'firebase/firestore'
import { getMedicalRecord } from '@/firebase/patients'


import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

import moment from 'moment'
import { fixLocalTimeVZLA } from '@/helpers/fixLocalTimeVZLA'

import Toast from 'primevue/toast'
import { useToast } from "primevue/usetoast"
const toast = useToast()

const db = getFirestore(firebaseApp)

const props = defineProps({
        title: String,
        signBy : String,
        evolutions: Array,
        id : String,
        evolutionType : String
    })

var showMedicalEvolution = ref(false)
var evolutions = ref([])
var newEvolution = reactive({
        createAt : new Date(),
        signBy : 'Dr Perez',
        body : ''
    })

const getEvolutions = async (idPatient, idMedicalRecord, callback) => {
    const q = query(collection(db, `patients/${idPatient}/medicalRecords/${idMedicalRecord}/${props.evolutionType}`), orderBy("createAt", "desc"))
    onSnapshot(q, callback)
}

const addEvolution = async (idPatient, idMedicalRecord, data) => {
    try {
        const docRef = await addDoc(collection(db, `patients/${idPatient}/medicalRecords/${idMedicalRecord}/${props.evolutionType}`), {
            createAt : fixLocalTimeVZLA(),
            body : data.body,
            signBy : data.signBy
        })
        return docRef.id
    } catch(e) {
        console.log(e)
        return null
    }
}

const Evolution = async () => {
        showMedicalEvolution.value = true

        const ids = await getMedicalRecord(props.id)
        const medicalRecordId = ids.docs[0].id

        evolutions.value = await getEvolutions(props.id, medicalRecordId, (querySnapShot) => {
            evolutions.value = querySnapShot.docs.map(doc => doc.data())
        })
    }

    const saveEvolution = async () => {
        const ids = await getMedicalRecord(props.id)
        const medicalRecordId = ids.docs[0].id
        const response = await addEvolution(props.id, medicalRecordId, newEvolution)
        if (response) {
            toast.add({severity:'success', summary: 'Evolucion Guardada', detail: response.id, life: 4000})
            newEvolution.body = ''
        } else {
            toast.add({severity:'error', summary: 'Error', detail: 'Evolucion No fue Guardada' , life: 4000})
        }
    }

</script>

<template>
    <Toast position="top-center" />

    <Button :label="title" @click="Evolution()" icon="pi pi-list" class="p-button-info mb-3 w-full"></Button>

    <Dialog v-model:visible="showMedicalEvolution">
        <template #header>
                <span class="font-bold text-2xl"> {{ title }} </span>
        </template>
        <div>
            <Divider align="center">
                <span class="p-tag"> {{ moment(fixLocalTimeVZLA()).format('D MMMM YYYY - h:mm a') }} </span>
            </Divider>
            <Textarea rows="5" cols="60" :autoResize="true" v-model="newEvolution.body" autofocus/>
            <Divider align="right" type="dashed">
                <span> {{ signBy }} </span>
            </Divider>
            <div class="flex justify-content-end">
                <Button label="Guardar" type="button" icon="pi pi-save" class="p-button-rounded p-button-outlined" @click="saveEvolution"></Button>
            </div>
        </div>

        <div v-for="(evolution, index) in evolutions" :key="index">
            <Divider align="center">
                <span class="p-tag"> {{ moment(evolution.createAt.seconds*1000).format('D MMMM YYYY - h:mm a') }} </span>
            </Divider>
            <Textarea rows="5" cols="60" :autoResize="true" v-model="evolution.body" :disabled="true"/>
            <Divider align="right" type="dashed">
                <span> {{ evolution.signBy }} </span>
            </Divider>
        </div>

    </Dialog>
</template>