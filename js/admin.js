/* =========================================================
   COMPIA Editora — painel administrativo (admin.html)
   Login e controle de perfil são uma SIMULAÇÃO no navegador
   para fins de demonstração — não é autenticação segura.
   Em produção, use autenticação de verdade no backend
   (ex.: perfis de usuário do WordPress/WooCommerce).
   ========================================================= */

const ADMIN_ACCOUNTS = {
  "admin@compia.com.br": { senha: "admin123", role: "admin", label: "Administrador" },
  "editor@compia.com.br": { senha: "editor123", role: "editor", label: "Editor" },
  "vendedor@compia.com.br": { senha: "vendedor123", role: "vendedor", label: "Vendedor" }
};

// tabs visíveis por perfil
const ROLE_TABS = {
  admin: ["dashboard", "produtos", "pedidos", "clientes", "logs"],
  editor: ["dashboard", "produtos", "logs"],
  vendedor: ["dashboard", "pedidos", "clientes"]
};

function currentSession(){ return DB.getAdminSession(); }

function tryLogin(email, senha){
  const account = ADMIN_ACCOUNTS[email.toLowerCase()];
  if(!account || account.senha !== senha) return null;
  return { email, role: account.role, label: account.label };
}

function applyRoleVisibility(role){
  const allowed = ROLE_TABS[role] || [];
  document.querySelectorAll(".admin-sidebar button[data-panel]").forEach(btn => {
    btn.style.display = allowed.includes(btn.dataset.panel) ? "" : "none";
  });
  // garante que o painel ativo seja um permitido
  const activeBtn = document.querySelector(".admin-sidebar button.active");
  if(!activeBtn || !allowed.includes(activeBtn.dataset.panel)){
    switchPanel(allowed[0] || "dashboard");
  }
}

function switchPanel(panel){
  document.querySelectorAll(".admin-sidebar button[data-panel]").forEach(b => b.classList.toggle("active", b.dataset.panel === panel));
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + panel));
  if(panel === "dashboard") renderDashboard();
  if(panel === "produtos") renderProductsTable();
  if(panel === "pedidos") renderOrdersTable();
  if(panel === "clientes") renderCustomersTable();
  if(panel === "logs") renderLogs();
}

function enterShell(session){
  document.getElementById("admin-login-screen").style.display = "none";
  document.getElementById("admin-shell").style.display = "grid";
  document.getElementById("admin-role-badge").textContent = `${session.email} · ${ADMIN_ACCOUNTS[session.email]?.label || session.role}`;
  applyRoleVisibility(session.role);
  switchPanel(document.querySelector(".admin-sidebar button.active")?.dataset.panel || "dashboard");
  DB.log(`Login no painel: ${session.email} (${session.role})`);
}

