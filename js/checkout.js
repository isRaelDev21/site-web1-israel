/* =========================================================
   COMPIA Editora — checkout (checkout.html)
   Pagamento por cartão e PIX são SIMULADOS no navegador para
   fins de demonstração. Para produção, integre um gateway real
   (PagSeguro, Mercado Pago, Stripe etc.), conforme a especificação.
   ========================================================= */

let selectedPaymentMethod = "cartao";
let pixCode = "";

function renderCheckoutSummary(){
  const items = Cart.detailedItems();
  if(items.length === 0){
    window.location.href = "carrinho.html";
    return;
  }
  document.getElementById("checkout-items").innerHTML = items.map(i => `
    <div class="summary-row"><span>${i.qty}x ${i.product.title}</span><span>${formatBRL(i.product.price * i.qty)}</span></div>
  `).join("");

  const subtotal = Cart.subtotal();
  const shipping = JSON.parse(sessionStorage.getItem("compia_shipping") || "null") || { cost: 0, label: "a definir" };
  document.getElementById("co-subtotal").textContent = formatBRL(subtotal);
  document.getElementById("co-shipping").textContent = shipping.cost > 0 ? formatBRL(shipping.cost) : "Grátis";
  document.getElementById("co-total").textContent = formatBRL(subtotal + shipping.cost);

  if(!Cart.hasPhysicalItems()){
    document.getElementById("address-section").style.display = "none";
  }
}

function selectPayment(el){
  document.querySelectorAll(".payment-method").forEach(m => m.classList.remove("selected"));
  el.classList.add("selected");
  selectedPaymentMethod = el.dataset.method;
  document.getElementById("panel-cartao").classList.toggle("active", selectedPaymentMethod === "cartao");
  document.getElementById("panel-pix").classList.toggle("active", selectedPaymentMethod === "pix");
  if(selectedPaymentMethod === "pix" && !pixCode) generatePix();
}

function generatePix(){
  const total = Cart.subtotal() + (JSON.parse(sessionStorage.getItem("compia_shipping") || "null")?.cost || 0);
  const randomId = Math.random().toString(36).slice(2, 10).toUpperCase();
  pixCode = `00020126580014BR.GOV.BCB.PIX0136compia-${randomId}5204000053039865406${total.toFixed(2)}5802BR5913COMPIA EDITORA6009SAO PAULO62070503***6304${randomId.slice(0,4)}`;
  document.getElementById("pix-code-text").textContent = pixCode;
  drawFakeQRCode(document.getElementById("pix-qrcode"), pixCode);
}

function drawFakeQRCode(container, seedText){
  container.innerHTML = "";
  const size = 180, cells = 21;
  const cellSize = size / cells;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = "#1C1B1F";

  // seed determinístico a partir do texto, para o padrão parecer estável
  let seed = 0;
  for(let i=0;i<seedText.length;i++) seed = (seed * 31 + seedText.charCodeAt(i)) % 100000;
  function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  for(let y=0;y<cells;y++){
    for(let x=0;x<cells;x++){
      const inFinder =
        (x < 7 && y < 7) || (x >= cells-7 && y < 7) || (x < 7 && y >= cells-7);
      if(inFinder) continue;
      if(rand() > 0.55) ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
    }
  }
  // três "olhos" de localização do QR
  [[0,0],[cells-7,0],[0,cells-7]].forEach(([fx,fy]) => {
    ctx.fillStyle = "#1C1B1F";
    ctx.fillRect(fx*cellSize, fy*cellSize, 7*cellSize, 7*cellSize);
    ctx.fillStyle = "#fff";
    ctx.fillRect((fx+1)*cellSize, (fy+1)*cellSize, 5*cellSize, 5*cellSize);
    ctx.fillStyle = "#1C1B1F";
    ctx.fillRect((fx+2)*cellSize, (fy+2)*cellSize, 3*cellSize, 3*cellSize);
  });
}

function copyPixCode(){
  if(!pixCode) return;
  navigator.clipboard?.writeText(pixCode).then(() => showToast("Código PIX copiado!"))
    .catch(() => showToast("Não foi possível copiar automaticamente. Selecione o texto manualmente."));
}

function generateOrderId(){
  const n = Math.floor(Math.random() * 90000) + 10000;
  return "COMPIA-" + new Date().getFullYear() + "-" + n;
}

function handleCheckoutSubmit(e){
  e.preventDefault();
  const items = Cart.detailedItems();
  if(items.length === 0) return;

  const hasPhysical = Cart.hasPhysicalItems();
  const customer = {
    nome: document.getElementById("cf-nome").value.trim(),
    email: document.getElementById("cf-email").value.trim(),
    cpf: document.getElementById("cf-cpf").value.trim()
  };

  if(!customer.nome || !customer.email){
    showToast("Preencha nome e e-mail para continuar.");
    return;
  }

  let shipping = { method: "digital", cost: 0, label: "Entrega digital" };
  if(hasPhysical){
    const method = document.getElementById("cf-shipping-method").value;
    const stored = JSON.parse(sessionStorage.getItem("compia_shipping") || "null");
    const label = { correios: "Correios (PAC/SEDEX)", transportadora: "Transportadora", retirada: "Retirar no local" }[method];
    shipping = { method, cost: method === "retirada" ? 0 : (stored?.cost || 25), label };

    const endereco = document.getElementById("cf-endereco").value.trim();
    const cidade = document.getElementById("cf-cidade").value.trim();
    const cep = document.getElementById("cf-cep").value.trim();
    if(method !== "retirada" && (!endereco || !cidade || !cep)){
      showToast("Preencha o endereço completo para entrega.");
      return;
    }
    customer.endereco = endereco; customer.cidade = cidade; customer.cep = cep;
  }

  if(selectedPaymentMethod === "pix" && !pixCode) generatePix();

  DB.findOrCreateCustomer(customer);

  const order = {
    id: generateOrderId(),
    date: new Date().toISOString(),
    customer,
    items: items.map(i => ({ productId: i.productId, title: i.product.title, qty: i.qty, price: i.product.price, format: i.product.format })),
    shipping,
    paymentMethod: selectedPaymentMethod,
    subtotal: Cart.subtotal(),
    total: Cart.subtotal() + shipping.cost,
    status: selectedPaymentMethod === "pix" ? "pago" : "pago"
  };

  // baixa simples de estoque (apenas físicos/kits)
  const products = DB.getProducts();
  order.items.forEach(oi => {
    const p = products.find(pp => pp.id === oi.productId);
    if(p && p.format !== "ebook") p.stock = Math.max(0, p.stock - oi.qty);
  });
  DB._set(DB.KEYS.products, products);

  DB.saveOrder(order);
  Cart.clear();
  sessionStorage.removeItem("compia_shipping");
  DB.setCustomerSession({ email: customer.email, nome: customer.nome });

  window.location.href = `pedido-confirmado.html?id=${order.id}`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
  document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
});
