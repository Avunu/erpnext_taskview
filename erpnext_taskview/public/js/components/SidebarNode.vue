<template>
    <div>
      <span>{{ node.text }}</span>
      <!-- Render Pause/Resume and Stop buttons -->
      <button v-if="node.timerStatus === 'running'" @click="pauseTimer(node)">Pause</button>
      <button v-if="node.timerStatus === 'paused'" @click="resumeTimer(node)">Resume</button>
      <button @click="stopTimer(node)">Stop</button>
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'SidebarNode',
    props: {
      node: {
        type: Object,
        required: true,
      },
      pauseTimer: Function,
      resumeTimer: Function,
      stopTimer: Function,
    },
  });
  </script>
  
  <style scoped>
  /* Add any styles for each individual node */
  </style>
  