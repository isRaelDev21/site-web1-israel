/* =========================================================
   COMPIA Editora — página de produto (produto.html)
   ========================================================= */

function getQueryParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function distributionNote(product){
  if(product.format === "ebook"){
    return "Este é um <strong>e-book</strong>. Após a confirmação do pagamento, o link de download fica disponível imediatamente na página de confirmação do pedido e na sua área do cliente.";
  }
  if(product.format === "kit"){
    return "Este <strong>kit</strong> contém itens físicos (e possivelmente e-books). Os itens físicos são enviados pelos Correios/transportadora ou podem ser retirados no local; e-books ficam disponíveis para download na sua conta.";
  }
  return "Este é um <strong>livro físico</strong>. Escolha entre envio pelos Correios/transportadora ou retirada no local na etapa de checkout.";
}

function renderProduct(){
  const id = getQueryParam("id");
  const product = DB.getProduct(id);
  const container = document.getElementById("product-container");

  if(!product){
    container.innerHTML = `<div class="empty-state" style="margin:60px 0;">Produto não encontrado. <a href="index.html">Voltar ao catálogo</a>.</div>`;
    return;
  }

  document.title = `${product.title} — COMPIA Editora`;
  document.getElementById("page-title").textContent = `${product.title} — COMPIA Editora`;

  container.innerHTML = `
    <div class="breadcrumb" style="margin-top:24px;">
      <a href="index.html">Catálogo</a> / <a href="index.html">${product.category}</a> / ${product.title}
    </div>
    <div class="product-detail">
      <div class="pd-gallery">
        <div class="product-thumb">
          <span class="badge ${product.format === 'ebook' ? 'badge-teal' : ''}">${formatLabel(product.format)}</span>
          <img src="images/${product.image}" alt="Capa do livro ${product.title}"
               onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'placeholder', innerText:'images/${product.image}'}))">
        </div>
      </div>
      <div class="pd-info">
        <span class="product-cat">${product.category}</span>
        <h1>${product.title}</h1>
        <p>${product.description}</p>
        <div class="pd-meta">
          ${product.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
        </div>
        <div class="pd-price">${formatBRL(product.price)}</div>
        <p class="product-stock">${product.format === 'ebook' ? 'Download imediato após a compra' : (product.stock > 0 ? product.stock + ' unidades em estoque' : 'Fora de estoque no momento')}</p>

        <div class="qty-row">
          <div class="qty-control">
            <button type="button" onclick="stepQty(-1)">&minus;</button>
            <input type="number" id="qty-input" value="1" min="1" max="${product.format==='ebook' ? 99 : Math.max(product.stock,1)}">
            <button type="button" onclick="stepQty(1)">+</button>
          </div>
          <button class="btn btn-primary" id="add-to-cart-btn" ${product.format!=='ebook' && product.stock<=0 ? 'disabled' : ''}>
            Adicionar ao carrinho
          </button>
        </div>

        <div class="pd-distribution">${distributionNote(product)}</div>
      </div>
    </div>
  `;

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    const qty = parseInt(document.getElementById("qty-input").value, 10) || 1;
    Cart.add(product.id, qty);
  });
}

function stepQty(delta){
  const input = document.getElementById("qty-input");
  const min = parseInt(input.min, 10) || 1;
  const max = parseInt(input.max, 10) || 99;
  let value = (parseInt(input.value, 10) || 1) + delta;
  value = Math.max(min, Math.min(max, value));
  input.value = value;
}

document.addEventListener("DOMContentLoaded", renderProduct);
