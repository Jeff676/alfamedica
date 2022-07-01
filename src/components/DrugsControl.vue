<script setup>
import { inject, reactive, onMounted } from 'vue'
import moment from 'moment'

    import { firebaseApp } from '@/firebase/init.js'
    import { getFirestore, collection, getDocs } from 'firebase/firestore'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ToggleButton from 'primevue/togglebutton'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'

    const db = getFirestore(firebaseApp)

const { patient_id, medicalRecord } = inject('patient_data')

const getDrugs = async (patientId, medicalRecordId) => {
    const docRef = collection(db, `patients/${patientId}/medicalRecords/${medicalRecordId}/medicalorders`)
    const querySnapShot = await getDocs(docRef)
    const drugs = querySnapShot.docs.map(doc => doc.data())
    const drugsControl = []

    drugs.map((item) => {
        item.orders.map((order) => {
            if(order.drug != null && order.scheduled == false) {
                drugsControl.push(order)
            }
        })
    })
    return drugsControl
}

/* *** MODELO DE DATO PARA LO MEDICAMENTOS *** */
// const drug = reactive([
//         {
//             drug: 'Notolac 30mg',
//             startDate: new Date(),
//             nDosis: 3,
//             frecuency: 6,
//             dosis:[ { "schedule": "10:43 pm", "supplied": false }, { "schedule": "4:43 am", "supplied": false }]
//         }
//     ])

const columns = [
    {field: 'drug', header: 'Medicamento'},
    {field: 'frecuency', header: 'Frecuencia'},
]

const onCellEditComplete = (event) => {
            let { data, newValue, field, index } = event;
            drugs[index].nDosis=newValue

            let setDosis = []
            
            for (let index = 0; index < data.nDosis; index++) {
                setDosis.push({schedule: moment(data.startDate.seconds*1000).add(data.frecuency * index, 'h').format('h:mm a'), supplied: false})
            }

            drugs[index].dosis.forEach((item, jindex) => {
                if (item.supplied) {
                    setDosis[jindex] = item
                }
            })
            
            drugs[index].dosis = setDosis

            if (drugs[index].dosis.length > newValue) {
                drugs[index].nDosis = drugs[index].dosis.length
            }
}

var drugs = reactive([])

onMounted(async () => {
    let res = await getDrugs(patient_id.value, medicalRecord.value)
    res.map(item => drugs.push(item))
})

</script>

<template>
    <DataTable :value="drugs" editMode="cell"  @cell-edit-complete="onCellEditComplete">
        <Column v-for="(column, index) in columns" :key="index" :field="column.field" :header="column.header">
        </Column>
         <Column field="startDate" header="Fecha de Inicio" >
            <template #body="slotProps">
                <span> {{moment(slotProps.data.startDate.seconds*1000).format('MMMM Do YYYY')}}</span>
            </template>
         </Column>
        <Column field="nDosis" header="Cantidad de dosis" >
            <template #editor="{data, field}">
                <InputNumber id="stacked" v-model="data[field]" showButtons inputStyle="width:40px;" :min="1"/>
            </template>
        </Column>
        <Column field="dosis" header="Dosis" class="col-5 text-align-center">
            <template #body="slotProps">
                <ToggleButton v-for="(item, index) in slotProps.data.dosis" :key="index" v-model="item.supplied" :onLabel="item.schedule" :offLabel="item.schedule" onIcon="pi pi-check" offIcon="pi pi-times" class="m-1" :disabled="item.supplied"/>
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
    .p-togglebutton.p-button:not(.p-disabled):not(.p-highlight) {
        background-color: red;
        color: #fdfdfd;
    }
</style>