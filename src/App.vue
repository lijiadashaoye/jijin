<script setup>
import { ref, onMounted } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import Table from "./components/table.vue";
let showAll = ref(false),
  progress = ref(0);
function showtable() {
  showAll.value = !showAll.value;
}
function progressFn(num) {
  progress.value = num;
}
</script>

<template>
  <HelloWorld v-if="!showAll" class="modal" :progress="progress" />
  <Table @showTable="showtable" @progress="progressFn" />
</template>

<style>
body,
html {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  overflow: hidden;
}
.modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>
