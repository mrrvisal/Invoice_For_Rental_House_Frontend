import { createRouter, createWebHistory } from 'vue-router'
import RentalList from '../views/RentalList.vue'

const routes = [
  { path: '/', component: RentalList, name: 'rentals' },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
