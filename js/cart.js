/* =========================================================
   COMPIA Editora — carrinho de compras (compartilhado)
   ========================================================= */

const Cart = {
  items(){ return DB.getCart(); },

  add(productId, qty = 1){
    const product = DB.getProduct(productId);
    if(!product) return;
    const cart = DB.getCart();
    const existing = cart.find(i => i.productId === productId);
    const maxQty = product.format === "ebook" ? 99 : product.stock;
    if(existing){
      existing.qty = Math.min(existing.qty + qty, maxQty || 99);
    }else{
      cart.push({ productId, qty: Math.min(qty, maxQty || 99) });
    }
    DB.setCart(cart);
    this.refreshCount();
    showToast(`"${product.title}" adicionado ao carrinho.`);
  },

  updateQty(productId, qty){
    const cart = DB.getCart();
    const item = cart.find(i => i.productId === productId);
    if(!item) return;
    if(qty <= 0){
      this.remove(productId);
      return;
    }
    item.qty = qty;
    DB.setCart(cart);
    this.refreshCount();
  },

  remove(productId){
    const cart = DB.getCart().filter(i => i.productId !== productId);
    DB.setCart(cart);
    this.refreshCount();
  },

  clear(){ DB.setCart([]); this.refreshCount(); },

  detailedItems(){
    return this.items().map(i => {
      const product = DB.getProduct(i.productId);
      return product ? { ...i, product } : null;
    }).filter(Boolean);
  },

  subtotal(){
    return this.detailedItems().reduce((sum, i) => sum + i.product.price * i.qty, 0);
  },

  hasPhysicalItems(){
    return this.detailedItems().some(i => i.product.format !== "ebook");
  },

  totalWeight(){
    return this.detailedItems().reduce((sum, i) => sum + (i.product.weightKg || 0) * i.qty, 0);
  },

  count(){
    return this.items().reduce((sum, i) => sum + i.qty, 0);
  },

  refreshCount(){
    const el = document.getElementById("cart-count");
    if(el) el.textContent = this.count();
  }
};

function showToast(message){
  let toast = document.getElementById("toast");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function formatBRL(value){
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

document.addEventListener("DOMContentLoaded", () => Cart.refreshCount());
