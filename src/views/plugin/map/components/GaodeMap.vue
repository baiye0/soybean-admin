<template>
  <div ref="domRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScriptTag } from '@vueuse/core';
import { GAODE_MAP_SDK_URL } from '@/config';

const { load } = useScriptTag(GAODE_MAP_SDK_URL);

const domRef = ref<HTMLDivElement>();

async function renderBaiduMap() {
  if (!domRef.value) return;
  await load(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const map = new AMap.Map(domRef.value, {
    zoom: 11,
    center: [114.05834626586915, 22.546789983033168],
    viewMode: '3D'
  });
}

onMounted(() => {
  renderBaiduMap();
});
</script>
<style scoped></style>
