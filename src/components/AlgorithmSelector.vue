<!-- filepath: e:\steganographic\steganographic_project\src\components\AlgorithmSelector.vue -->
<template>
  <div class="algorithm-selector">
    <h2 class="mb-6 app-heading">Vyberte algoritmus steganografie</h2>
    <div class="algorithm-grid">
      <!-- Karta pro textovou steganografii -->
      <v-card @click="$emit('select-algorithm', 'text')" class="algorithm-card" elevation="3">
        <div class="algorithm-card-header">
          <v-icon size="large" class="card-icon" color="secondary">mdi-format-text</v-icon>
        </div>
        <v-card-title class="algorithm-title">Ukrývání do textu</v-card-title>
        <v-card-text class="algorithm-description">Ukrytí nebo odkrytí zprávy v běžném textu</v-card-text>
      </v-card>

      <!-- Karta pro obrazovou steganografii -->
      <v-card @click="$emit('select-algorithm', 'image')" class="algorithm-card" elevation="3">
        <div class="algorithm-card-header">
          <v-icon size="large" class="card-icon" color="secondary">mdi-image</v-icon>
        </div>
        <v-card-title class="algorithm-title">Ukrývání do obrázků</v-card-title>
        <v-card-text class="algorithm-description">Ukrytí nebo odkrytí zprávy v obrázkových souborech</v-card-text>
      </v-card>

      <!-- Karta pro audio steganografii -->
      <v-card @click="$emit('select-algorithm', 'audio')" class="algorithm-card" elevation="3">
        <div class="algorithm-card-header">
          <v-icon size="large" class="card-icon" color="secondary">mdi-music-note</v-icon>
        </div>
        <v-card-title class="algorithm-title">Ukrývání do hudby</v-card-title>
        <v-card-text class="algorithm-description">Ukrytí nebo odkrytí zprávy v audio souborech</v-card-text>
      </v-card>

      <!-- Karta pro video steganografii -->
      <v-card @click="$emit('select-algorithm', 'video')" class="algorithm-card" elevation="3">
        <div class="algorithm-card-header">
          <v-icon size="large" class="card-icon" color="secondary">mdi-video</v-icon>
        </div>
        <v-card-title class="algorithm-title">Ukrývání do videa</v-card-title>
        <v-card-text class="algorithm-description">Ukrytí nebo odkrytí zprávy ve video souborech</v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  // Definice události pro výběr algoritmu
  defineEmits(['select-algorithm']);
</script>

<style scoped>
  .algorithm-selector {
    text-align: center;
    margin: 0 auto;
    max-width: 1000px;
    padding: 2rem 1rem;
  }

  .algorithm-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    justify-content: center;
    margin: 0 auto;
    max-width: 800px;
  }

  .algorithm-card {
    cursor: pointer;
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-top: 4px solid var(--v-primary-base);
  }

  .algorithm-card-header {
    padding: 1.5rem 0;
    text-align: center;
    background-color: #f5f5f5;
  }

  .card-icon {
    font-size: 3rem;
  }

  .algorithm-title {
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    padding-bottom: 0;
  }

  .algorithm-description {
    text-align: center;
    color: rgba(0, 0, 0, 0.7);
  }

  .algorithm-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
  }

  /* Responzivní design pro mobilní zařízení */
  @media (max-width: 768px) {
    .algorithm-grid {
      grid-template-columns: 1fr;
      max-width: 400px;
    }
  }
</style>
