<template>
  <div class="app-shell">
    <!-- Main content -->
    <div class="main-wrapper">
      <header class="topbar">
        <span class="page-title">{{ pageTitle }}</span>
        <div class="topbar-right">
          <span class="date-display">{{ currentDate }}</span>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();


const pageTitle = computed(() => {
  if (route.path.includes("/rentals/edit")) return "កែប្រែព័ត៌មានអ្នកជួល";
  return "ប្រព័ន្ធជួលបន្ទប់";
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString("km-KH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #1a3a5c;
  --primary-light: #2563a8;
  --accent: #f59e0b;
  --accent-light: #fcd34d;
  --danger: #dc2626;
  --success: #16a34a;
  --warning: #d97706;
  --bg: #f0f4f8;
  --card: #ffffff;
  --text: #1e293b;
  --text-light: #64748b;
  --border: #e2e8f0;
  --sidebar-w: 260px;
}

html,
body {
  font-family: "Noto Sans Khmer", "Hanuman", sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-w);
  background: var(--primary);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transform: translateX(0);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  font-size: 2rem;
}
.logo-text {
  display: flex;
  flex-direction: column;
}
.logo-main {
  font-size: 1.1rem;
  font-weight: 700;
}
.logo-sub {
  font-size: 0.75rem;
  opacity: 0.7;
}
.close-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.nav-links {
  padding: 16px 0;
  flex: 1;
}
.nav-links a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border-left-color: var(--accent);
}
.nav-icon {
  font-size: 1.1rem;
}

/* Main */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.topbar {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}
.page-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--primary);
}
.topbar-right {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--text-light);
}
.content {
  padding: 24px;
  flex: 1;
}

/* Overlay for mobile */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
.overlay.active {
  display: block;
}

/* Cards */
.card {
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
  padding: 24px;
  margin-bottom: 20px;
}
.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--accent);
  display: inline-block;
}

/* Buttons */
.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}
.btn-primary {
  background: var(--primary-light);
  color: white;
}
.btn-accent {
  background: var(--accent);
  color: white;
}
.btn-success {
  background: var(--success);
  color: white;
}
.btn-danger {
  background: var(--danger);
  color: white;
}
.btn-warning {
  background: var(--warning);
  color: white;
}
.btn-outline {
  background: transparent;
  border: 1.5px solid var(--primary-light);
  color: var(--primary-light);
}
.btn-sm {
  padding: 6px 12px;
  font-size: 0.82rem;
}
.btn-telegram {
  background: #0088cc;
  color: white;
}

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  display: inline-block;
}
.badge-paid {
  background: #dcfce7;
  color: #16a34a;
}
.badge-unpaid {
  background: #fee2e2;
  color: #dc2626;
}

/* Form */
.form-group {
  margin-bottom: 18px;
}
.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}
.form-input,
.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--text);
  background: white;
  transition: border-color 0.2s;
}
.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(37, 99, 168, 0.12);
}

/* Table */
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
th {
  background: var(--primary);
  color: white;
  padding: 12px 14px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}
td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
tr:hover td {
  background: #f8fafc;
}
tr:last-child td {
  border-bottom: none;
}

/* Modal */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-box {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 20px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 22px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  z-index: 3000;
  animation: slideUp 0.3s ease;
  max-width: 320px;
}
.toast-success {
  background: var(--success);
}
.toast-error {
  background: var(--danger);
}
@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  font-size: 2rem;
}
.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}
.stat-lbl {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .main-wrapper {
    margin-left: 0;
  }
  .menu-btn {
    display: block;
  }
  .close-btn {
    display: block;
  }
  .content {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
