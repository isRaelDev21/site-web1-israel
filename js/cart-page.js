/* =========================================================
   COMPIA Editora — página do carrinho (carrinho.html)
   O cálculo de frete é uma SIMULAÇÃO baseada em peso e CEP,
   apenas para fins de demonstração. Em produção, substitua
   por uma integração real com Correios/transportadora.
   ========================================================= */

function renderCartPage(){
  const items = Cart.detailedItems();
  const container = document.getElementById("cart-items");

  if(items.length === 0){
    container.innerHTML = `
      <div class="empty-state">
        Seu carrinho está vazio. <a href="index.html" style="text-decoration:underline;">Ver catálogo</a>.
      </div>`;
    document.getElementById("checkout-btn").classList.add("btn-disabled-link");
    document.getElementById("checkout-btn").addEventListener("click", e => e.preventDefault());
  } else {
    container.innerHTML = items.map(i => `
      <div class="cart-item">
        <div class="product-thumb">
          <img src="images/${i.product.image}" alt="Capa do livro ${i.product.title}"
               onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'placeholder', innerText:'sem imagem'}))">
        </div>
        <div>
          <h4>${i.product.title}</h4>
          <span class="item-cat">${formatLabel(i.product.format)} · ${i.product.category}</span>
          <div class="qty-control" style="margin-top:8px;">
            <button type="button" onclick="changeQty('${i.productId}',-1)">&minus;</button>
            <input type="number" value="${i.qty}" min="1" onchange="setQty('${i.productId}', this.value)">
            <button type="button" onclick="changeQty('${i.productId}',1)">+</button>
          </div>
          <button class="remove-item" onclick="removeItem('${i.productId}')">Remover</button>
        </div>
        <div class="item-price">${formatBRL(i.product.price * i.qty)}</div>
      </div>
    `).join("");
  }

  updateSummary();

  if(!Cart.hasPhysicalItems()){
    document.getElementById("shipping-box").innerHTML =
      `<div class="alert alert-info">Seu pedido contém apenas e-books — não há frete a calcular. O download fica disponível após a confirmação do pagamento.</div>`;
    sessionStorage.setItem("compia_shipping", JSON.stringify({ method: "digital", cost: 0, label: "Entrega digital" }));
  }
}

function changeQty(productId, delta){
  const item = Cart.items().find(i => i.productId === productId);
  if(!item) return;
  setQty(productId, item.qty + delta);
}

function setQty(productId, qty){
  Cart.updateQty(productId, parseInt(qty, 10) || 0);
  renderCartPage();
}

function removeItem(productId){
  Cart.remove(productId);
  renderCartPage();
}

function updateSummary(){
  const subtotal = Cart.subtotal();
  document.getElementById("sum-subtotal").textContent = formatBRL(subtotal);
  const shipping = JSON.parse(sessionStorage.getItem("compia_shipping") || "null");
  if(shipping){
    document.getElementById("sum-shipping").textContent = shipping.cost > 0 ? formatBRL(shipping.cost) : "Grátis";
    document.getElementById("sum-total").textContent = formatBRL(subtotal + shipping.cost);
  } else {
    document.getElementById("sum-shipping").textContent = "a calcular";
    document.getElementById("sum-total").textContent = formatBRL(subtotal);
  }
}

function estimateShipping(cep, weight){
  // Simulação determinística: usa os dígitos do CEP para variar o custo/prazo,
  // sem depender de nenhuma API externa.
  const digits = cep.replace(/\D/g, "");
  const seed = digits ? parseInt(digits.slice(0,5), 10) : 10000;
  const regionFactor = 1 + (seed % 9) / 10; // 1.0 - 1.8
  const baseCorreios = 14.9 + weight * 6.5;
  const baseTransportadora = 21.9 + weight * 4.2;
  return {
    correios: { cost: Math.round(baseCorreios * regionFactor * 100) / 100, prazo: 5 + (seed % 6) },
    transportadora: { cost: Math.round(baseTransportadora * regionFactor * 100) / 100, prazo: 3 + (seed % 4) }
  };
}

function renderShippingOptions(){
  const cep = document.getElementById("cep-input").value.trim();
  if(cep.replace(/\D/g,"").length < 8){
    showToast("Digite um CEP válido (8 dígitos).");
    return;
  }
  const weight = Math.max(Cart.totalWeight(), 0.3);
  const est = estimateShipping(cep, weight);
  const optionsEl = document.getElementById("shipping-options");

  const options = [
    { key: "correios", label: "Correios (PAC/SEDEX)", cost: est.correios.cost, note: `chega em até ${est.correios.prazo} dias úteis` },
    { key: "transportadora", label: "Transportadora", cost: est.transportadora.cost, note: `chega em até ${est.transportadora.prazo} dias úteis` },
    { key: "retirada", label: "Retirar no local", cost: 0, note: "grátis — retire na editora" }
  ];

  optionsEl.innerHTML = options.map((o,idx) => `
    <div class="shipping-option ${idx===0 ? 'selected':''}" data-key="${o.key}" data-cost="${o.cost}" data-label="${o.label}" onclick="selectShipping(this)">
      <span>${o.label}<br><small style="color:var(--ink-soft)">${o.note}</small></span>
      <strong>${o.cost > 0 ? formatBRL(o.cost) : 'Grátis'}</strong>
    </div>
  `).join("");

  selectShipping(optionsEl.querySelector(".shipping-option"));
}

function selectShipping(el){
  document.querySelectorAll(".shipping-option").forEach(o => o.classList.remove("selected"));
  el.classList.add("selected");
  const shipping = { method: el.dataset.key, cost: parseFloat(el.dataset.cost), label: el.dataset.label };
  sessionStorage.setItem("compia_shipping", JSON.stringify(shipping));
  updateSummary();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  document.getElementById("calc-shipping-btn").addEventListener("click", renderShippingOptions);
});
