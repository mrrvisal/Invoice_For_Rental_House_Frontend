<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <div class="logo" @click="scrollToTop">
            <img
              src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777363580/ChatGPT_Image_Apr_28_2026_02_47_44_PM-Picsart-BackgroundRemover_skuxrc.png"
              width="80px"
              alt=""
            />
          </div>

          <!-- Logout -->
          <button class="btn-logout" @click="logoutModal = true">
            <span class="logout-icon">🔓</span>
            <span class="logout-label">ចេញ</span>
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <!-- Search & Filter Bar - Fully Responsive -->
        <div class="search-section">
          <div class="search-field">
            <span class="search-icon">🔍</span>
            <input 
              v-model="search" 
              type="text" 
              placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬបន្ទប់..."
              class="search-input"
            />
          </div>
          <div class="filter-actions">
            <select v-model="filterStatus" class="filter-select">
              <option value="">ស្ថានភាពទាំងអស់</option>
              <option value="unpaid">មិនទាន់បង់</option>
              <option value="paid">បានបង់</option>
            </select>
            <button class="btn btn-secondary" @click="sendAll">📡 ផ្ញើសរុប</button>
            <button class="btn btn-primary" @click="openAddModal">➕ បន្ថែម</button>
          </div>
        </div>

        <!-- Stats Cards - Responsive Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">👥</div>
            <div class="stat-info">
              <span class="stat-label">អ្នកជួលសរុប</span>
              <strong class="stat-value">{{ records.length }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red">❌</div>
            <div class="stat-info">
              <span class="stat-label">កំពុងជំពាក់</span>
              <strong class="stat-value">{{ unpaidCount }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">✅</div>
            <div class="stat-info">
              <span class="stat-label">បានបង់រួច</span>
              <strong class="stat-value">{{ records.length - unpaidCount }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">💰</div>
            <div class="stat-info">
              <span class="stat-label">ជំពាក់សរុប</span>
              <strong class="stat-value">{{ formatCurrency(totalDue) }}</strong>
            </div>
          </div>
        </div>

        <!-- Tenants List -->
        <div class="tenants-section">
          <div class="section-header">
            <h2>📋 បញ្ជីអ្នកជួល</h2>
            <span class="badge-count">{{ filtered.length }} នាក់</span>
          </div>

          <div v-if="store.loading" class="loading-state">
            <div class="spinner"></div>
            <p>កំពុងផ្ទុក...</p>
          </div>

          <div v-else-if="!filtered.length" class="empty-state">
            <span class="empty-icon">🏠</span>
            <p>មិនមានទិន្នន័យអ្នកជួល</p>
          </div>

          <!-- Desktop Full Table (XL) -->
          <div class="table-responsive table-xl">
            <table class="tenant-table">
              <thead>
                <tr><th>#</th><th>បន្ទប់</th><th>ឈ្មោះ</th><th>ទូរស័ព្ទ</th><th>ថ្ងៃចូល</th><th>ថ្ងៃបង់</th><th>តម្លៃ/ខែ</th><th>ជំពាក់(ខែ)</th><th>ខែបច្ចុប្បន្ន</th><th>បង់ហើយ</th><th>ជំពាក់សរុប</th><th>ស្ថានភាព</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in filtered" :key="r.id" :class="{ 'row-warning': r.unpaid_months > 0 }">
                  <td data-label="#">{{ i + 1 }}</td>
                  <td data-label="បន្ទប់"><span class="room-badge">{{ r.room_number }}</span></td>
                  <td data-label="ឈ្មោះ"><strong>{{ r.tenant_name }}</strong></td>
                  <td data-label="ទូរស័ព្ទ">{{ r.phone }}</td>
                  <td data-label="ថ្ងៃចូល">{{ formatDate(r.checkin_date) }}</td>
                  <td data-label="ថ្ងៃបង់"><span class="due-chip">ថ្ងៃទី {{ r.due_day }}</span></td>
                  <td data-label="តម្លៃ/ខែ">{{ formatCurrency(r.room_price) }}</td>
                  <td data-label="ជំពាក់(ខែ)"><span class="status-chip warning">{{ r.unpaid_overdue_months }} ខែ</span></td>
                  <td data-label="ខែបច្ចុប្បន្ន"><span class="status-chip info">{{ r.unpaid_current_month }} ខែ</span></td>
                  <td data-label="បង់ហើយ">{{ r.months_paid || 0 }} ខែ</td>
                  <td data-label="ជំពាក់សរុប" :class="{ 'text-danger': r.total_due > 0 }">{{ formatCurrency(r.total_due) }}</td>
                  <td data-label="ស្ថានភាព"><span class="status-badge" :class="r.unpaid_months > 0 ? 'status-badge-danger' : 'status-badge-success'">{{ r.unpaid_months > 0 ? 'ជំពាក់' : 'បានបង់' }}</span></td>
                  <td data-label="សកម្មភាព">
                    <div class="action-group">
                      <button v-if="r.unpaid_months > 0" class="action-btn success" @click="openPayModal(r)" title="បង់ប្រាក់">💰</button>
                      <button v-if="r.unpaid_months > 0" class="action-btn telegram" @click="sendInvoice(r)" title="ផ្ញើ Telegram">📱</button>
                      <button class="action-btn edit" @click="openEditModal(r)" title="កែប្រែ">✏️</button>
                      <button class="action-btn delete" @click="confirmDelete(r)" title="លុប">🗑️</button>
                      <button class="action-btn history" @click="viewHistory(r)" title="ប្រវត្តិ">📜</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Desktop Compact Table (LG) -->
          <div class="table-responsive table-lg">
            <table class="tenant-table compact">
              <thead>
                <tr><th>បន្ទប់</th><th>ឈ្មោះ / ទូរស័ព្ទ</th><th>តម្លៃ/ខែ</th><th>ជំពាក់សរុប</th><th>ស្ថានភាព</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="r in filtered" :key="r.id" :class="{ 'row-warning': r.unpaid_months > 0 }">
                  <td data-label="បន្ទប់"><span class="room-badge">{{ r.room_number }}</span></td>
                  <td data-label="ឈ្មោះ / ទូរស័ព្ទ"><strong>{{ r.tenant_name }}</strong><br><span class="small-text">{{ r.phone }}</span></td>
                  <td data-label="តម្លៃ/ខែ">{{ formatCurrency(r.room_price) }}</td>
                  <td data-label="ជំពាក់សរុប" :class="{ 'text-danger': r.total_due > 0 }">{{ formatCurrency(r.total_due) }}</td>
                  <td data-label="ស្ថានភាព"><span class="status-badge" :class="r.unpaid_months > 0 ? 'status-badge-danger' : 'status-badge-success'">{{ r.unpaid_months > 0 ? 'ជំពាក់' : 'បានបង់' }}</span></td>
                  <td data-label="សកម្មភាព">
                    <div class="action-group">
                      <button v-if="r.unpaid_months > 0" class="action-btn success" @click="openPayModal(r)">💰</button>
                      <button v-if="r.unpaid_months > 0" class="action-btn telegram" @click="sendInvoice(r)">📱</button>
                      <button class="action-btn edit" @click="openEditModal(r)">✏️</button>
                      <button class="action-btn delete" @click="confirmDelete(r)">🗑️</button>
                      <button class="action-btn history" @click="viewHistory(r)">📜</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tablet View (MD) -->
          <div class="table-responsive table-md">
            <table class="tenant-table tablet-table">
              <thead>
                <tr><th>បន្ទប់ / តម្លៃ</th><th>ឈ្មោះ / ថ្ងៃចូល</th><th>ទូរស័ព្ទ</th><th>ជំពាក់ / ស្ថានភាព</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="r in filtered" :key="r.id" :class="{ 'row-warning': r.unpaid_months > 0 }">
                  <td data-label="បន្ទប់ / តម្លៃ"><span class="room-badge">{{ r.room_number }}</span><br><span class="small-text">{{ formatCurrency(r.room_price) }}/ខែ</span></td>
                  <td data-label="ឈ្មោះ / ថ្ងៃចូល"><strong>{{ r.tenant_name }}</strong><br><span class="small-text">ចូល: {{ formatDate(r.checkin_date) }}</span></td>
                  <td data-label="ទូរស័ព្ទ">{{ r.phone }}</td>
                  <td data-label="ជំពាក់ / ស្ថានភាព">
                    <span class="status-badge" :class="r.unpaid_months > 0 ? 'status-badge-danger' : 'status-badge-success'">{{ r.unpaid_months > 0 ? 'ជំពាក់' : 'បានបង់' }}</span>
                    <div class="small-text">ជំពាក់: {{ formatCurrency(r.total_due) }}</div>
                  </td>
                  <td data-label="សកម្មភាព">
                    <div class="action-group">
                      <button v-if="r.unpaid_months > 0" class="action-btn success" @click="openPayModal(r)">💰</button>
                      <button v-if="r.unpaid_months > 0" class="action-btn telegram" @click="sendInvoice(r)">📱</button>
                      <button class="action-btn edit" @click="openEditModal(r)">✏️</button>
                      <button class="action-btn delete" @click="confirmDelete(r)">🗑️</button>
                      <button class="action-btn history" @click="viewHistory(r)">📜</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards (SM, XS) -->
          <div class="mobile-cards">
            <div v-for="r in filtered" :key="r.id" class="tenant-card" :class="{ 'card-warning': r.unpaid_months > 0 }">
              <div class="card-header">
                <div class="card-room">{{ r.room_number }}</div>
                <div class="card-status" :class="r.unpaid_months > 0 ? 'status-warning' : 'status-success'">{{ r.unpaid_months > 0 ? 'ជំពាក់' : 'បានបង់' }}</div>
              </div>
              <div class="card-body">
                <div class="info-row"><span class="info-label">ឈ្មោះ</span><span class="info-value">{{ r.tenant_name }}</span></div>
                <div class="info-row"><span class="info-label">ទូរស័ព្ទ</span><span class="info-value">{{ r.phone }}</span></div>
                <div class="info-row"><span class="info-label">តម្លៃ/ខែ</span><span class="info-value">{{ formatCurrency(r.room_price) }}</span></div>
                <div class="info-row"><span class="info-label">ជំពាក់សរុប</span><span class="info-value text-danger">{{ formatCurrency(r.total_due) }}</span></div>
                <div class="info-row"><span class="info-label">ថ្ងៃត្រូវបង់</span><span class="info-value due">ថ្ងៃទី {{ r.due_day }}</span></div>
                <div class="info-row"><span class="info-label">ថ្ងៃចូល</span><span class="info-value">{{ formatDate(r.checkin_date) }}</span></div>
                <div class="info-row"><span class="info-label">ខែជំពាក់</span><span class="info-value">{{ r.unpaid_overdue_months }} ខែ</span></div>
                <div class="info-row"><span class="info-label">ខែបច្ចុប្បន្ន</span><span class="info-value">{{ r.unpaid_current_month }} ខែ</span></div>
                <div class="info-row"><span class="info-label">បង់ហើយ</span><span class="info-value">{{ r.months_paid || 0 }} ខែ</span></div>
              </div>
              <div class="card-actions">
                <button v-if="r.unpaid_months > 0" class="card-btn btn-pay" @click="openPayModal(r)">💰 បង់ប្រាក់</button>
                <button v-if="r.unpaid_months > 0" class="card-btn btn-telegram" @click="sendInvoice(r)">📱 Telegram</button>
                <button class="card-btn btn-edit" @click="openEditModal(r)">✏️ កែប្រែ</button>
                <button class="card-btn btn-delete" @click="confirmDelete(r)">🗑️ លុប</button>
                <button class="card-btn btn-history" @click="viewHistory(r)">📜 ប្រវត្តិ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <p>© 2025 Rental Manager — គ្រប់គ្រងអ្នកជួលប្រកបដោយប្រសិទ្ធភាព</p>
        </div>
      </div>
    </footer>

    <!-- ══════════════════════════════════════════════════════
         LOGOUT CONFIRMATION MODAL
    ═══════════════════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="logoutModal" class="modal-overlay" @click.self="logoutModal = false">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>ចេញពីប្រព័ន្ធ</h3>
            <button class="modal-close" @click="logoutModal = false">✕</button>
          </div>

          <div class="logout-modal-body">
            <div class="logout-icon-wrap">🔓</div>
            <p class="logout-confirm-text">តើអ្នកពិតជាចង់ចេញពីប្រព័ន្ធមែនទេ?</p>
            <p class="logout-confirm-sub">អ្នកនឹងត្រូវចូលប្រព័ន្ធម្តងទៀតដើម្បីប្រើប្រាស់</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="logoutModal = false">បោះបង់</button>
            <button class="btn btn-logout-confirm" :disabled="logoutLoading" @click="doLogout">
              <span v-if="logoutLoading" class="spinner-sm"></span>
              <span v-else>🔓 ចេញ</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Existing Modals -->
    <transition name="modal-fade">
      <div v-if="tenantModal.show" class="modal-overlay" @click.self="closeTenantModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ tenantModal.isEdit ? 'កែប្រែអ្នកជួល' : 'បន្ថែមអ្នកជួលថ្មី' }}</h3>
            <button class="modal-close" @click="closeTenantModal">✕</button>
          </div>
          <form @submit.prevent="submitTenant">
            <div class="form-grid">
              <div class="form-field" style="position:relative;">
                <label>ឈ្មោះអ្នកជួល *</label>
                <input v-model="tenantForm.tenant_name" type="text" placeholder="ឧ. លោក សុខា" required @input="onNameInput" @keydown="onNameKeydown" @blur="hideAcDropdown" />
                <div v-if="acDropdown.show" class="ac-dropdown">
                  <div v-for="(t, idx) in acDropdown.results" :key="t.id" class="ac-item" :class="{ active: acDropdown.activeIdx === idx }" @mousedown.prevent="fillFromTenant(t)">
                    <div class="ac-avatar">{{ getInitials(t.tenant_name) }}</div>
                    <div class="ac-info"><strong>{{ t.tenant_name }}</strong><br><small>{{ t.phone }} · បន្ទប់ {{ t.room_number }}</small></div>
                  </div>
                </div>
              </div>
              <div class="form-field"><label>លេខទូរស័ព្ទ *</label><input v-model="tenantForm.phone" type="text" placeholder="ឧ. 012345678" required /></div>
              <div class="form-field"><label>លេខបន្ទប់ *</label><input v-model="tenantForm.room_number" placeholder="ឧ. 101" required /></div>
              <div class="form-field"><label>តម្លៃជួល/ខែ ($) *</label><input v-model.number="tenantForm.room_price" type="number" min="0" required /></div>
              <div class="form-field"><label>ថ្ងៃចូលស្នាក់ *</label><input v-model="tenantForm.checkin_date" type="date" required /></div>
              <div class="form-field"><label>កំណត់ចំណាំ</label><input v-model="tenantForm.notes" placeholder="ឧ. រួមបញ្ចូលទឹក/ភ្លើង" /></div>
            </div>
            <div v-if="tenantForm.checkin_date" class="info-note">📆 ថ្ងៃត្រូវបង់: រៀងរាល់ ថ្ងៃទី {{ new Date(tenantForm.checkin_date).getDate() }} នៃខែ</div>
            <div v-if="tenantModal.error" class="error-message">{{ tenantModal.error }}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeTenantModal">បោះបង់</button>
              <button type="submit" class="btn btn-primary" :disabled="tenantModal.loading">{{ tenantModal.loading ? 'កំពុងរក្សា...' : (tenantModal.isEdit ? 'រក្សាទុក' : 'បន្ថែម') }}</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="payModal.show" class="modal-overlay" @click.self="payModal.show=false">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>បញ្ចូលការបង់ប្រាក់</h3>
            <button class="modal-close" @click="payModal.show=false">✕</button>
          </div>
          <div class="pay-summary">
            <div><span>អ្នកជួល:</span><strong>{{ payModal.record?.tenant_name }}</strong></div>
            <div><span>បន្ទប់:</span><strong>{{ payModal.record?.room_number }}</strong></div>
            <div><span>ជំពាក់សរុប:</span><strong class="text-danger">{{ payModal.record?.unpaid_months }} ខែ ({{ formatCurrency(payModal.record?.total_due) }})</strong></div>
          </div>
          <div class="form-field">
            <label>ចំនួនខែដែលចង់បង់</label>
            <div class="amount-selector">
              <input v-model.number="payModal.monthsToPay" type="number" :min="1" :max="payModal.record?.unpaid_months || 1" />
              <button class="btn-sm btn-secondary" @click="payModal.monthsToPay = payModal.record?.unpaid_months">បង់ទាំងអស់</button>
            </div>
          </div>
          <div class="pay-total-box">
            <span>ទឹកប្រាក់ត្រូវទទួល:</span>
            <strong>{{ formatCurrency((payModal.monthsToPay || 0) * (payModal.record?.room_price || 0)) }}</strong>
          </div>
          <div v-if="payModal.error" class="error-message">{{ payModal.error }}</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="payModal.show=false">បោះបង់</button>
            <button class="btn btn-success" :disabled="payModal.loading" @click="submitPay">{{ payModal.loading ? 'កំពុង...' : 'បញ្ជាក់ការបង់ប្រាក់' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show=false">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>លុបទិន្នន័យ</h3>
            <button class="modal-close" @click="deleteModal.show=false">✕</button>
          </div>
          <p>តើអ្នកចង់លុបព័ត៌មានអ្នកជួល <strong>{{ deleteModal.record?.tenant_name }}</strong> បន្ទប់លេខ <strong>{{ deleteModal.record?.room_number }}</strong> មែនទេ?</p>
          <p class="text-danger" style="font-size:0.8rem;">⚠️ ទិន្នន័យនឹងត្រូវបានលុបចោលជាអចិន្ត្រៃយ៍</p>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="deleteModal.show=false">បោះបង់</button>
            <button class="btn btn-danger" @click="doDelete">លុប</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="historyModal.show" class="modal-overlay" @click.self="historyModal.show=false">
        <div class="modal-container medium">
          <div class="modal-header">
            <h3>ប្រវត្តិការបង់ប្រាក់</h3>
            <button class="modal-close" @click="historyModal.show=false">✕</button>
          </div>
          <p><strong>{{ historyModal.tenant }}</strong></p>
          <div v-if="!historyModal.data.length" class="empty-state small">មិនមានប្រវត្តិការបង់ប្រាក់</div>
          <table v-else class="history-table">
            <thead><tr><th>#</th><th>ថ្ងៃបង់</th><th>ចំនួនខែ</th><th>ចំនួនទឹកប្រាក់</th></tr></thead>
            <tbody>
              <tr v-for="(h, i) in historyModal.data" :key="h.id"><td>{{ i+1 }}</td><td>{{ formatDate(h.paid_date) }}</td><td>{{ h.months_paid }} ខែ</td><td class="text-success">{{ formatCurrency(h.amount_paid) }}</td></tr>
            </tbody>
          </table>
          <div class="modal-footer"><button class="btn btn-secondary" @click="historyModal.show=false">បិទ</button></div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRentalStore } from '../store/rental'

const store = useRentalStore()
const search = ref('')
const filterStatus = ref('')
const toast = ref({ show: false, type: '', msg: '' })
const deleteModal = ref({ show: false, record: null })
const historyModal = ref({ show: false, data: [], tenant: '' })
const mobileMenuOpen = ref(false)

// ── Logout modal state ─────────────────────────────────────
const logoutModal   = ref(false)
const logoutLoading = ref(false)

async function doLogout() {
  logoutLoading.value = true
  await store.logout()          // clears token + redirects to /login
  logoutLoading.value = false
  logoutModal.value   = false
}
// ──────────────────────────────────────────────────────────

const records = computed(() => store.records ?? [])

const acDropdown = ref({ show: false, results: [], activeIdx: -1 })
function onNameInput() {
  const q = tenantForm.value.tenant_name.trim().toLowerCase()
  if (!q) { acDropdown.value.show = false; return }
  acDropdown.value.results = records.value.filter(r => r.tenant_name.toLowerCase().includes(q) || r.phone.includes(q)).slice(0, 5)
  acDropdown.value.show = acDropdown.value.results.length > 0
  acDropdown.value.activeIdx = -1
}
function onNameKeydown(e) {
  if (!acDropdown.value.show) return
  if (e.key === 'ArrowDown') { e.preventDefault(); acDropdown.value.activeIdx = Math.min(acDropdown.value.activeIdx + 1, acDropdown.value.results.length - 1) }
  if (e.key === 'ArrowUp') { e.preventDefault(); acDropdown.value.activeIdx = Math.max(acDropdown.value.activeIdx - 1, 0) }
  if (e.key === 'Enter' && acDropdown.value.activeIdx >= 0) { e.preventDefault(); fillFromTenant(acDropdown.value.results[acDropdown.value.activeIdx]) }
  if (e.key === 'Escape') acDropdown.value.show = false
}
function hideAcDropdown() { setTimeout(() => acDropdown.value.show = false, 150) }
function fillFromTenant(t) {
  tenantForm.value = { tenant_name: t.tenant_name, phone: t.phone, room_number: t.room_number, room_price: parseFloat(t.room_price), checkin_date: '', notes: '' }
  acDropdown.value.show = false
  showToast('បំពេញព័ត៌មានដោយស្វ័យប្រវត្តិ ✓')
}
function getInitials(name) { if (!name) return '?'; const parts = name.trim().split(' '); return parts.length >= 2 ? (parts[parts.length-2][0] + parts[parts.length-1][0]).toUpperCase() : name[0].toUpperCase() }

const defaultForm = () => ({ tenant_name: '', phone: '', room_number: '', room_price: 100, checkin_date: '', notes: '' })
const tenantModal = ref({ show: false, isEdit: false, editId: null, loading: false, error: '' })
const tenantForm = ref(defaultForm())

function openAddModal() { tenantForm.value = defaultForm(); acDropdown.value.show = false; tenantModal.value = { show: true, isEdit: false, editId: null, loading: false, error: '' }; mobileMenuOpen.value = false }
function openEditModal(r) { tenantForm.value = { tenant_name: r.tenant_name, phone: r.phone, room_number: r.room_number, room_price: parseFloat(r.room_price), checkin_date: r.checkin_date?.split('T')[0] || r.checkin_date, notes: r.notes || '' }; acDropdown.value.show = false; tenantModal.value = { show: true, isEdit: true, editId: r.id, loading: false, error: '' } }
function closeTenantModal() { tenantModal.value.show = false; acDropdown.value.show = false }
async function submitTenant() {
  tenantModal.value.error = ''; tenantModal.value.loading = true
  try {
    if (tenantModal.value.isEdit) { const res = await store.updateRecord(tenantModal.value.editId, tenantForm.value); showToast(res.message || 'បានកែប្រែដោយជោគជ័យ') }
    else { const res = await store.createRecord(tenantForm.value); showToast(res.message || 'បានបន្ថែមដោយជោគជ័យ') }
    closeTenantModal()
  } catch (e) { tenantModal.value.error = e.response?.data?.message || 'មានបញ្ហា សូមព្យាយាមម្តងទៀត' }
  finally { tenantModal.value.loading = false }
}

const payModal = ref({ show: false, record: null, monthsToPay: 1, loading: false, error: '' })
function openPayModal(r) { payModal.value = { show: true, record: r, monthsToPay: r.unpaid_months, loading: false, error: '' } }
async function submitPay() {
  payModal.value.error = ''; payModal.value.loading = true
  try { const res = await store.updateStatus(payModal.value.record.id, 'paid', payModal.value.monthsToPay); payModal.value.show = false; showToast(res.message) }
  catch (e) { payModal.value.error = e.response?.data?.message || 'មានបញ្ហា' }
  finally { payModal.value.loading = false }
}

const filtered = computed(() => {
  let list = records.value
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(r => r.tenant_name.toLowerCase().includes(q) || r.phone.includes(q) || r.room_number.toLowerCase().includes(q)) }
  if (filterStatus.value === 'unpaid') list = list.filter(r => r.unpaid_months > 0)
  if (filterStatus.value === 'paid') list = list.filter(r => r.unpaid_months === 0)
  return list
})
const unpaidCount = computed(() => records.value.filter(r => r.unpaid_months > 0).length)
const totalDue = computed(() => records.value.reduce((s, r) => s + (r.total_due || 0), 0))

function formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}` }
function formatCurrency(v) { return '$' + parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
function showToast(msg, type='success') { toast.value = { show: true, type, msg }; setTimeout(() => toast.value.show = false, 3000) }
async function sendInvoice(r) { try { const res = await store.sendInvoice(r.id); showToast(res.message) } catch(e) { showToast('មិនអាចផ្ញើបាន', 'error') } }
async function sendAll() { try { const res = await store.sendAllUnpaid(); showToast(res.message) } catch(e) { showToast('មិនអាចផ្ញើសរុបបាន', 'error') } }
function confirmDelete(r) { deleteModal.value = { show: true, record: r } }
async function doDelete() { try { const res = await store.deleteRecord(deleteModal.value.record.id); deleteModal.value.show = false; showToast(res.message) } catch(e) { showToast('មិនអាចលុបបាន', 'error') } }
async function viewHistory(r) { const data = await store.getPaymentHistory(r.id); historyModal.value = { show: true, data: data ?? [], tenant: r.tenant_name } }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(() => store.fetchAll())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f5f2;
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #1c1917;
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 28px;
  width: 100%;
}

/* ── Header ───────────────────────────────────────────────── */
.app-header {
  background: #fff;
  border-bottom: 1px solid #e8e5df;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo { cursor: pointer; }
.logo img { display: block; }

/* ── Logout button ────────────────────────────────────────── */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-logout:hover { background: #fee2e2; }
.logout-icon { font-size: 14px; }

/* ── Main ─────────────────────────────────────────────────── */
.app-main { flex: 1; padding: 28px 0 48px; }

/* ── Search & Filter ──────────────────────────────────────── */
.search-section {
  background: #fff;
  border: 1px solid #e8e5df;
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-field {
  flex: 2;
  min-width: 160px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 8px;
  background: #f6f5f2;
  border: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}

.search-field:focus-within { background: #fff; border-color: #a5b4fc; }
.search-icon { font-size: 14px; opacity: 0.45; }

.search-input {
  border: none;
  background: none;
  flex: 1;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1c1917;
  outline: none;
  min-width: 0;
}
.search-input::placeholder { color: #a8a29e; }

.filter-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.filter-select {
  background: #f6f5f2;
  border: 1px solid #e8e5df;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.83rem;
  font-family: inherit;
  color: #44403c;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.filter-select:focus { border-color: #a5b4fc; }

/* ── Buttons ──────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.83rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1.4;
}

.btn-primary    { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.btn-primary:hover { background: #4338ca; border-color: #4338ca; }
.btn-secondary  { background: #f6f5f2; color: #44403c; border-color: #e8e5df; }
.btn-secondary:hover { background: #eeecea; }
.btn-success    { background: #059669; color: #fff; }
.btn-success:hover { background: #047857; }
.btn-danger     { background: #dc2626; color: #fff; }
.btn-danger:hover { background: #b91c1c; }
.btn-sm { padding: 5px 12px; font-size: 0.78rem; }

/* ── Logout confirm button ───────────────────────────────── */
.btn-logout-confirm {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.83rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: background 0.15s;
  min-width: 90px;
  justify-content: center;
}
.btn-logout-confirm:hover:not(:disabled) { background: #b91c1c; }
.btn-logout-confirm:disabled { opacity: 0.7; cursor: not-allowed; }

/* ── Logout modal body ───────────────────────────────────── */
.logout-modal-body {
  text-align: center;
  padding: 18px 10px 8px;
}

.logout-icon-wrap {
  font-size: 36px;
  margin-bottom: 14px;
  display: block;
}

.logout-confirm-text {
  font-size: 0.97rem;
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 6px;
}

.logout-confirm-sub {
  font-size: 0.78rem;
  color: #a8a29e;
  margin-bottom: 4px;
}

/* ── Spinner (small, for logout button) ─────────────────── */
.spinner-sm {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Stats Cards ──────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e8e5df;
  border-radius: 14px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 13px;
  transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

.stat-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px; flex-shrink: 0;
}
.stat-icon.blue   { background: #eef2ff; }
.stat-icon.red    { background: #fef2f2; }
.stat-icon.green  { background: #ecfdf5; }
.stat-icon.orange { background: #fff7ed; }

.stat-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.stat-label { font-size: 0.7rem; font-weight: 500; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.5rem; font-weight: 600; color: #1c1917; font-family: 'DM Mono', monospace; line-height: 1.15; }

/* ── Tenants Section ──────────────────────────────────────── */
.tenants-section { background: transparent; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-header h2 { font-size: 0.88rem; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px; }

.badge-count {
  background: #fff; border: 1px solid #e8e5df;
  padding: 3px 12px; border-radius: 20px;
  font-size: 0.75rem; color: #78716c; font-family: 'DM Mono', monospace;
}

.table-responsive, .table-xl, .table-lg, .table-md { display: none !important; }

.loading-state, .empty-state {
  text-align: center; padding: 56px 24px; color: #a8a29e;
  font-size: 0.875rem; background: #fff;
  border: 1px solid #e8e5df; border-radius: 14px;
}
.empty-icon { font-size: 30px; display: block; margin-bottom: 10px; }

.spinner {
  width: 26px; height: 26px;
  border: 2px solid #e8e5df; border-top-color: #4f46e5;
  border-radius: 50%; margin: 0 auto 12px;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Cards ────────────────────────────────────────────────── */
.mobile-cards {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.tenant-card {
  background: #fff; border-radius: 14px;
  border: 1px solid #e8e5df; overflow: hidden;
  transition: box-shadow 0.2s; display: flex; flex-direction: column;
}
.tenant-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.07); }
.card-warning { border-left: 3px solid #f87171; }

.card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: #faf9f7; border-bottom: 1px solid #f0ede8;
}
.card-room {
  background: #1c1917; color: #fff; padding: 4px 12px;
  border-radius: 7px; font-family: 'DM Mono', monospace;
  font-size: 0.8rem; font-weight: 500; letter-spacing: 0.3px;
}
.card-status { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
.status-warning { background: #fef2f2; color: #b91c1c; }
.status-success { background: #ecfdf5; color: #047857; }

.card-body { padding: 10px 16px; flex: 1; }

.info-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 6px 0; border-bottom: 1px solid #f6f5f2; font-size: 0.83rem; gap: 8px;
}
.info-row:last-child { border-bottom: none; }
.info-label { color: #a8a29e; font-weight: 500; flex-shrink: 0; font-size: 0.77rem; }
.info-value { font-weight: 500; color: #1c1917; font-family: 'DM Mono', monospace; font-size: 0.81rem; text-align: right; }

.due { color: #3b5fc0; }
.text-danger  { color: #dc2626; font-weight: 600; }
.text-success { color: #059669; font-weight: 600; }
.small-text   { font-size: 0.72rem; color: #a8a29e; }

.card-actions {
  display: flex; flex-wrap: wrap; gap: 7px;
  padding: 11px 16px; background: #faf9f7; border-top: 1px solid #f0ede8;
}

.card-btn {
  flex: 1; min-width: 72px; padding: 8px 4px;
  border-radius: 8px; border: 1px solid transparent;
  font-size: 0.7rem; font-family: inherit; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s, transform 0.1s;
  text-align: center; white-space: nowrap;
}
.card-btn:active { opacity: 0.82; transform: scale(0.98); }
.btn-pay      { background: #059669; color: #fff; }
.btn-telegram { background: #2563eb; color: #fff; }
.btn-edit     { background: #ea580c; color: #fff; }
.btn-delete   { background: #dc2626; color: #fff; }
.btn-history  { background: #6366f1; color: #fff; }

/* ── Footer ───────────────────────────────────────────────── */
.app-footer { background: #fff; border-top: 1px solid #e8e5df; padding: 18px 0; margin-top: 40px; text-align: center; }
.footer-content p { font-size: 0.78rem; color: #a8a29e; }

/* ── Modals ───────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(28, 25, 23, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}

.modal-container {
  background: #fff; border-radius: 18px; border: 1px solid #e8e5df;
  max-width: 580px; width: 100%; max-height: 90vh;
  overflow-y: auto; padding: 28px;
}
.modal-container.small  { max-width: 430px; }
.modal-container.medium { max-width: 530px; }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px solid #f0ede8;
}
.modal-header h3 { font-size: 1.02rem; font-weight: 600; color: #1c1917; }

.modal-close {
  background: #f6f5f2; border: 1px solid #e8e5df;
  width: 30px; height: 30px; border-radius: 8px;
  cursor: pointer; font-size: 0.85rem; color: #78716c;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s; font-family: inherit;
}
.modal-close:hover { background: #eeecea; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; margin-bottom: 13px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field label { font-size: 0.73rem; font-weight: 600; color: #57534e; letter-spacing: 0.2px; }
.form-field input, .form-field select {
  padding: 10px 12px; border: 1px solid #e8e5df; border-radius: 9px;
  font-size: 0.875rem; font-family: inherit; color: #1c1917;
  background: #fff; transition: border-color 0.2s; width: 100%;
}
.form-field input:focus, .form-field select:focus {
  outline: none; border-color: #a5b4fc;
  box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.15);
}

.info-note { background: #eff6ff; border-radius: 9px; padding: 9px 13px; font-size: 0.78rem; color: #1d4ed8; margin: 10px 0; }
.error-message { background: #fef2f2; color: #b91c1c; padding: 10px 14px; border-radius: 9px; font-size: 0.78rem; margin: 10px 0; border: 1px solid #fecaca; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 14px; border-top: 1px solid #f0ede8; }

.pay-summary { background: #faf9f7; border: 1px solid #f0ede8; border-radius: 10px; padding: 14px; margin-bottom: 16px; font-size: 0.85rem; }
.pay-summary div { display: flex; justify-content: space-between; padding: 5px 0; color: #78716c; }
.pay-summary div strong { color: #1c1917; font-family: 'DM Mono', monospace; }

.amount-selector { display: flex; gap: 10px; align-items: center; }
.amount-selector input { flex: 1; padding: 9px 12px; border-radius: 9px; border: 1px solid #e8e5df; font-family: 'DM Mono', monospace; }

.pay-total-box {
  background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px;
  padding: 13px; margin: 13px 0; display: flex;
  justify-content: space-between; align-items: center;
  font-size: 0.88rem; color: #064e3b;
}
.pay-total-box strong { font-size: 1.05rem; font-family: 'DM Mono', monospace; font-weight: 600; }

.history-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
.history-table th { padding: 8px; border-bottom: 1px solid #f0ede8; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a8a29e; font-weight: 600; }
.history-table td { padding: 10px 8px; border-bottom: 1px solid #f6f5f2; color: #44403c; }

/* ── Autocomplete ─────────────────────────────────────────── */
.ac-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #fff; border: 1px solid #e8e5df; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 200; overflow: hidden;
}
.ac-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f6f5f2; transition: background 0.12s; font-size: 0.83rem; }
.ac-item:last-child { border-bottom: none; }
.ac-item:hover, .ac-item.active { background: #faf9f7; }
.ac-avatar { width: 32px; height: 32px; background: #eef2ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem; color: #4f46e5; flex-shrink: 0; }
.ac-info strong { color: #1c1917; }
.ac-info small  { color: #a8a29e; font-family: 'DM Mono', monospace; font-size: 0.71rem; }

/* ── Toast ────────────────────────────────────────────────── */
.toast { position: fixed; bottom: 24px; right: 24px; background: #1c1917; color: #fff; padding: 11px 22px; border-radius: 10px; font-size: 0.83rem; z-index: 1100; box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
.toast-success { background: #059669; }
.toast-error   { background: #dc2626; }

/* ── Responsive ───────────────────────────────────────────── */
@media (min-width: 1280px) { .mobile-cards { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } }
@media (max-width: 1279px) { .mobile-cards { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); } .container { padding: 0 22px; } }
@media (max-width: 1023px) { .mobile-cards { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); } .stats-grid { gap: 12px; } .stat-card { padding: 14px 12px; } .stat-icon { width: 38px; height: 38px; font-size: 17px; } .stat-value { font-size: 1.3rem; } .container { padding: 0 18px; } }
@media (max-width: 767px) {
  .container { padding: 0 14px; }
  .search-section { flex-direction: column; align-items: stretch; padding: 10px 12px; gap: 8px; }
  .filter-actions { justify-content: stretch; }
  .filter-actions .btn { flex: 1; justify-content: center; }
  .filter-select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 12px 10px; gap: 9px; }
  .stat-icon { width: 34px; height: 34px; font-size: 16px; }
  .stat-value { font-size: 1.15rem; }
  .stat-label { font-size: 0.62rem; }
  .mobile-cards { grid-template-columns: 1fr 1fr; gap: 10px; }
  .modal-container { padding: 20px; }
  .modal-header h3 { font-size: 0.95rem; }
  .form-grid { grid-template-columns: 1fr; gap: 10px; }
  .toast { bottom: 14px; right: 14px; left: 14px; text-align: center; border-radius: 9px; }
}
@media (max-width: 500px) {
  .mobile-cards { grid-template-columns: 1fr; gap: 9px; }
  .app-main { padding: 14px 0 32px; }
  .stats-grid { gap: 8px; }
  .stat-card { padding: 10px 9px; gap: 8px; }
  .stat-icon { width: 30px; height: 30px; font-size: 14px; }
  .stat-value { font-size: 1rem; }
  .stat-label { font-size: 0.57rem; }
  .card-header { padding: 10px 12px; }
  .card-body { padding: 8px 12px; }
  .info-row { font-size: 0.77rem; padding: 5px 0; }
  .card-actions { gap: 6px; padding: 9px 12px; }
  .card-btn { font-size: 0.67rem; padding: 7px 3px; min-width: 60px; }
  .btn { padding: 7px 12px; font-size: 0.78rem; }
  .modal-container { padding: 16px; }
  .modal-footer { flex-direction: column-reverse; gap: 8px; }
  .modal-footer .btn, .modal-footer .btn-logout-confirm { width: 100%; justify-content: center; }
  .amount-selector { flex-direction: column; }
  .amount-selector input, .amount-selector button { width: 100%; }
}
@media (max-width: 400px) {
  .logout-label { display: none; }
  .btn-logout { padding: 7px 10px; }
}

/* ── Transitions ──────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.22s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateY(8px); }
</style>