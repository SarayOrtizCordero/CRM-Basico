let contacts = loadContacts();
let currentView = 'kanban';
let searchTerm = '';
let statusFilter = '';
let editingId = null;
let draggedId = null;

const els = {
  statsGrid: document.getElementById('stats-grid'),
  search: document.getElementById('search-input'),
  filterStatus: document.getElementById('filter-status'),
  viewToggleBtns: document.querySelectorAll('.view-toggle button'),
  kanbanBoard: document.getElementById('kanban-board'),
  tableWrap: document.getElementById('table-wrap'),
  tableBody: document.getElementById('contacts-table-body'),
  openAddBtn: document.getElementById('open-add-contact'),
  modal: document.getElementById('contact-modal'),
  modalTitle: document.getElementById('contact-modal-title'),
  form: document.getElementById('contact-form'),
  fName: document.getElementById('contact-name'),
  fCompany: document.getElementById('contact-company'),
  fEmail: document.getElementById('contact-email'),
  fPhone: document.getElementById('contact-phone'),
  fStatus: document.getElementById('contact-status'),
  fNotes: document.getElementById('contact-notes'),
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function getFilteredContacts() {
  const term = searchTerm.trim().toLowerCase();
  return contacts.filter((c) => {
    const matchesTerm = !term || c.name.toLowerCase().includes(term) || c.company.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesTerm && matchesStatus;
  });
}

function renderStats() {
  const total = contacts.length;
  const cards = [`
    <div class="stat-card total">
      <span class="stat-value">${total}</span>
      <span class="stat-label">Total contactos</span>
    </div>
  `];
  STATUSES.forEach((s) => {
    const count = contacts.filter((c) => c.status === s.key).length;
    cards.push(`
      <div class="stat-card">
        <span class="stat-value">${count}</span>
        <span class="stat-label"><span class="stat-dot" style="background:${s.color}"></span>${s.label}</span>
      </div>
    `);
  });
  els.statsGrid.innerHTML = cards.join('');
}

function renderKanban() {
  const filtered = getFilteredContacts();
  els.kanbanBoard.innerHTML = STATUSES.map((s) => {
    const items = filtered.filter((c) => c.status === s.key);
    const cardsHtml = items.length
      ? items.map((c) => `
        <div class="kanban-card" draggable="true" data-id="${c.id}">
          <h4>${escapeHtml(c.name)}</h4>
          <p class="card-company">${escapeHtml(c.company || 'Sin empresa')}</p>
          <div class="card-meta">${escapeHtml(c.email || 'Sin email')}</div>
        </div>
      `).join('')
      : '<p class="kanban-empty">Sin contactos</p>';

    return `
      <div class="kanban-column" data-status="${s.key}">
        <div class="kanban-column-header" style="border-color:${s.color}">
          <span class="kanban-column-title">${s.label}</span>
          <span class="count-badge">${items.length}</span>
        </div>
        <div class="kanban-cards" data-status="${s.key}">${cardsHtml}</div>
      </div>
    `;
  }).join('');

  attachKanbanEvents();
}

function attachKanbanEvents() {
  els.kanbanBoard.querySelectorAll('.kanban-card').forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedId = card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedId = null;
    });
    card.addEventListener('click', () => openEditModal(card.dataset.id));
  });

  els.kanbanBoard.querySelectorAll('.kanban-column').forEach((col) => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (!draggedId) return;
      const newStatus = col.dataset.status;
      const contact = contacts.find((c) => c.id === draggedId);
      if (contact && contact.status !== newStatus) {
        contact.status = newStatus;
        saveContacts(contacts);
        renderAll();
      }
    });
  });
}

function renderTable() {
  const filtered = getFilteredContacts();
  if (!filtered.length) {
    els.tableBody.innerHTML = `<tr><td colspan="6" class="empty-text">No hay contactos que coincidan con la búsqueda.</td></tr>`;
    return;
  }
  els.tableBody.innerHTML = filtered.map((c) => {
    const s = statusInfo(c.status);
    return `
      <tr>
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${escapeHtml(c.company || '—')}</td>
        <td class="cell-muted">${escapeHtml(c.email || '—')}</td>
        <td class="cell-muted">${escapeHtml(c.phone || '—')}</td>
        <td><span class="status-badge" style="background:${s.color}22;color:${s.color}"><span class="stat-dot" style="background:${s.color}"></span>${s.label}</span></td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-edit="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn danger" title="Eliminar" data-delete="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  els.tableBody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.edit));
  });
  els.tableBody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteContact(btn.dataset.delete));
  });
}

function renderAll() {
  renderStats();
  if (currentView === 'kanban') {
    els.kanbanBoard.classList.remove('hidden');
    els.tableWrap.classList.add('hidden');
    renderKanban();
  } else {
    els.kanbanBoard.classList.add('hidden');
    els.tableWrap.classList.remove('hidden');
    renderTable();
  }
}

function deleteContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  if (!confirm(`¿Eliminar a ${contact.name}?`)) return;
  contacts = contacts.filter((c) => c.id !== id);
  saveContacts(contacts);
  renderAll();
}

function openAddModal() {
  editingId = null;
  els.modalTitle.textContent = 'Nuevo contacto';
  els.form.reset();
  els.fStatus.value = 'nuevo';
  els.modal.classList.remove('hidden');
  els.fName.focus();
}

function openEditModal(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  editingId = id;
  els.modalTitle.textContent = 'Editar contacto';
  els.fName.value = contact.name;
  els.fCompany.value = contact.company || '';
  els.fEmail.value = contact.email || '';
  els.fPhone.value = contact.phone || '';
  els.fStatus.value = contact.status;
  els.fNotes.value = contact.notes || '';
  els.modal.classList.remove('hidden');
  els.fName.focus();
}

function closeModal() {
  els.modal.classList.add('hidden');
  editingId = null;
}

function handleFormSubmit(e) {
  e.preventDefault();
  const data = {
    name: els.fName.value.trim(),
    company: els.fCompany.value.trim(),
    email: els.fEmail.value.trim(),
    phone: els.fPhone.value.trim(),
    status: els.fStatus.value,
    notes: els.fNotes.value.trim(),
  };
  if (!data.name) return;

  if (editingId) {
    const contact = contacts.find((c) => c.id === editingId);
    Object.assign(contact, data);
  } else {
    contacts.push({ id: uid(), ...data, createdAt: Date.now() });
  }
  saveContacts(contacts);
  closeModal();
  renderAll();
}

function init() {
  els.search.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderAll();
  });

  els.filterStatus.addEventListener('change', (e) => {
    statusFilter = e.target.value;
    renderAll();
  });

  els.viewToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      els.viewToggleBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderAll();
    });
  });

  els.openAddBtn.addEventListener('click', openAddModal);
  els.form.addEventListener('submit', handleFormSubmit);

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.classList.contains('hidden')) closeModal();
  });

  renderAll();
}

init();
