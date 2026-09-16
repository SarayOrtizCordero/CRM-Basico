const STORAGE_KEY = 'crm_basico_contacts';

const STATUSES = [
  { key: 'nuevo', label: 'Nuevo contacto', color: '#8a7565' },
  { key: 'recibida', label: 'Consulta recibida', color: '#a9754a' },
  { key: 'contactado', label: 'Contactado', color: '#b64211' },
  { key: 'interesado', label: 'Interesado', color: '#df3314' },
  { key: 'turno', label: 'Turno reservado', color: '#eda100' },
  { key: 'atendido', label: 'Atendido', color: '#3f6b28' },
  { key: 'seguimiento', label: 'Seguimiento', color: '#6b8a52' },
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
    { id: uid(), name: 'Marta Gil', service: 'Limpieza dental', source: 'whatsapp', email: 'marta.gil@email.com', phone: '+34 611 223 344', status: 'nuevo', notes: 'Escribió por WhatsApp preguntando por la limpieza dental.', createdAt: now - 86400000 * 1 },
    { id: uid(), name: 'Javier Prats', service: 'Revisión general', source: 'telefono', email: 'javier.prats@email.com', phone: '+34 622 334 455', status: 'nuevo', notes: '', createdAt: now - 86400000 * 2 },
    { id: uid(), name: 'Ana Belén Ruiz', service: 'Ortodoncia invisible', source: 'instagram', email: 'ab.ruiz@email.com', phone: '+34 633 445 566', status: 'contactado', notes: 'Llamada agendada para el jueves.', createdAt: now - 86400000 * 4 },
    { id: uid(), name: 'Carlos Fuentes', service: 'Consulta general', source: 'formulario', email: 'carlos.fuentes@email.com', phone: '+34 644 556 677', status: 'contactado', notes: '', createdAt: now - 86400000 * 5 },
    { id: uid(), name: 'Lucía Herrero', service: 'Sesión de fisioterapia', source: 'web', email: 'lucia.herrero@email.com', phone: '+34 655 667 788', status: 'interesado', notes: 'Presupuesto de fisioterapia enviado, pendiente de respuesta.', createdAt: now - 86400000 * 7 },
    { id: uid(), name: 'Pedro Salas', service: 'Peeling facial', source: 'instagram', email: 'pedro.salas@email.com', phone: '+34 666 778 899', status: 'interesado', notes: '', createdAt: now - 86400000 * 8 },
    { id: uid(), name: 'Elena Campos', service: 'Sesión de botox', source: 'whatsapp', email: 'elena.campos@email.com', phone: '+34 677 889 900', status: 'atendido', notes: 'Sesión realizada, muy satisfecha.', createdAt: now - 86400000 * 12 },
    { id: uid(), name: 'David Montes', service: 'Blanqueamiento dental', source: 'whatsapp', email: 'david.montes@email.com', phone: '+34 688 990 011', status: 'seguimiento', notes: 'No respondió tras el primer contacto; en seguimiento.', createdAt: now - 86400000 * 15 },
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
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((c) => !STATUSES.some((s) => s.key === c.status))) {
      throw new Error('shape');
    }
    return parsed;
  } catch {
    const seeded = seedContacts();
    saveContacts(seeded);
    return seeded;
  }
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}
