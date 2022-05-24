<script setup>
    defineProps({
        displayName: String
    })
</script>

<template>
    <nav class="flex bg-bluegray-600 border-round justify-content-between flex-wrap">
        <div class="flex-initial flex align-items-center justify-content-center ">
            <router-link to="/home" class="font-bold text-white m-2 pl-5 py-3">Home</router-link>
            <router-link to="/about" class="font-bold text-white m-2 pl-5 py-3">About</router-link>
        </div>
        <span class="flex align-items-center justify-content-center font-bold text-white m-2 px-5 py-3"> {{ displayName }} </span>
    </nav>
</template>