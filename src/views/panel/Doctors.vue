<script setup>
    import { ref, onMounted } from 'vue'
    import InputText from 'primevue/inputtext'

    const input1 = ref(null)
    const input2 = ref(null)
    const input3 = ref(null)
    const input4 = ref(null)

    const res = { name: 'Mark'}

    const navInputs = () => {
        input4.value.firstElementChild.focus()
    }

    onMounted(() => {
        input1.value.firstElementChild.focus()

        // tecnica del corto circuito
        res && res.name && res.name == 'Mark' && console.log(res.name)
    })

</script>

<template>
    <h1>Doctores</h1>
    <div ref="input1">
        <InputText placeholder="Prueba Focus"></InputText>
    </div>
    <div ref="input2">
        <InputText placeholder="Prueba Focus"></InputText>
    </div>
    <div ref="input3">
        <InputText placeholder="Prueba Focus"></InputText>
    </div>
    <div ref="input4">
        <InputText placeholder="Prueba Focus"></InputText>
    </div>
    <button @click="navInputs">Click</button>
</template>