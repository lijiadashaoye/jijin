<template>
  <div class="wap">
    <div class="zhong">
      <p v-if="progress > 0">{{ progress }}%</p>
      <ul class="content">
        <li v-for="i of arr" :key="i"></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
let arr = ref(Array.from({ length: 4 }, (v, index) => (v ? "" : index)));
defineProps({
  progress: Number,
});
</script>
<style scoped>
.wap {
  background: rgb(224, 222, 222);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 50;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
.wap > p {
  position: absolute;
  top: 48%;
  left: 41%;
  text-align: center;
  font-size: 20px;
}
.zhong {
  width: 250px;
  height: 250px;
  position: relative;
}
.zhong > p {
  font-size: 30px;
  color: rgb(99, 34, 240);
  position: absolute;
  top: 35%;
  left: 98px;
}
.content {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: zhuan 4s linear infinite;
  list-style-type: none;
  padding: 0;
}
.content > p {
  position: absolute;
}
.content > li {
  background: red;
  width: 40px;
  height: 1px;
  position: absolute;
  transform-origin: 20px 0;
}
.content > li:nth-child(1) {
  top: 15px;
  left: calc(50% - 20px);
  transform: rotate(90deg);
}
.content > li:nth-child(2) {
  bottom: 15px;
  left: calc(50% - 20px);
  transform: rotate(90deg);
}
.content > li:nth-child(3) {
  top: calc(50% - 4px);
  left: -10px;
}
.content > li:nth-child(4) {
  top: calc(50% - 4px);
  right: -10px;
}

@keyframes zhuan {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>