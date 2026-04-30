import { createRouter, createWebHistory } from "vue-router";
import RentalList from "../views/RentalList.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/login",
    component: Login,
    name: "login",
    meta: { public: true },
  },
  {
    path: "/",
    component: RentalList,
    name: "rentals",
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ── Auth Guard ─────────────────────────────────────────────────────────────────
router.beforeEach((to) => {
  const token = localStorage.getItem("admin_token");

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !token) {
    return { name: "login" };
  }

  // Redirect already-logged-in users away from login page
  if (to.name === "login" && token) {
    return { name: "rentals" };
  }
});

export default router;
