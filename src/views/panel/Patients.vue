<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'

    // Prime Flex DataTable
    import {FilterMatchMode,FilterOperator} from 'primevue/api'
    import DataTable from 'primevue/datatable'
    import Column from 'primevue/column'

     // Primeflex Forms
    import InputText from 'primevue/inputtext'

    // Primeflex Others
    import Button from 'primevue/button'

    // moment
    import moment from 'moment'

    // helpers
    import { patientAge } from '@/helpers/patients'

    // bd functions
    import { getPatients } from '@/firebase/patients'

    
    import Toast from 'primevue/toast'
    import { useToast } from "primevue/usetoast"
    const toast = useToast()

    const router = useRouter()

    const selectedPatient = []

    const columns = [
        {field: "patient_id", header: "Cedula"},
        {field: "name", header: "Nombre y Apellido"},
    ]

    const filters = ref({
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'name': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
        'birthday': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
    })

    const loading = ref(false)

    const clearFilter= () => {
        filters.value = ({
            'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
            'name': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
            'birthday': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
    })
    }

    const medicalRecord = (data) => {
        router.push({name: 'medicalRecord', params: {patientid: data.patient_id}})
    }

    var patients = ref([])
    const initPatients = async () => {
        patients.value = await getPatients()
        if (patients.value.length == 0) {
            toast.add({severity:'error', summary: 'Error al obtener pacientes', detail: 'Intentelo de Nuevo', life: 4000})
        }
    }

    onMounted(() => {
            initPatients()
    })
</script>


<template>
    <!-- Important messages -->
    <Toast position="top-center" />

    <div>
        <!-- Patients List -->
    <DataTable
        :value="patients" :paginator="true" :rows="7"
        :filters="filters" filterDisplay="menu" :loading="loading"
        :selection="selectedPatient" selectionMode="single"
        :contextMenuSelection="selectedPatient"
        stripedRows
        :resizableColumns="true" columnResizeMode="fit"
        class="p-datatable-sm"
    >
        <template #header>
            <div class="flex justify-content-between">
                <router-link to="/panel/newPatient" class="no-underline">
                    <Button type="button" id="button-Plus" class="p-button-outlined bg-green-300 text-white">
                        <label for="button-Plus"><font-awesome-icon icon="plus"/> Nuevo Paciente</label>
                    </Button>
                </router-link>
                <h2 class="text-blue-600">Listado de Pacientes</h2>
                <div>
                    <span class="p-input-icon-left" >
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Buscar Paciente" id="inputSearch" autofocus/>
                    </span>
                    <Button type="button" icon="pi pi-filter-slash" class="p-button-outlined" @click="clearFilter()"/>
                </div>
            </div>
        </template>

        <template #empty>
            <Button class="p-button-warning" @click="initPatients" v-tooltip="'Obtener Pacientes Nuevamente'"><font-awesome-icon icon="arrow-rotate-right"/></Button>
            No se han encontrado pacientes
        </template>
        <template #loading>
            Cargando datos desde el servidor. Por favor Espere.
        </template>
        
        <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable ></Column>
        <Column header="Fecha de Nacimiento" field="birthday" sortable >
            <template #body="slotProps">
                <div>
                    {{moment(slotProps.data.birthday.seconds*1000).format("D-MMM-YYYY")}}
                </div>
            </template>
        </Column>
        <Column header="Edad" field="birthday" sortable >
            <template #body="slotProps">
                <div>
                    {{patientAge(slotProps.data.birthday)}}
                </div>
            </template>
        </Column>
        <Column :exportable="false" style="width: 3rem" header="Ver Historia" >
            <template #body="slotProps">
                 <!-- <Button icon="pi pi-ellipsis-v" class="p-button-rounded" @click="editPatient(slotProps.data)" />  -->
                <Button class="p-button-rounded" @click="medicalRecord(slotProps.data)">
                    <font-awesome-icon icon="clipboard-user"/>
                </Button>
            </template>
        </Column>
    </DataTable>
    </div>
</template>