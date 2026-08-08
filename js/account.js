/* =========================================================
   COMPIA Editora — área do cliente (conta.html)
   Identificação simples por e-mail (demonstração). Em produção,
   utilize autenticação real com senha/hash no backend.
   ========================================================= */

function statusLabel(status){
  return { pago: "Pago", enviado: "Enviado", pendente: "Pendente", entregue: "Entregue" }[status] || status;
}

function renderOrders(email){
  const orders = DB.ordersByEmail(email);
  const list = document.getElementById("orders-list");
  if(orders.length === 0){
    list.innerHTML = `<div class="empty-state">Você ainda não tem pedidos. <a href="index.html" style="text-decoration:underline;">Ver catálogo</a>.</div>`;
    return;
  }
  list.innerHTML = orders.map(o => `
    <div class="order-row">
      <span>
        <strong>${o.id}</strong><br>
        <small style="color:var(--ink-soft)">${new Date(o.date).toLocaleDateString("pt-BR")} · ${o.items.length} item(ns)</small>
      </span>
      <span class="status-pill ${o.status}">${statusLabel(o.status)}</span>
      <span>${formatBRL(o.total)}</span>
    </div>
  `).join("");
}

function showLoggedIn(session){
  document.getElementById("account-guest").style.display = "none";
  document.getElementById("account-logged").style.display = "grid";
  document.getElementById("welcome-name").textContent = session.nome;
  document.getElementById("welcome-email").textContent = session.email;
  renderOrders(session.email);
}

document.addEventListener("DOMContentLoaded", () => {
  const session = DB.getCustomerSession();
  if(session) showLoggedIn(session);

  document.getElementById("login-form").addEventListener("submit", e => {
    e.preventDefault();
    const nome = document.getElementById("login-nome").value.trim();
    const email = document.getElementById("login-email").value.trim();
    if(!nome || !email) return;
    DB.findOrCreateCustomer({ nome, email });
    const newSession = { nome, email };
    DB.setCustomerSession(newSession);
    showLoggedIn(newSession);
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    DB.clearCustomerSession();
    location.reload();
  });
});
