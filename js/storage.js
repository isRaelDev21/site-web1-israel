/* =========================================================
   COMPIA Editora — camada de dados (localStorage)
   Funciona como um "banco de dados" simples no navegador.
   Em produção, substitua estas funções por chamadas a uma
   API real (ex.: WordPress/WooCommerce, conforme sugerido
   na especificação do projeto).
   ========================================================= */

const DB = {
  KEYS: {
    products: "compia_products",
    orders: "compia_orders",
    customers: "compia_customers",
    logs: "compia_logs",
    cart: "compia_cart",
    adminSession: "compia_admin_session",
    customerSession: "compia_customer_session"
  },

  init(){
    if(!localStorage.getItem(this.KEYS.products)){
      localStorage.setItem(this.KEYS.products, JSON.stringify(COMPIA_SEED_PRODUCTS));
    }
    if(!localStorage.getItem(this.KEYS.orders)){
      localStorage.setItem(this.KEYS.orders, JSON.stringify([]));
    }
    if(!localStorage.getItem(this.KEYS.customers)){
      localStorage.setItem(this.KEYS.customers, JSON.stringify([]));
    }
    if(!localStorage.getItem(this.KEYS.logs)){
      localStorage.setItem(this.KEYS.logs, JSON.stringify([]));
    }
    if(!localStorage.getItem(this.KEYS.cart)){
      localStorage.setItem(this.KEYS.cart, JSON.stringify([]));
    }
  },

  // ---------- generic helpers ----------
  _get(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } },
  _set(key, value){ localStorage.setItem(key, JSON.stringify(value)); },

  // ---------- products ----------
  getProducts(){ return this._get(this.KEYS.products); },
  getProduct(id){ return this.getProducts().find(p => p.id === id); },
  saveProduct(product){
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if(idx >= 0){ products[idx] = product; this.log(`Produto atualizado: ${product.title}`); }
    else{ products.push(product); this.log(`Produto criado: ${product.title}`); }
    this._set(this.KEYS.products, products);
  },
  deleteProduct(id){
    const product = this.getProduct(id);
    const products = this.getProducts().filter(p => p.id !== id);
    this._set(this.KEYS.products, products);
    if(product) this.log(`Produto removido: ${product.title}`);
  },
  nextProductId(){
    const products = this.getProducts();
    let n = products.length + 1;
    let id = "p" + String(n).padStart(2, "0");
    while(products.some(p => p.id === id)){ n++; id = "p" + String(n).padStart(2, "0"); }
    return id;
  },

  // ---------- cart ----------
  getCart(){ return this._get(this.KEYS.cart); },
  setCart(cart){ this._set(this.KEYS.cart, cart); },

  // ---------- orders ----------
  getOrders(){ return this._get(this.KEYS.orders); },
  saveOrder(order){
    const orders = this.getOrders();
    orders.unshift(order);
    this._set(this.KEYS.orders, orders);
    this.log(`Novo pedido registrado: ${order.id} (${order.paymentMethod})`);
  },
  updateOrderStatus(id, status){
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if(idx >= 0){
      orders[idx].status = status;
      this._set(this.KEYS.orders, orders);
      this.log(`Pedido ${id} atualizado para status "${status}"`);
    }
  },
  ordersByEmail(email){
    return this.getOrders().filter(o => o.customer.email.toLowerCase() === email.toLowerCase());
  },

  // ---------- customers ----------
  getCustomers(){ return this._get(this.KEYS.customers); },
  findOrCreateCustomer(data){
    const customers = this.getCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === data.email.toLowerCase());
    if(!customer){
      customer = { id: "c" + (customers.length + 1), ...data };
      customers.push(customer);
      this._set(this.KEYS.customers, customers);
      this.log(`Nova cliente cadastrada: ${data.email}`);
    }
    return customer;
  },

  // ---------- logs (registro de atividade) ----------
  log(message){
    const logs = this._get(this.KEYS.logs);
    logs.unshift({ ts: new Date().toISOString(), message });
    this._set(this.KEYS.logs, logs.slice(0, 200));
  },
  getLogs(){ return this._get(this.KEYS.logs); },

  // ---------- sessions (demonstração — não é autenticação segura) ----------
  setAdminSession(session){ sessionStorage.setItem(this.KEYS.adminSession, JSON.stringify(session)); },
  getAdminSession(){ try{ return JSON.parse(sessionStorage.getItem(this.KEYS.adminSession)); }catch(e){ return null; } },
  clearAdminSession(){ sessionStorage.removeItem(this.KEYS.adminSession); },

  setCustomerSession(session){ localStorage.setItem(this.KEYS.customerSession, JSON.stringify(session)); },
  getCustomerSession(){ try{ return JSON.parse(localStorage.getItem(this.KEYS.customerSession)); }catch(e){ return null; } },
  clearCustomerSession(){ localStorage.removeItem(this.KEYS.customerSession); }
};

DB.init();
