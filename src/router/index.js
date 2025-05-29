import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SteganographyView from '../views/SteganographyView.vue';
import FeaturesView from '../views/Features.vue';
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/steganography/:algorithm',
    name: 'steganography',
    component: SteganographyView
  },
  {
    path: '/features',
    name: 'features',
    component: FeaturesView
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
