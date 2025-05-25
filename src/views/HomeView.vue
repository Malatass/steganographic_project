<!-- filepath: e:\steganographic\steganographic_project\src\views\HomeView.vue -->
<template>
  <div class="home">
    <div class="header-section">
      <h1>Steganografie</h1>
      <p>Vyberte algoritmus pro ukrývání nebo odkrývání informací</p>
    </div>
    <AlgorithmSelector @select-algorithm="handleAlgorithmSelect" />
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import AlgorithmSelector from '../components/AlgorithmSelector.vue';

  const router = useRouter();

  const handleAlgorithmSelect = (algorithm) => {
    console.log(`Vybrán algoritmus: ${algorithm}`);
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
</style>
