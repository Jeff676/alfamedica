<script setup>
import { ref, reactive, provide } from 'vue'
import DrugsControl from '@/components/DrugsControl.vue'

/* *** Important Information *** */
// this must come from db trhough props
// drugs model
// const drugs = reactive([
//     {
//         drug: nombre del medicamento (string)
//         startDate: fecha de inicio, por defecto fecha en el momento en que se calculan las dosis (date)
//         nDosis: canitad de dosis (number)
//         frecuency: frecuencua en horas (number)
//         dosis:[{ "schedule": "10:43 pm", "supplied": false }] 
//                  la hora en que ebe tomar el medicamento, este arreglo tendra tantos items como indique la nDosis
//                  schedule string representa la hora en que se debe suministrar el medicamento ejemplo "10:00 pm"
//                  supplied boolean indica si la dosis fue suminisrada
//     },
// ])
    const patient_id = ref('0Hco9wAuGwYKjeQPCKsP')
    const medicalRecord = ref('rbDNBmPssuAaPzYTIVmV')

    const drug = reactive([
        {
            drug: 'Notolac 30mg',
            startDate: new Date(),
            nDosis: 3,
            frecuency: 6,
            dosis:[ { "schedule": "10:43 pm", "supplied": false }, { "schedule": "4:43 am", "supplied": false }]
        }
    ])

    // provide('drugs', drug)
    provide('patient_data', { patient_id, medicalRecord })
</script>

<template>
    <div>
        <h1>Kpi's</h1>
        <DrugsControl/>
    </div>
</template>