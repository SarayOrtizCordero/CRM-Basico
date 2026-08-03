const STORAGE_KEY = 'crm_basico_contacts';

const STATUSES = [
  { key: 'nuevo', label: 'Nuevo', color: '#64748b' },
  { key: 'contactado', label: 'Contactado', color: '#2563eb' },
  { key: 'propuesta', label: 'Propuesta', color: '#d97706' },
  { key: 'ganado', label: 'Ganado', color: '#16a34a' },
  { key: 'perdido', label: 'Perdido', color: '#dc2626' },
];

function statusInfo(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function seedContacts() {
  const now = Date.now();
  return [
    { id: uid(), name: 'Marta Gil', company: 'Textiles Rioja', email: 'marta.gil@textilesrioja.es', phone: '+34 611 223 344', status: 'nuevo', notes: 'Llegó desde el formulario web.', createdAt: now - 86400000 * 1 },
    { id: uid(), name: 'Javier Prats', company: 'Ferretería Prats', email: 'javier@ferreteriaprats.com', phone: '+34 622 334 455', status: 'nuevo', notes: '', createdAt: now - 86400000 * 2 },
    { id: uid(), name: 'Ana Belén Ruiz', company: 'Moda Levante S.L.', email: 'ab.ruiz@modalevante.es', phone: '+34 633 445 566', status: 'contactado', notes: 'Llamada agendada para el jueves.', createdAt: now - 86400000 * 4 },
    { id: uid(), name: 'Carlos Fuentes', company: 'Distribuciones Norte', email: 'carlos.fuentes@distnorte.com', phone: '+34 644 556 677', status: 'contactado', notes: '', createdAt: now - 86400000 * 5 },
    { id: uid(), name: 'Lucía Herrero', company: 'Grupo Herrero', email: 'lucia@grupoherrero.es', phone: '+34 655 667 788', status: 'propuesta', notes: 'Propuesta enviada, pendiente de respuesta.', createdAt: now - 86400000 * 7 },
    { id: uid(), name: 'Pedro Salas', company: 'Salas Hostelería', email: 'pedro.salas@salashosteleria.com', phone: '+34 666 778 899', status: 'propuesta', notes: '', createdAt: now - 86400000 * 8 },
    { id: uid(), name: 'Elena Campos', company: 'Campos & Asociados', email: 'elena.campos@camposasociados.es', phone: '+34 677 889 900', status: 'ganado', notes: 'Contrato firmado.', createdAt: now - 86400000 * 12 },
    { id: uid(), name: 'David Montes', company: 'Montes Logística', email: 'david@monteslogistica.com', phone: '+34 688 990 011', status: 'perdido', notes: 'Optó por otro proveedor.', createdAt: now - 86400000 * 15 },
  ];
}

function loadContacts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedContacts();
    saveContacts(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const seeded = seedContacts();
    saveContacts(seeded);
    return seeded;
  }
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}
