import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";

const BASE =
  (import.meta.env.VITE_API_URL ?? "http://localhost:4001") + "/api/rentals";
const AUTH_BASE =
  (import.meta.env.VITE_API_URL ?? "http://localhost:4001") + "/api/auth";
const API = `${BASE}/records`;
const TELEGRAM_API = `${BASE}/telegram`;

// ── Axios interceptor: attach JWT to every request ──────────────────────────
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Axios interceptor: handle 401 globally ───────────────────────────────────
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      router.push({ name: "login" });
    }
    return Promise.reject(err);
  },
);

export const useRentalStore = defineStore("rental", {
  state: () => ({
    records: [],
    loading: false,
    error: null,
  }),

  getters: {
    unpaidRecords: (state) => state.records.filter((r) => r.unpaid_months > 0),
    paidRecords: (state) => state.records.filter((r) => r.unpaid_months === 0),
    totalUnpaid: (state) =>
      state.records.reduce((s, r) => s + (r.total_due || 0), 0),
    totalTenants: (state) => state.records.length,
  },

  actions: {
    // ── Auth ───────────────────────────────────────────────────────────────
    async logout() {
      const token = localStorage.getItem("admin_token");
      if (token) {
        await axios.post(`${AUTH_BASE}/logout`).catch(() => {});
      }
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      router.push({ name: "login" });
    },

    // ── Rentals ────────────────────────────────────────────────────────────
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get(API);
        const payload = res.data;
        if (Array.isArray(payload)) this.records = payload;
        else if (Array.isArray(payload?.data)) this.records = payload.data;
        else {
          console.warn("[RentalStore] Unexpected shape:", payload);
          this.records = [];
        }
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        this.records = [];
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async createRecord(data) {
      const res = await axios.post(API, data);
      await this.fetchAll();
      return res.data;
    },

    async updateRecord(id, data) {
      const res = await axios.put(`${API}/${id}`, data);
      await this.fetchAll();
      return res.data;
    },

    async updateStatus(id, status, monthsToPay = null) {
      const payload = { status };
      if (monthsToPay !== null && monthsToPay !== undefined)
        payload.months_to_pay = monthsToPay;
      const res = await axios.patch(`${API}/${id}/status`, payload);
      await this.fetchAll();
      return res.data;
    },

    async deleteRecord(id) {
      const res = await axios.delete(`${API}/${id}`);
      await this.fetchAll();
      return res.data;
    },

    async getPaymentHistory(id) {
      const res = await axios.get(`${API}/${id}/history`);
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },

    async sendInvoice(id) {
      const res = await axios.post(`${TELEGRAM_API}/invoice/${id}`);
      return res.data;
    },

    async sendAllUnpaid() {
      const res = await axios.post(`${TELEGRAM_API}/send-all`);
      return res.data;
    },
  },
});