/* ---------------- DASHBOARD ---------------- */
function renderDashboard(){
  const orders = DB.getOrders();
  const products = DB.getProducts();
  const customers = DB.getCustomers();
  const totalVendas = orders.reduce((sum, o) => sum + o.total, 0);

  document.getElementById("stat-vendas").textContent = formatBRLShort(totalVendas);
  document.getElementById("stat-pedidos").textContent = orders.length;
  document.getElementById("stat-produtos").textContent = products.length;
  document.getElementById("stat-clientes").textContent = customers.length;

  document.getElementById("dashboard-recent-orders").innerHTML = orders.slice(0,6).map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer.nome}</td>
      <td>${formatBRLShort(o.total)}</td>
      <td><span class="status-pill ${o.status}">${o.status}</span></td>
    </tr>
  `).join("") || `<tr><td colspan="4" style="color:var(--ink-soft)">Nenhum pedido ainda.</td></tr>`;
}

function formatBRLShort(v){ return v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }

/* ---------------- PRODUTOS ---------------- */
function renderProductsTable(){
  const products = DB.getProducts();
  document.getElementById("expected-images-hint").textContent =
    `Lembrete: as imagens devem ser colocadas na pasta /images com o nome exato de arquivo cadastrado.`;
  document.getElementById("products-table-body").innerHTML = products.map(p => `
    <tr>
      <td><span style="font-family:var(--font-mono); font-size:.72rem; color:var(--ink-soft)">${p.image}</span></td>
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${formatLabelAdmin(p.format)}</td>
      <td>${formatBRLShort(p.price)}</td>
      <td>${p.format === 'ebook' ? '—' : p.stock}</td>
      <td class="table-actions">
        <button onclick="openProductModal('${p.id}')">Editar</button>
        <button onclick="confirmDeleteProduct('${p.id}')">Excluir</button>
      </td>
    </tr>
  `).join("");
}
function formatLabelAdmin(format){ return { fisico:"Físico", ebook:"E-book", kit:"Kit" }[format] || format; }

function openProductModal(id){
  const modal = document.getElementById("product-modal");
  const product = id ? DB.getProduct(id) : null;
  document.getElementById("product-modal-title").textContent = product ? "Editar produto" : "Novo produto";
  document.getElementById("pf-id").value = product ? product.id : "";
  document.getElementById("pf-title").value = product ? product.title : "";
  document.getElementById("pf-category").value = product ? product.category : "";
  document.getElementById("pf-format").value = product ? product.format : "fisico";
  document.getElementById("pf-price").value = product ? product.price : "";
  document.getElementById("pf-stock").value = product ? product.stock : 10;
  document.getElementById("pf-tags").value = product ? product.tags.join(", ") : "";
  document.getElementById("pf-image").value = product ? product.image : "";
  document.getElementById("pf-description").value = product ? product.description : "";
  modal.classList.add("open");
}

function closeProductModal(){ document.getElementById("product-modal").classList.remove("open"); }

function confirmDeleteProduct(id){
  const product = DB.getProduct(id);
  if(confirm(`Excluir o produto "${product.title}"? Esta ação não pode ser desfeita.`)){
    DB.deleteProduct(id);
    renderProductsTable();
  }
}

function handleProductFormSubmit(e){
  e.preventDefault();
  const id = document.getElementById("pf-id").value || DB.nextProductId();
  const format = document.getElementById("pf-format").value;
  const product = {
    id,
    title: document.getElementById("pf-title").value.trim(),
    category: document.getElementById("pf-category").value.trim(),
    format,
    price: parseFloat(document.getElementById("pf-price").value) || 0,
    stock: format === "ebook" ? 999 : (parseInt(document.getElementById("pf-stock").value, 10) || 0),
    weightKg: DB.getProduct(id)?.weightKg ?? (format === "ebook" ? 0 : 0.5),
    tags: document.getElementById("pf-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    image: document.getElementById("pf-image").value.trim(),
    description: document.getElementById("pf-description").value.trim()
  };
  DB.saveProduct(product);
  closeProductModal();
  renderProductsTable();
}

/* ---------------- PEDIDOS ---------------- */
function renderOrdersTable(){
  const orders = DB.getOrders();
  document.getElementById("orders-table-body").innerHTML = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${new Date(o.date).toLocaleDateString("pt-BR")}</td>
      <td>${o.customer.nome}<br><small style="color:var(--ink-soft)">${o.customer.email}</small></td>
      <td>${o.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</td>
      <td>${o.shipping.label}</td>
      <td>${formatBRLShort(o.total)}</td>
      <td>
        <select onchange="changeOrderStatus('${o.id}', this.value)">
          ${["pago","enviado","entregue","pendente"].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join("")}
        </select>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" style="color:var(--ink-soft)">Nenhum pedido registrado ainda.</td></tr>`;
}

function changeOrderStatus(id, status){
  DB.updateOrderStatus(id, status);
  renderOrdersTable();
}

/* ---------------- CLIENTES ---------------- */
function renderCustomersTable(){
  const customers = DB.getCustomers();
  document.getElementById("customers-table-body").innerHTML = customers.map(c => `
    <tr>
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${DB.ordersByEmail(c.email).length}</td>
    </tr>
  `).join("") || `<tr><td colspan="3" style="color:var(--ink-soft)">Nenhuma cliente cadastrada ainda.</td></tr>`;
}

/* ---------------- LOGS ---------------- */
function renderLogs(){
  const logs = DB.getLogs();
  document.getElementById("logs-list").innerHTML = logs.map(l => `
    <div>[${new Date(l.ts).toLocaleString("pt-BR")}] ${l.message}</div>
  `).join("") || `<div>Nenhuma atividade registrada ainda.</div>`;
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const session = currentSession();
  if(session) enterShell(session);

  document.getElementById("admin-login-form").addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("admin-email").value.trim();
    const senha = document.getElementById("admin-senha").value;
    const session = tryLogin(email, senha);
    if(!session){
      document.getElementById("admin-login-error").style.display = "block";
      return;
    }
    document.getElementById("admin-login-error").style.display = "none";
    DB.setAdminSession(session);
    enterShell(session);
  });

  document.getElementById("admin-logout").addEventListener("click", () => {
    DB.log(`Logout no painel: ${currentSession()?.email || ""}`);
    DB.clearAdminSession();
    location.reload();
  });

  document.querySelectorAll(".admin-sidebar button[data-panel]").forEach(btn => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
  });

  document.getElementById("new-product-btn").addEventListener("click", () => openProductModal(null));
  document.getElementById("close-product-modal").addEventListener("click", closeProductModal);
  document.getElementById("product-form").addEventListener("submit", handleProductFormSubmit);
  document.getElementById("product-modal").addEventListener("click", e => {
    if(e.target.id === "product-modal") closeProductModal();
  });
});
