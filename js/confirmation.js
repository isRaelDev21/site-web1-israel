/* =========================================================
   COMPIA Editora — confirmação de pedido (pedido-confirmado.html)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const order = DB.getOrders().find(o => o.id === id);
  const box = document.getElementById("order-summary");

  if(!order){
    box.innerHTML = `<p>Não encontramos os detalhes deste pedido.</p>`;
    return;
  }

  const ebooks = order.items.filter(i => i.format === "ebook" || i.format === "kit");
  const hasPhysical = order.items.some(i => i.format !== "ebook");

  let html = `
    <p><strong>Número do pedido:</strong> ${order.id}</p>
    <p><strong>Total pago:</strong> ${formatBRL(order.total)} via ${order.paymentMethod === 'pix' ? 'PIX' : 'Cartão de crédito'}</p>
    <p><strong>Entrega:</strong> ${order.shipping.label}${hasPhysical ? '' : ' (produtos digitais)'}</p>
    <div class="spine-divider"><div class="ticks"></div><h2 style="font-size:1rem;">Itens do pedido</h2><div class="ticks"></div></div>
  `;

  order.items.forEach(i => {
    html += `<div class="order-row"><span>${i.qty}x ${i.title}</span><span>${formatBRL(i.price * i.qty)}</span></div>`;
  });

  if(ebooks.length > 0){
    html += `
      <div class="spine-divider"><div class="ticks"></div><h2 style="font-size:1rem;">Downloads disponíveis</h2><div class="ticks"></div></div>
    `;
    ebooks.forEach(i => {
      html += `<div class="download-link"><span>${i.title}</span>
        <button class="btn btn-outline btn-sm" onclick="showToast('Download simulado: em produção, aqui entra o link real do arquivo protegido do e-book.')">Baixar</button>
      </div>`;
    });
  }

  box.innerHTML = html;
});
