<script setup>
    import { onMounted, ref } from 'vue'
    import { useRouter } from 'vue-router'

    import { getActivePatients } from '@/firebase/patients'

    import Card from 'primevue/card'
    import Avatar from 'primevue/avatar'
    import Divider from 'primevue/divider'
    import Chip from 'primevue/chip'

    const router = useRouter()


    const medicalRecord = (patient_id) => {
        router.push({name: 'medicalRecord', params: {patientid: patient_id}})
    }
    
    
    const patients = ref([])
    var openMedicalRecords = ref([])

    onMounted(async () => {
        const res = await getActivePatients()
        patients.value = res.patients
        openMedicalRecords.value = res.openMedicalRecords
    })

</script>

<template>
    <div class="flex flex-wrap justify-content-left gap-3 ml-3 mt-3">
        <Card class="w-14rem hover:shadow-7 cursor-pointer" v-for="(patient, index) in patients" :key="index"
        :class="openMedicalRecords[index]? 'p-card-body-success' : 'p-card-body-danger'" @click="medicalRecord(patient.patient_id)">
            <template #header>
            </template>
            <template #content>
                <Avatar size="xlarge" shape="circle" class="avatar" image="https://elireview.com/wp-content/uploads/2016/12/reed-profile-square.jpg" />
                <p class="font-bold text-yellow-500">{{ patient.name }}</p>
                <Divider/>
                <p class="mt-3 text-xs text-white" v-if="openMedicalRecords[index]" >{{ openMedicalRecords[index].plan }}</p>
                <p class="mt-3 text-xs text-white" v-if="!openMedicalRecords[index]" ><br></p>
                <p class="font-bold text-yellow-500 mb-0">Hab 02</p>
            </template>
            <template #footer>
                    <Chip v-if="openMedicalRecords[index]" class="p-1 w-full justify-content-center">
                        {{ openMedicalRecords[index].careBy }}
                    </Chip>
                    <Chip v-if="!openMedicalRecords[index]" class="custom-chip p-1">Pendiente por Ingreso</Chip>
            </template>
        </Card>
    </div>
</template>

<style>
    .p-card-header {
        padding-top: 50px;
        background-color: var(--yellow-500);
    }
    .p-card-body-success {
        background-color: rgb(70, 110, 140);
    }
    
    .p-card-body-danger {
        background-color: var(--red-600);
    }

    .p-avatar-circle {
        border: solid 3px #fff;
        margin-top: -150%;
    }

    .p-chip.custom-chip{
        background-color: var(--orange-300);
        color: #000;
    }
</style>