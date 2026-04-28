<template>
  <div>

    <!-- Controls -->
    <div class="top-bar card" style="margin-bottom:16px; padding:16px;">
      <!-- TEST MODE BAR -->
<!-- <div v-if="testMode.active" class="test-bar">
  🧪 TEST MODE &nbsp;|&nbsp; offset: <strong>+{{ testMode.offset }} ខែ</strong>
  &nbsp;|&nbsp; ⏱ {{ testMode.countdown }}s
  <button class="btn btn-sm btn-danger" @click="stopTest">⏹ បញ្ឈប់</button>
</div> -->
      <div class="controls-row">
        <!-- <button class="btn btn-sm"
  style="background:#7c3aed;color:white"
  @click="startTest"
  title="Test: កើន 1 ខែ រៀងរាល់ 10 វិនាទី">
  🧪 Test 10s/ខែ
</button> -->
        <input v-model="search" class="form-input" placeholder="🔍 ស្វែងរក ឈ្មោះ/ទូរស័ព្ទ/បន្ទប់..." style="max-width:320px;" />
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <select v-model="filterStatus" class="form-select" style="width:auto;">
            <option value="">ស្ថានភាពទាំងអស់</option>
            <option value="unpaid">មិនទាន់បង់</option>
            <option value="paid">បានបង់</option>
          </select>
          <button class="btn btn-telegram" @click="sendAll" title="ផ្ញើរបាយការណ៍ Telegram">📡 ផ្ញើសរុប</button>
          <button class="btn btn-primary" @click="openAddModal">➕ បន្ថែមអ្នកជួល</button>
        </div>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="summary-cards" style="margin-bottom:16px;">
      <div class="sum-card">
        <div class="sum-label">👥 អ្នកជួលសរុប</div>
        <div class="sum-value">{{ records.length }}</div>
      </div>
      <div class="sum-card sum-unpaid">
        <div class="sum-label">❌ ជំពាក់</div>
        <div class="sum-value">{{ unpaidCount }}</div>
      </div>
      <div class="sum-card sum-paid">
        <div class="sum-label">✅ បានបង់</div>
        <div class="sum-value">{{ records.length - unpaidCount }}</div>
      </div>
      <div class="sum-card sum-money">
        <div class="sum-label">💰 ជំពាក់សរុប</div>
        <div class="sum-value">{{ formatCurrency(totalDue) }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-title">📋 បញ្ជីអ្នកជួល ({{ filtered.length }} នាក់)</div>
      <div v-if="store.loading" class="loading-text">⏳ កំពុងផ្ទុក...</div>
      <div v-else-if="!filtered.length" class="empty-text">🏠 មិនមានទិន្នន័យ</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>បន្ទប់</th>
              <th>ឈ្មោះអ្នកជួល</th>
              <th>ទូរស័ព្ទ</th>
              <th>ថ្ងៃចូល</th>
              <th>ថ្ងៃត្រូវបង់</th>
              <th>តម្លៃ/ខែ</th>
              <th>ខែជំពាក់</th>
              <th>ខែបច្ចុប្បន្ន</th>
              <th>ខែបង់</th>
              <th>ជំពាក់សរុប</th>
              <th>ស្ថានភាព</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in filtered" :key="r.id" :class="r.unpaid_months > 0 ? 'row-unpaid' : ''">
              <td>{{ i + 1 }}</td>
              <td><strong style="color:#1a3a5c">{{ r.room_number }}</strong></td>
              <td>{{ r.tenant_name }}</td>
              <td>{{ r.phone }}</td>
              <td>{{ formatDate(r.checkin_date) }}</td>
              <td>
                <span class="due-day-badge">ថ្ងៃ {{ r.due_day }}</span>
              </td>
              <td>{{ formatCurrency(r.room_price) }}</td>
              <td>
                <span v-if="r.unpaid_overdue_months > 0" class="badge badge-unpaid">{{ r.unpaid_overdue_months }} ខែ</span>
                <span v-else class="badge badge-paid">0 ខែ</span>
              </td>
              <td>
                <span v-if="r.unpaid_current_month > 0" class="badge badge-current">{{ r.unpaid_current_month }} ខែ</span>
                <span v-else class="badge badge-paid">0 ខែ</span>
              </td>
              <td>{{ r.months_paid || 0 }} ខែ</td>
              <td :style="r.total_due > 0 ? 'color:#dc2626;font-weight:700' : 'color:#16a34a'">
                {{ formatCurrency(r.total_due) }}
              </td>
              <td>
                <span class="badge" :class="r.unpaid_months > 0 ? 'badge-unpaid' : 'badge-paid'">
                  {{ r.unpaid_months > 0 ? 'មិនទាន់បង់' : 'បានបង់' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button v-if="r.unpaid_months > 0" class="btn btn-sm btn-success" @click="openPayModal(r)" title="បញ្ចូលការបង់ប្រាក់">✅</button>
                  <button v-if="r.unpaid_months > 0" class="btn btn-sm btn-telegram" @click="sendInvoice(r)" title="ផ្ញើ Telegram">📱</button>
                  <button class="btn btn-sm btn-outline" @click="openEditModal(r)" title="កែប្រែ">✏️</button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(r)" title="លុប">🗑️</button>
                  <button class="btn btn-sm" style="background:#6366f1;color:white" @click="viewHistory(r)" title="ប្រវត្តិ">📜</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========== ADD / EDIT MODAL ========== -->
    <transition name="modal-anim">
      <div v-if="tenantModal.show" class="modal-mask" @click.self="closeTenantModal">
        <div class="modal-box modal-large">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.4rem;">{{ tenantModal.isEdit ? '✏️' : '➕' }}</span>
              <div>
                <div class="modal-title" style="margin-bottom:0">
                  {{ tenantModal.isEdit ? 'កែប្រែអ្នកជួល' : 'បន្ថែមអ្នកជួលថ្មី' }}
                </div>
                <div style="font-size:0.78rem; color:#94a3b8; margin-top:2px;">
                  {{ tenantModal.isEdit ? 'ផ្លាស់ប្តូរព័ត៌មានអ្នកជួល' : 'បំពេញព័ត៌មានខាងក្រោម' }}
                </div>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeTenantModal">✕</button>
          </div>

          <form @submit.prevent="submitTenant">
            <div class="form-grid">

              <!-- Name with autocomplete -->
              <div class="form-group" style="position:relative;">
                <label class="form-label">👤 ឈ្មោះអ្នកជួល *</label>
                <input
                  v-model="tenantForm.tenant_name"
                  class="form-input"
                  placeholder="ឧ. លោក សុខា"
                  autocomplete="off"
                  required
                  @input="onNameInput"
                  @keydown="onNameKeydown"
                  @blur="hideAcDropdown"
                />
                <!-- Autocomplete dropdown -->
                <div v-if="acDropdown.show" class="ac-dropdown">
                  <div
                    v-for="(t, i) in acDropdown.results"
                    :key="t.id"
                    class="ac-item"
                    :class="{ 'ac-active': acDropdown.activeIdx === i }"
                    @mousedown.prevent="fillFromTenant(t)"
                  >
                    <div class="ac-avatar">{{ getInitials(t.tenant_name) }}</div>
                    <div class="ac-info">
                      <div class="ac-name">{{ t.tenant_name }}</div>
                      <div class="ac-sub">{{ t.phone }} · បន្ទប់ {{ t.room_number }}</div>
                    </div>
                    <span class="ac-badge">{{ formatCurrency(t.room_price) }}/ខែ</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">📱 លេខទូរស័ព្ទ *</label>
                <input v-model="tenantForm.phone" class="form-input" placeholder="ឧ. 012345678" required />
              </div>
              <div class="form-group">
                <label class="form-label">🚪 លេខបន្ទប់ *</label>
                <input v-model="tenantForm.room_number" class="form-input" placeholder="ឧ. 101" required />
              </div>
              <div class="form-group">
                <label class="form-label">💰 តម្លៃជួល/ខែ ($) *</label>
                <input v-model.number="tenantForm.room_price" type="number" class="form-input" placeholder="ឧ. 100" min="0" required />
              </div>
              <div class="form-group">
                <label class="form-label">📅 ថ្ងៃចូលស្នាក់ *</label>
                <input v-model="tenantForm.checkin_date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">📝 កំណត់ចំណាំ</label>
                <input v-model="tenantForm.notes" class="form-input" placeholder="ឧ. រួមបញ្ចូលទឹក/អគ្គិសនី" />
              </div>
            </div>

            <!-- Due day info -->
            <div v-if="tenantForm.checkin_date" class="due-info-box">
              📆 ថ្ងៃត្រូវបង់: រៀងរាល់ <strong>ថ្ងៃ {{ new Date(tenantForm.checkin_date).getDate() }}</strong> នៃខែ
            </div>

            <!-- Preview -->
            <div v-if="tenantForm.checkin_date && tenantForm.room_price" class="preview-box">
              <div class="preview-title">📊 ការគណនាបង្ហាញជាមុន</div>
              <div class="preview-row">
                <span>❌ ខែជំពាក់ (ចុងក្រោយ)</span>
                <strong>{{ previewStatus.overdueMonths }} ខែ = {{ formatCurrency(previewStatus.overdueMonths * tenantForm.room_price) }}</strong>
              </div>
              <div class="preview-row">
                <span>🗓 ខែបច្ចុប្បន្ន</span>
                <strong>1 ខែ = {{ formatCurrency(tenantForm.room_price) }}</strong>
              </div>
              <div class="preview-row total">
                <span>💵 សរុបត្រូវបង់</span>
                <strong style="color:#dc2626; font-size:1rem;">
                  {{ previewStatus.overdueMonths }}+1 = {{ previewStatus.totalMonths }} ខែ = {{ formatCurrency(previewStatus.totalMonths * tenantForm.room_price) }}
                </strong>
              </div>
            </div>

            <div v-if="tenantModal.error" class="form-error">⚠️ {{ tenantModal.error }}</div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" @click="closeTenantModal">បោះបង់</button>
              <button type="submit" class="btn btn-primary" :disabled="tenantModal.loading">
                <span v-if="tenantModal.loading">⏳ កំពុងរក្សា...</span>
                <span v-else>{{ tenantModal.isEdit ? '💾 រក្សាការផ្លាស់ប្តូរ' : '✅ បន្ថែមអ្នកជួល' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- ========== PAY MODAL ========== -->
    <transition name="modal-anim">
      <div v-if="payModal.show" class="modal-mask" @click.self="payModal.show=false">
        <div class="modal-box" style="max-width:460px">
          <div class="modal-header">
            <div>
              <div class="modal-title" style="margin-bottom:0">✅ បញ្ចូលការបង់ប្រាក់</div>
              <div style="font-size:0.8rem;color:#94a3b8;margin-top:2px;">{{ payModal.record?.tenant_name }} · បន្ទប់ {{ payModal.record?.room_number }}</div>
            </div>
            <button class="modal-close-btn" @click="payModal.show=false">✕</button>
          </div>

          <!-- Breakdown -->
          <div class="pay-breakdown">
            <div class="pay-row">
              <span>❌ ខែជំពាក់ (ចុងក្រោយ)</span>
              <strong class="text-red">{{ payModal.record?.unpaid_overdue_months || 0 }} ខែ</strong>
            </div>
            <div class="pay-row">
              <span>🗓 ខែបច្ចុប្បន្ន</span>
              <strong class="text-orange">{{ payModal.record?.unpaid_current_month || 0 }} ខែ</strong>
            </div>
            <div class="pay-row pay-total">
              <span>💵 ជំពាក់សរុប</span>
              <strong class="text-red">{{ payModal.record?.unpaid_months || 0 }} ខែ = {{ formatCurrency(payModal.record?.total_due) }}</strong>
            </div>
          </div>

          <div class="form-group" style="margin-top:16px;">
            <label class="form-label">ជ្រើសចំនួនខែដែលចង់បង់</label>
            <div style="display:flex; align-items:center; gap:12px;">
              <input
                v-model.number="payModal.monthsToPay"
                type="number"
                class="form-input"
                :min="1"
                :max="payModal.record?.unpaid_months || 1"
                style="width:100px;"
              />
              <span style="color:#64748b; font-size:0.9rem;">ខែ</span>
              <button class="btn btn-sm btn-outline" @click="payModal.monthsToPay = payModal.record?.unpaid_months">បង់ទាំងអស់</button>
            </div>
            <div v-if="payModal.monthsToPay > 0" style="margin-top:10px; padding:10px 14px; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0;">
              <span style="color:#16a34a; font-weight:700; font-size:1rem;">
                💰 ត្រូវទទួល: {{ formatCurrency(payModal.monthsToPay * (payModal.record?.room_price || 0)) }}
              </span>
              <span v-if="payModal.record && payModal.monthsToPay < payModal.record.unpaid_months" style="display:block; font-size:0.82rem; color:#64748b; margin-top:4px;">
                នៅជំពាក់: {{ payModal.record.unpaid_months - payModal.monthsToPay }} ខែទៀត
              </span>
            </div>
          </div>

          <div v-if="payModal.error" class="form-error">⚠️ {{ payModal.error }}</div>

          <div class="modal-footer">
            <button class="btn btn-outline" @click="payModal.show=false">បោះបង់</button>
            <button class="btn btn-success" :disabled="payModal.loading" @click="submitPay">
              <span v-if="payModal.loading">⏳ កំពុងរក្សា...</span>
              <span v-else>✅ បញ្ជាក់ការបង់ប្រាក់</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ========== DELETE CONFIRM MODAL ========== -->
    <transition name="modal-anim">
      <div v-if="deleteModal.show" class="modal-mask" @click.self="deleteModal.show=false">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title">🗑️ លុបទិន្នន័យ</div>
            <button class="modal-close-btn" @click="deleteModal.show=false">✕</button>
          </div>
          <p style="color:#64748b; line-height:1.9; font-size:0.95rem;">
            តើអ្នកចង់លុបព័ត៌មានអ្នកជួល
            <strong style="color:#1e293b">{{ deleteModal.record?.tenant_name }}</strong>
            បន្ទប់លេខ <strong style="color:#1a3a5c">{{ deleteModal.record?.room_number }}</strong> ពិតមែនទេ?
            <br><span style="color:#dc2626; font-size:0.85rem;">⚠️ ទិន្នន័យនឹងត្រូវបានលុបចោលជារៀងរហូត</span>
          </p>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="deleteModal.show=false">បោះបង់</button>
            <button class="btn btn-danger" @click="doDelete">🗑️ លុបពិតប្រាកដ</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ========== HISTORY MODAL ========== -->
    <transition name="modal-anim">
      <div v-if="historyModal.show" class="modal-mask" @click.self="historyModal.show=false">
        <div class="modal-box" style="max-width:580px">
          <div class="modal-header">
            <div>
              <div class="modal-title" style="margin-bottom:0">📜 ប្រវត្តិការបង់ប្រាក់</div>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">{{ historyModal.tenant }}</div>
            </div>
            <button class="modal-close-btn" @click="historyModal.show=false">✕</button>
          </div>
          <div v-if="!historyModal.data.length" class="empty-text" style="padding:30px 0;">📭 មិនមានប្រវត្តិ</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ថ្ងៃបង់</th>
                  <th>ចំនួនខែ</th>
                  <th>ចំនួនទឹកប្រាក់</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(h, i) in historyModal.data" :key="h.id">
                  <td>{{ i + 1 }}</td>
                  <td>{{ formatDate(h.paid_date) }}</td>
                  <td>{{ h.months_paid }} ខែ</td>
                  <td style="color:#16a34a; font-weight:700">{{ formatCurrency(h.amount_paid) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="historyModal.show=false">បិទ</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast-anim">
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

// // ===== TEST MODE =====
// const testMode = ref({ active: false, offset: 0, countdown: 10, timer: null, tick: null })

// async function startTest() {
//   if (testMode.value.active) return
//   testMode.value = { active: true, offset: 0, countdown: 10, timer: null, tick: null }

//   // Countdown រៀងរាល់ 1s
//   testMode.value.tick = setInterval(() => {
//     testMode.value.countdown--
//     if (testMode.value.countdown <= 0) testMode.value.countdown = 10
//   }, 1000)

//   // រៀងរាល់ 10s → +1 ខែ → fetch
//   testMode.value.timer = setInterval(async () => {
//     testMode.value.offset++
//     await fetch('/api/test/set-offset', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ months: testMode.value.offset })
//     })
//     await store.fetchAll()
//   }, 10000)
// }

async function stopTest() {
  clearInterval(testMode.value.timer)
  clearInterval(testMode.value.tick)
  testMode.value = { active: false, offset: 0, countdown: 10, timer: null, tick: null }
  // Reset backend offset
  await fetch('/api/test/set-offset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ months: 0 })
  })
  await store.fetchAll()
}
// =====================

// ✅ FIX: Use a safe computed alias so templates never get undefined
const records = computed(() => store.records ?? [])

// ---- Autocomplete ----
const acDropdown = ref({ show: false, results: [], activeIdx: -1 })

function onNameInput() {
  const q = tenantForm.value.tenant_name.trim().toLowerCase()
  if (!q) { acDropdown.value.show = false; return }
  // ✅ FIX: use safe records computed
  acDropdown.value.results = records.value
    .filter(r => r.tenant_name.toLowerCase().includes(q) || r.phone.includes(q))
    .slice(0, 6)
  acDropdown.value.show = acDropdown.value.results.length > 0
  acDropdown.value.activeIdx = -1
}

function onNameKeydown(e) {
  const { results, activeIdx } = acDropdown.value
  if (!acDropdown.value.show) return
  if (e.key === 'ArrowDown') { e.preventDefault(); acDropdown.value.activeIdx = Math.min(activeIdx + 1, results.length - 1) }
  if (e.key === 'ArrowUp')   { e.preventDefault(); acDropdown.value.activeIdx = Math.max(activeIdx - 1, 0) }
  if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); fillFromTenant(results[activeIdx]) }
  if (e.key === 'Escape') acDropdown.value.show = false
}

function hideAcDropdown() {
  setTimeout(() => { acDropdown.value.show = false }, 150)
}

function fillFromTenant(t) {
  tenantForm.value = {
    tenant_name: t.tenant_name,
    phone: t.phone,
    room_number: t.room_number,
    room_price: parseFloat(t.room_price),
    // checkin_date: t.checkin_date?.split('T')[0] || t.checkin_date,
    // notes: t.notes || ''
  }
  acDropdown.value.show = false
  showToast('បំពេញព័ត៌មានដោយស្វ័យប្រវត្តិ ✓')
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : name[0].toUpperCase()
}

// ---- Tenant Modal ----
const defaultForm = () => ({
  tenant_name: '',
  phone: '',
  room_number: '',
  room_price: 100,
  checkin_date: '',
  notes: ''
})

const tenantModal = ref({ show: false, isEdit: false, editId: null, loading: false, error: '' })
const tenantForm = ref(defaultForm())

// Calculate preview status from form
const previewStatus = computed(() => {
  if (!tenantForm.value.checkin_date) return { overdueMonths: 0, currentMonthDue: 1, totalMonths: 1 }
  const checkin = new Date(tenantForm.value.checkin_date)
  const now = new Date()
  const dueDay = checkin.getDate()

  let lastDue = new Date(now.getFullYear(), now.getMonth(), dueDay)
  if (lastDue > now) lastDue = new Date(now.getFullYear(), now.getMonth() - 1, dueDay)

  let overdueMonths = 0
  const cursor = new Date(checkin.getFullYear(), checkin.getMonth(), dueDay)
  cursor.setMonth(cursor.getMonth() + 1)
  while (cursor <= lastDue) { overdueMonths++; cursor.setMonth(cursor.getMonth() + 1) }

  return { overdueMonths, currentMonthDue: 1, totalMonths: overdueMonths + 1 }
})

function openAddModal() {
  tenantForm.value = defaultForm()
  acDropdown.value.show = false
  tenantModal.value = { show: true, isEdit: false, editId: null, loading: false, error: '' }
}

function openEditModal(r) {
  tenantForm.value = {
    tenant_name: r.tenant_name,
    phone: r.phone,
    room_number: r.room_number,
    room_price: parseFloat(r.room_price),
    checkin_date: r.checkin_date?.split('T')[0] || r.checkin_date,
    notes: r.notes || ''
  }
  acDropdown.value.show = false
  tenantModal.value = { show: true, isEdit: true, editId: r.id, loading: false, error: '' }
}

function closeTenantModal() {
  tenantModal.value.show = false
  acDropdown.value.show = false
}

async function submitTenant() {
  tenantModal.value.error = ''
  tenantModal.value.loading = true
  try {
    if (tenantModal.value.isEdit) {
      const res = await store.updateRecord(tenantModal.value.editId, tenantForm.value)
      showToast(res.message || 'បានកែប្រែដោយជោគជ័យ')
    } else {
      const res = await store.createRecord(tenantForm.value)
      showToast(res.message || 'បានបន្ថែមដោយជោគជ័យ')
    }
    closeTenantModal()
  } catch (e) {
    tenantModal.value.error = e.response?.data?.message || 'មានបញ្ហា សូមព្យាយាមម្តងទៀត'
  } finally {
    tenantModal.value.loading = false
  }
}

// ---- Pay Modal ----
const payModal = ref({ show: false, record: null, monthsToPay: 1, loading: false, error: '' })

function openPayModal(r) {
  payModal.value = { show: true, record: r, monthsToPay: r.unpaid_months, loading: false, error: '' }
}

async function submitPay() {
  payModal.value.error = ''
  payModal.value.loading = true
  try {
    const res = await store.updateStatus(payModal.value.record.id, 'paid', payModal.value.monthsToPay)
    payModal.value.show = false
    showToast(res.message)
  } catch (e) {
    payModal.value.error = e.response?.data?.message || 'មានបញ្ហា'
  } finally {
    payModal.value.loading = false
  }
}

// ---- Table helpers ----
// ✅ FIX: All computed properties use safe records alias
const filtered = computed(() => {
  let list = records.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      r.tenant_name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.room_number.toLowerCase().includes(q)
    )
  }
  if (filterStatus.value === 'unpaid') list = list.filter(r => r.unpaid_months > 0)
  if (filterStatus.value === 'paid') list = list.filter(r => r.unpaid_months === 0)
  return list
})

// ✅ FIX: Use safe records computed alias — no more .length on undefined
const unpaidCount = computed(() => records.value.filter(r => r.unpaid_months > 0).length)
const totalDue = computed(() => records.value.reduce((s, r) => s + (r.total_due || 0), 0))

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`
}
function formatCurrency(v) {
  return '$' + parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function showToast(msg, type = 'success') {
  toast.value = { show: true, type, msg }
  setTimeout(() => toast.value.show = false, 3500)
}

async function sendInvoice(r) {
  try {
    const res = await store.sendInvoice(r.id)
    showToast(res.message)
  } catch (e) {
    showToast(e.response?.data?.message || 'មិនអាចផ្ញើបាន', 'error')
  }
}

async function sendAll() {
  try {
    const res = await store.sendAllUnpaid()
    showToast(res.message)
  } catch (e) {
    showToast('មិនអាចផ្ញើសរុបបាន', 'error')
  }
}

function confirmDelete(r) {
  deleteModal.value = { show: true, record: r }
}
async function doDelete() {
  try {
    const res = await store.deleteRecord(deleteModal.value.record.id)
    deleteModal.value.show = false
    showToast(res.message)
  } catch (e) {
    showToast('មិនអាចលុបបាន', 'error')
  }
}

async function viewHistory(r) {
  const data = await store.getPaymentHistory(r.id)
  historyModal.value = { show: true, data: data ?? [], tenant: r.tenant_name }
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
/* .test-bar {
  background: #fef3c7; border: 1.5px solid #f59e0b;
  border-radius: 8px; padding: 8px 14px;
  margin-bottom: 10px; font-size: 0.88rem;
  color: #92400e; display: flex; align-items: center; gap: 10px;
} */

.controls-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: space-between; }
.action-btns { display: flex; gap: 4px; flex-wrap: wrap; }
.loading-text, .empty-text { text-align: center; padding: 40px; color: #64748b; font-size: 1rem; }

/* Summary cards */
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 600px) { .summary-cards { grid-template-columns: repeat(2, 1fr); } }
.sum-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
.sum-card.sum-unpaid { border-left: 4px solid #dc2626; }
.sum-card.sum-paid   { border-left: 4px solid #16a34a; }
.sum-card.sum-money  { border-left: 4px solid #ea580c; }
.sum-label { font-size: 0.78rem; color: #64748b; margin-bottom: 4px; }
.sum-value { font-size: 1.3rem; font-weight: 700; color: #1e293b; }

/* Row highlight */
tr.row-unpaid { background: #fff9f9; }

/* Due day badge */
.due-day-badge { background: #e0f2fe; color: #0369a1; border-radius: 20px; padding: 2px 8px; font-size: 0.8rem; font-weight: 600; }

/* Badge current month */
.badge-current { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; padding: 2px 8px; border-radius: 20px; font-size: 0.8rem; }

/* Due info box */
.due-info-box {
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
  padding: 8px 14px; margin: 4px 0 12px; font-size: 0.88rem; color: #1d4ed8;
}

/* Autocomplete */
.ac-dropdown {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0; z-index: 999;
  background: white; border: 1px solid #e2e8f0; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); max-height: 240px; overflow-y: auto;
}
.ac-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer;
  border-bottom: 1px solid #f1f5f9; transition: background 0.1s;
}
.ac-item:last-child { border-bottom: none; }
.ac-item:hover, .ac-active { background: #f8faff; }
.ac-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #dbeafe; color: #1e40af;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}
.ac-info { flex: 1; min-width: 0; }
.ac-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.ac-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
.ac-badge { font-size: 11px; background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; }

/* Modal */
.modal-large { max-width: 680px; }
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
.modal-close-btn { background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; color: #64748b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-close-btn:hover { background: #fee2e2; color: #dc2626; }
.modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }

/* Form grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

/* Preview box */
.preview-box { background: linear-gradient(135deg, #f0f4f8, #e8f0fe); border-radius: 10px; padding: 14px 18px; margin: 12px 0 4px; border: 1.5px solid #c7d7f0; }
.preview-title { font-size: 0.82rem; font-weight: 700; color: #1a3a5c; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.preview-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 0.88rem; border-bottom: 1px dashed #c7d7f0; color: #475569; }
.preview-row:last-child { border-bottom: none; }
.preview-row.total { padding-top: 10px; margin-top: 4px; font-size: 0.92rem; color: #1e293b; font-weight: 600; }

/* Pay breakdown */
.pay-breakdown { background: #f8fafc; border-radius: 10px; padding: 12px 16px; border: 1px solid #e2e8f0; }
.pay-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.9rem; color: #475569; border-bottom: 1px dashed #e2e8f0; }
.pay-row:last-child { border-bottom: none; }
.pay-total { font-weight: 700; font-size: 0.95rem; color: #1e293b; padding-top: 10px; margin-top: 4px; }
.text-red { color: #dc2626; }
.text-orange { color: #ea580c; }

.form-error { color: #dc2626; font-size: 0.88rem; margin-top: 12px; background: #fee2e2; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #dc2626; }

/* Animations */
.modal-anim-enter-active { animation: modalIn 0.25s ease; }
.modal-anim-leave-active { animation: modalIn 0.2s ease reverse; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.3s ease; }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translateY(20px); }
</style>