<!-- filepath: e:\steganographic\steganographic_project\src\App.vue -->
<template>
  <v-app>
    <v-app-bar app color="white" elevation="2">
      <v-container class="d-flex align-center px-2">
        <router-link to="/" class="text-decoration-none d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-leaf</v-icon>
          <span class="app-title">Steganografie</span>
        </router-link>
        <v-spacer></v-spacer>
      </v-container>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app class="pa-4 text-center" color="white">
      <v-container>
        <div class="text-body-2 text-secondary">&copy; {{ new Date().getFullYear() }} — Aplikace pro steganografii</div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup></script>

<style>
  @import './assets/main.css';
  .app-title {
    font-weight: 600;
    font-size: 1.25rem;
    color: #424242;
  }

  .text-decoration-none {
    text-decoration: none !important;
  }


</style>
