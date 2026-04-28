import { defineStore } from "pinia";
import axios from "axios";

// ✅ FIX: Fallback so API is never undefined even if env var is missing
const BASE = import.meta.env.VITE_API_URL + "/api/rentals";
const API = `${BASE}/records`;
const TELEGRAM_API = `${BASE}/telegram`;

export const useRentalStore = defineStore("rental", {
  state: () => ({
    records: [], // ✅ always an array — never undefined
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
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get(API);

        // ✅ FIX: Handle multiple possible response shapes:
        //   { data: { data: [...] } }  ← Laravel ResourceCollection
        //   { data: { data: [...], message: '' } }
        //   { data: [...] }            ← plain array
        const payload = res.data;
        if (Array.isArray(payload)) {
          this.records = payload;
        } else if (Array.isArray(payload?.data)) {
          this.records = payload.data;
        } else {
          // Unexpected shape — log it so you can debug, but don't crash
          console.warn("[RentalStore] Unexpected API response shape:", payload);
          this.records = [];
        }
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        this.records = []; // ✅ always reset to [] on error, never leave undefined
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

    // monthsToPay: optional — if null, backend pays all unpaid months
    async updateStatus(id, status, monthsToPay = null) {
      const payload = { status };
      if (monthsToPay !== null && monthsToPay !== undefined) {
        payload.months_to_pay = monthsToPay;
      }
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
      // ✅ FIX: same safe unwrap for history endpoint
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
