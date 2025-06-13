<template>
  <div class="home-view">
    <!-- Úvodní stránka aplikace -->
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="home">
            <div class="header-section">
              <h1>Steganografie</h1>
              <p>Vyberte algoritmus pro ukrývání nebo odkrývání informací</p>
            </div>
            <AlgorithmSelector @select-algorithm="handleAlgorithmSelect" />
            <div class="d-flex justify-center flex-wrap gap-2 mt-6">
              <v-btn to="/features" variant="tonal" color="primary" class="my-2" prepend-icon="mdi-information-outline">Přehled funkcí aplikace</v-btn>

              <!-- Tlačítka odkazů na GitHub a Akela -->
              <v-btn href="#" target="_blank" variant="outlined" color="primary" class="ml-3 my-2" prepend-icon="mdi-github">Verze na GitHub Pages</v-btn>

              <v-btn href="#" target="_blank" variant="outlined" color="amber-darken-2" class="ml-3 my-2" prepend-icon="mdi-school">
                Verze na serveru Akela
              </v-btn>
            </div>

            <div class="mt-8 github-badge">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <a href="https://github.com/Malatass/steganographic_project" target="_blank" v-bind="props">
                    <v-chip color="grey-darken-3" variant="elevated" class="px-2 py-3" prepend-icon="mdi-source-repository">
                      <span class="text-caption mr-1">Zdrojový kód:</span>
                      <strong class="text-white">GitHub</strong>
                    </v-chip>
                  </a>
                </template>
                <span>Zobrazit zdrojový kód na GitHubu</span>
              </v-tooltip>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import AlgorithmSelector from '../components/AlgorithmSelector.vue';

  const router = useRouter();

  const handleAlgorithmSelect = (algorithm) => {
    router.push({ name: 'steganography', params: { algorithm } });
  };
</script>

<style scoped>
  .home {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-section {
    text-align: center;
    padding: 3rem 2rem;
    margin-bottom: 2rem;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
  }

  .header-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #79be15;
  }

  h1 {
    font-size: 3rem;
    color: #424242;
    margin-bottom: 1rem;
    font-weight: 500;
    position: relative;
    display: inline-block;
    padding-bottom: 0.5rem;
  }

  h1::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 60px;
    height: 3px;
    background-color: #79be15;
    transform: translateX(-50%);
  }

  p {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #757575;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .github-badge {
    display: flex;
    justify-content: center;
  }

  .github-badge a {
    text-decoration: none;
  }

  .text-white {
    color: white;
  }
</style>
