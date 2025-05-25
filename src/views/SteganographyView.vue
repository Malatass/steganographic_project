<template>
  <v-container class="steganography-view">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">
        <!-- Vylepšené drobečky pro navigaci -->
        <v-breadcrumbs class="px-0 py-2 mb-4 breadcrumbs-nav">
          <v-breadcrumbs-item to="/" title="Domů">
            <v-icon small class="mr-1">mdi-home</v-icon>
            Domů
          </v-breadcrumbs-item>
          <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
          <v-breadcrumbs-item class="breadcrumb-current">
            {{ algorithmTitle }}
          </v-breadcrumbs-item>
        </v-breadcrumbs>

        <h1 class="text-h4 font-weight-medium text-center mb-6">{{ algorithmTitle }}</h1>
        <p class="text-center mb-8 text-subtitle-1">Zadejte potřebná data pro ukrytí nebo odkrytí informací.</p>

        <!-- Render the appropriate component based on the algorithm -->
        <component :is="currentComponent" @show-message="showMessage" />

        <!-- Output section -->
        <div v-if="outputMessage" class="mt-6">
          <h3 class="text-h6">Výsledek:</h3>
          <v-alert :type="outputType" variant="tonal" class="mt-2 result-alert">
            <pre>{{ outputMessage }}</pre>
          </v-alert>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref, computed, markRaw, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import TextSteganography from '../components/steganography/TextSteganography.vue';
  import ImageSteganography from '../components/steganography/ImageSteganography.vue';
  import AudioSteganography from '../components/steganography/AudioSteganography.vue';
  import VideoSteganography from '../components/steganography/VideoSteganography.vue';

  const route = useRoute();
  const currentAlgorithm = computed(() => route.params.algorithm || 'text');

  // Algorithm titles in Czech
  const algorithmTitles = {
    text: 'Steganografie textu',
    image: 'Steganografie obrázků',
    audio: 'Steganografie zvuku',
    video: 'Steganografie videa'
  };

  const algorithmTitle = computed(() => {
    return algorithmTitles[currentAlgorithm.value] || 'Steganografie';
  });

  // Map algorithm to component
  const componentMap = {
    text: markRaw(TextSteganography),
    image: markRaw(ImageSteganography),
    audio: markRaw(AudioSteganography),
    video: markRaw(VideoSteganography)
  };

  // Dynamically select the component based on the algorithm
  const currentComponent = computed(() => {
    return componentMap[currentAlgorithm.value] || componentMap.text;
  });

  // Output message and type
  const outputMessage = ref('');
  const outputType = ref('info');

  // Reset output when algorithm changes
  watch(currentAlgorithm, () => {
    outputMessage.value = '';
    outputType.value = 'info';
  });

  // Function to handle message events from child components
  const showMessage = ({ message, type }) => {
    outputMessage.value = message;
    outputType.value = type || 'info';

    // Scroll to the message
    setTimeout(() => {
      const alertElement = document.querySelector('.v-alert');
      if (alertElement) {
        alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
</script>

<style scoped>
  .steganography-view {
    padding-top: 20px;
    padding-bottom: 40px;
  }

  .breadcrumbs-nav {
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .breadcrumb-current {
    color: #79be15;
    font-weight: 600;
  }

  pre {
    white-space: pre-wrap;
    font-family: 'Roboto Mono', monospace;
    background-color: rgba(0, 0, 0, 0.02);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow-x: auto;
    color: #424242;
    margin: 0;
  }

  .result-alert {
    border-left: 4px solid;
  }
</style>
