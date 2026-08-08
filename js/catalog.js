/* =========================================================
   COMPIA Editora — catálogo (index.html)
   ========================================================= */

function productThumb(product){
  return `
    <div class="product-thumb">
      <span class="badge ${product.format === 'ebook' ? 'badge-teal' : ''}">${formatLabel(product.format)}</span>
      <img src="images/${product.image}" alt="Capa do livro ${product.title}"
           onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'placeholder', innerText:'images/${product.image}'}))">
    </div>`;
}

function formatLabel(format){
  return { fisico: "Físico", ebook: "E-book", kit: "Kit" }[format] || format;
}

function renderCategoryFilters(){
  const products = DB.getProducts();
  const categories = [...new Set(products.map(p => p.category))].sort();
  const container = document.getElementById("category-filters");
  container.innerHTML = categories.map(cat => `
    <label><input type="checkbox" value="${cat}" class="category-filter"> ${cat}</label>
  `).join("");
}

function getFilteredProducts(){
  const products = DB.getProducts();
  const search = document.getElementById("search-input").value.trim().toLowerCase();
  const selectedCategories = [...document.querySelectorAll(".category-filter:checked")].map(el => el.value);
  const selectedFormats = [...document.querySelectorAll(".format-filter:checked")].map(el => el.value);
  const sort = document.getElementById("sort-select").value;

  let result = products.filter(p => {
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search) ||
      p.tags.some(t => t.toLowerCase().includes(search)) ||
      p.category.toLowerCase().includes(search);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(p.format);
    return matchesSearch && matchesCategory && matchesFormat;
  });

  if(sort === "menor-preco") result.sort((a,b) => a.price - b.price);
  else if(sort === "maior-preco") result.sort((a,b) => b.price - a.price);
  else if(sort === "nome") result.sort((a,b) => a.title.localeCompare(b.title));

  return result;
}

function renderProductGrid(){
  const grid = document.getElementById("product-grid");
  const products = getFilteredProducts();
  document.getElementById("result-count").textContent =
    `${products.length} produto${products.length === 1 ? "" : "s"} encontrado${products.length === 1 ? "" : "s"}`;

  if(products.length === 0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Nenhum produto encontrado para os filtros selecionados.</div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <article class="product-card">
      ${productThumb(p)}
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-title"><a href="produto.html?id=${p.id}">${p.title}</a></h3>
        <span class="product-price">${formatBRL(p.price)}</span>
        <span class="product-stock">${p.format === 'ebook' ? 'Disponível para download' : (p.stock > 0 ? p.stock + ' em estoque' : 'Fora de estoque')}</span>
        <div class="product-actions">
          <a href="produto.html?id=${p.id}" class="btn btn-outline btn-sm">Ver produto</a>
          <button class="btn btn-primary btn-sm" onclick="Cart.add('${p.id}',1)" ${p.format!=='ebook' && p.stock<=0 ? 'disabled' : ''}>Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryFilters();
  renderProductGrid();

  document.getElementById("search-input").addEventListener("input", renderProductGrid);
  document.getElementById("sort-select").addEventListener("change", renderProductGrid);
  document.getElementById("category-filters").addEventListener("change", renderProductGrid);
  document.querySelectorAll(".format-filter").forEach(el => el.addEventListener("change", renderProductGrid));
  document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    document.querySelectorAll(".category-filter, .format-filter").forEach(el => el.checked = false);
    document.getElementById("sort-select").value = "relevancia";
    renderProductGrid();
  });
});
