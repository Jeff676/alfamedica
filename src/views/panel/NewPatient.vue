<script setup>
    import { reactive, ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { add_patient, verify_patient } from '@/firebase/patients'

    import Dialog from 'primevue/dialog'
    import ProgressSpinner from 'primevue/progressspinner'
    import Toast from 'primevue/toast'
    import { useToast } from "primevue/usetoast"
    // Primeflex Forms
    import InputText from 'primevue/inputtext'
    import Dropdown from 'primevue/dropdown'
    import Calendar from 'primevue/calendar'
    import InputNumber from 'primevue/inputnumber'
    import SelectButton from 'primevue/selectbutton'
    import InputMask from 'primevue/inputmask'
    import InputSwitch from 'primevue/inputswitch'
    import Button from 'primevue/button'
    import ConfirmDialog from 'primevue/confirmdialog'
    import { useConfirm } from "primevue/useconfirm"

    const toast = useToast()
    const router = useRouter()

    var newPatient = reactive({
        patient_id: '',
        name: '',
        nationalityType: 'V',
        birthday: null,
        size: 1.6,
        gender: 'Fem',
        address: '',
        country: '',
        state: '',
        city: '',
        phone: '',
        phone2: '',
        email:'',
        profesion: '',
        hospitalized : false,
        waitingAdvise : false,
        doctor : '',
        doctorAdviser : ''
    })

    const resetNewPatient = ()=> {
        newPatient.patient_id= ''
        newPatient.name= ''
        newPatient.nationalityType= 'V'
        newPatient.birthday= null
        newPatient.size= 1.6
        newPatient.gender= 'Fem'
        newPatient.address= ''
        newPatient.country= ''
        newPatient.state= ''
        newPatient.city= ''
        newPatient.phone= ''
        newPatient.phone2= ''
        newPatient.email=''
        newPatient.profesion= ''
        newPatient.hospitalized = false
        newPatient.waitingAdvise = false
        newPatient.doctor = ''
        newPatient.doctorAdviser = ''
    }

    var disabledFields = ref(true)

    const genders = [
        {icon: 'person', value: 'm'},
        {icon: 'person-dress', value: 'f'},
    ]

    const nationalityType = ref([ "V", "E" ])

    const waitting = ref(false)
    const inputName = ref(null)
    const confirm = useConfirm()

    // check if patient exist
    const checkId = async () => {
        waitting.value = true
        var verificated = reactive([])
        await verify_patient(newPatient.patient_id)
            .then(data =>{ verificated = data} )
            .catch((e)=> {
                toast.add({severity:'error', summary: 'Error al Verficar', detail:e, life: 4000});
            })
        waitting.value = false

        if (verificated) {
            confirm.require({
                message: 'Desea ver su historia?',
                header: 'El paciente Existe',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                     router.push({name: 'medicalRecord', params: {patientid: newPatient.patient_id}})
                },
                reject: () => {
                    toast.add({severity:'error', summary:'El paciente Existe', detail:'Por Favor Verifique su cedula', life: 3000})
                    inputCedulaRef.value.$el.focus()
                }
            });
            // toast.add({severity:'error', summary: 'Paciente Ya Existe', detail:'Verifique la Cedula', life: 4000})
        } else {
            disabledFields.value = false
            setTimeout(() => inputName.value.$el.focus(), 500)
        }
    }

    // Save patient in db
    const savePatient = async () => {
        waitting.value = true
        try {
            var result = await add_patient(newPatient)
            if (result) {
                toast.add({severity:'success', summary: 'Paciente Guardado', detail:'Exitosamente', life: 4000})
                resetNewPatient()
                console.log("Document written with ID: ", result)
                result = null
                waitting.value = false
                router.replace('/panel/patients')
            } else {
                throw 'Error al guardar'
            }
        } catch(e) {
            router.replace('/panel/patients')
            toast.add({severity:'error', summary: 'Paciente No Guardado', detail: e, life: 4000})
        }

    }

        var inputCedulaRef = ref(null)
        

    onMounted(() => {
        inputCedulaRef.value.$el.focus()
    })

</script>

