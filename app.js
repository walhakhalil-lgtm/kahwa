const KEY = 'kahwa-state-v1';

const initialState = {
  menu: [
    { id: 1, name: 'Espresso', price: 2.0 },
    { id: 2, name: 'Cappuccino', price: 3.2 },
    { id: 3, name: 'Thé à la menthe', price: 2.5 },
    { id: 4, name: 'Croissant', price: 1.8 }
  ],
  tables: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`,
    status: 'free'
  })),
  orders: [],
  cash: { isOpen: false, openedAt: null, closedAt: null },
  orderSeq: 1
};

function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    saveState(initialState);
    return structuredClone(initialState);
  }
  return JSON.parse(raw);
}

function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function update(mutator) {
  const state = loadState();
  mutator(state);
  saveState(state);
  return state;
}

function tableStatusFromOrder(orderStatus) {
  if (['new', 'preparing'].includes(orderStatus)) return 'ordered';
  if (orderStatus === 'served') return 'served';
  return 'free';
}

function ensureTable(state, tableId) {
  return state.tables.find(t => t.id === Number(tableId));
}

function createOrder({ tableId, lines, source = 'server' }) {
  return update(state => {
    if (!state.cash.isOpen) throw new Error('La caisse est fermée.');
    const table = ensureTable(state, tableId);
    if (!table) throw new Error('Table introuvable');
    const expanded = lines.map(line => {
      const item = state.menu.find(m => m.id === Number(line.itemId));
      return {
        itemId: item.id,
        name: item.name,
        qty: Number(line.qty),
        price: item.price,
        total: item.price * Number(line.qty)
      };
    });
    const total = expanded.reduce((sum, l) => sum + l.total, 0);
    state.orders.push({
      id: state.orderSeq++,
      tableId: table.id,
      status: 'new',
      source,
      createdAt: new Date().toISOString(),
      paidAt: null,
      lines: expanded,
      total
    });
    table.status = 'ordered';
  });
}

function updateOrderStatus(orderId, status) {
  return update(state => {
    const order = state.orders.find(o => o.id === Number(orderId));
    if (!order) return;
    order.status = status;
    if (status === 'paid') order.paidAt = new Date().toISOString();

    const table = ensureTable(state, order.tableId);
    const active = state.orders
      .filter(o => o.tableId === order.tableId && o.status !== 'paid')
      .sort((a, b) => b.id - a.id)[0];

    table.status = active ? tableStatusFromOrder(active.status) : 'free';
  });
}

function openCash() {
  return update(state => {
    state.cash = { isOpen: true, openedAt: new Date().toISOString(), closedAt: null };
  });
}

function closeCash() {
  return update(state => {
    state.cash = { ...state.cash, isOpen: false, closedAt: new Date().toISOString() };
  });
}

function addTable(name) {
  return update(state => {
    const id = Math.max(0, ...state.tables.map(t => t.id)) + 1;
    state.tables.push({ id, name, status: 'free' });
  });
}

function addMenuItem(name, price) {
  return update(state => {
    const id = Math.max(0, ...state.menu.map(m => m.id)) + 1;
    state.menu.push({ id, name, price: Number(price) });
  });
}

function setMenuPrice(id, price) {
  return update(state => {
    const item = state.menu.find(m => m.id === Number(id));
    if (item) item.price = Number(price);
  });
}

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
}

window.Kahwa = {
  loadState,
  createOrder,
  updateOrderStatus,
  openCash,
  closeCash,
  addTable,
  addMenuItem,
  setMenuPrice,
  fmt
};