<template>
    <Dialog v-model:visible="waitting" modal contentStyle="background-color: transparent;" :closable="false" :showHeader="false">
        <ProgressSpinner strokeWidth="3"/>
    </Dialog>

    <!-- Important messages -->
    <Toast position="top-center" />

    <ConfirmDialog></ConfirmDialog>


    <h1>Nuevo Paciente</h1>
     <form class="fromgrid grid" @submit.prevent="savePatient()">
            <div class="field col-1 mt-5">
                <Dropdown v-model="newPatient.nationalityType" :options="nationalityType" style="width: 100%"/>
            </div>
            <div class="field col-5 mt-5">
                <div class="p-float-label">
                    <InputText ref="inputCedulaRef" id="inputCedula" type="text" v-model="newPatient.patient_id" style="width:100%"/>
                    <label for="inputCedula">Cedula de Identidad</label>
                </div>
            </div>
            <div class="field col-6 mt-5 flex justify-content-start flex-wrap">
                <Button label="Verificar" icon="pi pi-check" class="bg-green-300" @click="checkId()"/>
            </div>

            <div class="field col-12" >
                <span class="p-float-label">
                    <InputText id="inputName" type="text" v-model="newPatient.name" :disabled="disabledFields" ref="inputName" style="width:100%" />
                    <label for="inputName">Nombres y Apellidos</label>
                </span>
            </div>
            <div class="field col-5">
                <span class="p-float-label">
                    <Calendar id="birthday" v-model="newPatient.birthday" :disabled="disabledFields" class="w-full"/>
                    <label for="birthday" class="text-sm">Fecha de Nacimiento</label>
                </span>
            </div>
            <div class="field col-5">
                <span class="p-float-label">
                    <InputNumber id="size" v-model="newPatient.size" :min="0.40" :max="2.5" mode="decimal" suffix=" metros" :step="0.01" showButtons :disabled="disabledFields" class="w-full"/>
                    <label for="size">Estatura</label>
                </span>

            </div>
            <div class="field col-2">
                <SelectButton v-model="newPatient.gender" :options="genders" :modelValue="genders.value" :disabled="disabledFields">
                        <template #option="slotProps">
                            <font-awesome-icon :icon="slotProps.option.icon" size="lg" />
                        </template>
                </SelectButton>
            </div>
            <div class="field col-12">
                <span class="p-float-label">
                    <InputText id="address" type="text" v-model="newPatient.address"  style="width:100%" :disabled="disabledFields"/>
                    <label for="address">Direccion</label>
                </span>
            </div>
            <div class="field col-4">
                <span class="p-float-label">
                    <InputText id="country" type="text" v-model="newPatient.country"  style="width:100%" :disabled="disabledFields"/>
                    <label for="country">Pais</label>
                </span>
            </div>
            <div class="field col-4">
                <span class="p-float-label">
                    <InputText id="state" type="text" v-model="newPatient.state"  style="width:100%" :disabled="disabledFields"/>
                    <label for="state">Estado</label>
                </span>
            </div>
            <div class="field col-4">
                <span class="p-float-label">
                    <InputText id="city" type="text" v-model="newPatient.city"  style="width:100%" :disabled="disabledFields"/>
                    <label for="city">Ciudad</label>
                </span>
            </div>
            <div class="field col-6">
                <span class="p-float-label">
                    <InputMask id="phone" mask="(9999) 999-9999" v-model="newPatient.phone" style="width:100%" :disabled="disabledFields"/>
                    <label for="phone">Telefono</label>
                </span>
            </div>
            <div class="field col-6">
                <span class="p-float-label">
                    <InputMask id="phone2" mask="(9999) 999-9999" v-model="newPatient.phone2" style="width:100%" :disabled="disabledFields"/>
                    <label for="phone2">Telefono</label>
                </span>
            </div>
            <div class="field col-6">
                <span class="p-float-label">
                    <InputText id="email" v-model="newPatient.email" style="width:100%" :disabled="disabledFields"/>
                    <label for="email">Correo Electronico</label>
                </span>
            </div>
            <div class="field col-6">
                <span class="p-float-label">
                    <InputText id="profesion" v-model="newPatient.profesion" style="width:100%" :disabled="disabledFields"/>
                    <label for="profesion">Profesion</label>
                </span>
            </div>
             <div class="flex col-6 align-content-center justify-content-center gap-3">
                <label for="hopitalized">Hospitalizar</label>
                <InputSwitch id="hopitalized" v-model="newPatient.hospitalized" />
            </div>
            <!--<div class="field col-6">
                    <label for="advise">En Espera para consulta</label><br/>
                    <InputSwitch id="advise" v-model="newPatient.waitingAdvise" /><br/>
                    <Dropdown class="mt-2" v-model="newPatient.doctorAdviser" :options="doctors" :filter="true" optionLabel="name" placeholder="A cargo de..." :disabled="!newPatient.waitingAdvise"/>
            </div> -->
            <div class="col-12 justify-content-center">
                <!-- <Button label="Guardar" icon="pi pi-check" class="bg-green-300 m-5"  @click="savePatient()" :disabled="disabledFields"/> -->
                <Button label="Guardar" icon="pi pi-check" class="bg-green-300 m-5"  type="submit" :disabled="disabledFields"/>
                <Button label="Cancelar" icon="pi pi-times" class="p-button-danger m-5" @click="router.push('/panel/patients')"/>
            </div>
        </form>
</template>