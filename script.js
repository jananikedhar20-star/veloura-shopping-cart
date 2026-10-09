/* Veloura — vanilla JavaScript shopping cart */
"use strict";

const CONFIG = {
  currency: "INR",
  locale: "en-IN",
  taxRate: 0.05,               // Demo estimate: 5%
  freeShippingThreshold: 1999,  // INR
  shippingFee: 40,
  storageKeys: {
    cart: "veloura_cart_v1",
    wishlist: "veloura_wishlist_v1",
    theme: "veloura_theme_v1",
    orders: "veloura_orders_v1",
    recentlyViewed: "veloura_recent_v1"
  }
};

let PRODUCTS = [
  {id:"p1",name:"Everyday Tote",category:"Fashion",price:1499,oldPrice:1899,rating:4.8,reviews:124,badge:"BESTSELLER",isNew:false,stock:8,image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=82",description:"A roomy, easy-going tote for your everyday essentials.",tags:["bag","handbag","tote","fashion","accessory"]},
  {id:"p2",name:"Glow Serum",category:"Beauty",price:799,oldPrice:999,rating:4.7,reviews:89,badge:"GLOW FAVOURITE",isNew:true,stock:12,image:"https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=700&q=82",description:"A lightweight serum for a fresh, dewy-looking routine.",tags:["skincare","serum","beauty","glow"]},
  {id:"p3",name:"Cloud Knit Cardigan",category:"Fashion",price:1799,oldPrice:2199,rating:4.9,reviews:76,badge:"SO SOFT",isNew:true,stock:6,image:"https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=82",description:"A soft layering piece for slow mornings and cool evenings.",tags:["clothing","knit","cardigan","fashion","sweater"]},
  {id:"p4",name:"Petal Stud Earrings",category:"Fashion",price:549,oldPrice:699,rating:4.6,reviews:51,badge:"LITTLE LUXURY",isNew:false,stock:20,image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=82",description:"Delicate floral-inspired studs with a subtle shimmer.",tags:["jewellery","jewelry","earrings","accessory"]},
  {id:"p5",name:"Sunday Scent Candle",category:"Lifestyle",price:699,oldPrice:849,rating:4.8,reviews:103,badge:"COZY PICK",isNew:false,stock:15,image:"https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=82",description:"A gentle, warm scent to make your space feel like home.",tags:["candle","home","decor","lifestyle","fragrance"]},
  {id:"p6",name:"Rosewater Lip Tint",category:"Beauty",price:399,oldPrice:499,rating:4.5,reviews:68,badge:"UNDER ₹500",isNew:false,stock:25,image:"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=82",description:"A sheer rosy tint for a fresh, effortless finish.",tags:["lipstick","lip tint","makeup","beauty","cosmetics"]},
  {id:"p7",name:"Everyday Headphones",category:"Tech",price:2299,oldPrice:2799,rating:4.7,reviews:91,badge:"TOP RATED",isNew:true,stock:7,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=82",description:"Comfort-first headphones for playlists, podcasts and focus.",tags:["headphones","audio","tech","gadgets","electronics"]},
  {id:"p8",name:"Desk Day Planner",category:"Lifestyle",price:449,oldPrice:599,rating:4.6,reviews:44,badge:"FRESH START",isNew:false,stock:30,image:"https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=700&q=82",description:"A simple paper companion for your plans and little goals.",tags:["planner","stationery","notebook","desk","lifestyle"]},
  {id:"p9",name:"Sculpted Water Bottle",category:"Lifestyle",price:599,oldPrice:749,rating:4.4,reviews:38,badge:"DAILY ESSENTIAL",isNew:true,stock:18,image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=82",description:"A reusable bottle that looks lovely on your desk or in your bag.",tags:["bottle","water","lifestyle","fitness"]},
  {id:"p10",name:"Mini Crossbody",category:"Fashion",price:1199,oldPrice:1499,rating:4.7,reviews:62,badge:"ON THE GO",isNew:false,stock:9,image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=82",description:"A compact crossbody for the days you want to travel light.",tags:["bag","crossbody","handbag","fashion"]},
  {id:"p11",name:"Daily Moisture Cream",category:"Beauty",price:649,oldPrice:799,rating:4.6,reviews:57,badge:"SKINCARE PICK",isNew:false,stock:14,image:"https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=700&q=82",description:"A comforting daily moisturiser for a soft, hydrated feel.",tags:["cream","moisturiser","moisturizer","skincare","beauty"]},
  {id:"p12",name:"Pocket Bluetooth Speaker",category:"Tech",price:1599,oldPrice:1999,rating:4.5,reviews:47,badge:"GOOD VIBES",isNew:true,stock:10,image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=82",description:"Bring your favourite sounds along for the ride.",tags:["speaker","bluetooth","audio","tech","gadgets"]}
];

let COUPONS = {
  VELVET10: {type:"percent",value:10,minSubtotal:500,label:"10% off"},
  WELCOME150: {type:"fixed",value:150,minSubtotal:1000,label:"₹150 off"},
  LOVELY15: {type:"percent",value:15,minSubtotal:2500,label:"15% off"}
};

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const money = amount => new Intl.NumberFormat(CONFIG.locale,{style:"currency",currency:CONFIG.currency,maximumFractionDigits:0}).format(Math.round(amount));
const safeRead = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
const safeWrite = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { showToast("Your browser could not save this change.", "error"); return false; }
};
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

// Manager-created products and coupon codes are shared between these demo pages via localStorage.
const managerProducts = safeRead("veloura_manager_products_v1", []);
if (Array.isArray(managerProducts)) PRODUCTS = [...PRODUCTS, ...managerProducts.filter(item => item && item.id && !PRODUCTS.some(existing => existing.id === item.id))];
Object.assign(COUPONS, safeRead("veloura_manager_coupons_v1", {}));

let cart = safeRead(CONFIG.storageKeys.cart, {});
let wishlist = safeRead(CONFIG.storageKeys.wishlist, []);
let recentlyViewed = safeRead(CONFIG.storageKeys.recentlyViewed, []);
let orders = safeRead(CONFIG.storageKeys.orders, []);
let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let wishlistOnly = false;
let appliedCoupon = null;
let currentCouponCode = "";
let lastFocusedElement = null;

function normaliseCart() {
  const valid = {};
  if (cart && typeof cart === "object" && !Array.isArray(cart)) {
    for (const [id, quantity] of Object.entries(cart)) {
      const product = PRODUCTS.find(item => item.id === id);
      if (product && Number.isInteger(quantity) && quantity > 0) valid[id] = Math.min(quantity, product.stock);
    }
  }
  cart = valid;
}
normaliseCart();
wishlist = Array.isArray(wishlist) ? wishlist.filter(id => PRODUCTS.some(p => p.id === id)) : [];
recentlyViewed = Array.isArray(recentlyViewed) ? recentlyViewed.filter(id => PRODUCTS.some(p => p.id === id)) : [];
orders = Array.isArray(orders) ? orders : [];

function saveCart() { safeWrite(CONFIG.storageKeys.cart, cart); }
function saveWishlist() { safeWrite(CONFIG.storageKeys.wishlist, wishlist); }
function productById(id) { return PRODUCTS.find(product => product.id === id); }
function cartQuantity() { return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0); }
function cartSubtotal() { return Object.entries(cart).reduce((sum,[id,quantity]) => sum + (productById(id)?.price || 0)*quantity,0); }
function cartLineCount() { return Object.keys(cart).length; }
function discountAmount(subtotal=cartSubtotal()) {
  if (!appliedCoupon || !COUPONS[appliedCoupon]) return 0;
  const coupon = COUPONS[appliedCoupon];
  if (subtotal < coupon.minSubtotal) return 0;
  const amount = coupon.type === "percent" ? subtotal*coupon.value/100 : coupon.value;
  return Math.min(subtotal, amount);
}
function pricing() {
  const subtotal = cartSubtotal();
  const discount = discountAmount(subtotal);
  const discountedSubtotal = Math.max(0, subtotal-discount);
  const tax = Math.round(discountedSubtotal*CONFIG.taxRate);
  const shipping = subtotal === 0 || subtotal >= CONFIG.freeShippingThreshold ? 0 : CONFIG.shippingFee;
  return {subtotal,discount,tax,shipping,total:discountedSubtotal+tax+shipping};
}
function showToast(message, type="success") {
  const region = $("#toastRegion");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}
function persistRecentlyViewed(id) {
  recentlyViewed = [id,...recentlyViewed.filter(item=>item!==id)].slice(0,6);
  safeWrite(CONFIG.storageKeys.recentlyViewed,recentlyViewed);
}
function updateHeaderCounts() {
  $("#cartCount").textContent = cartQuantity();
  $("#wishlistCount").textContent = wishlist.length;
  $("#drawerItemCount").textContent = `(${cartQuantity()})`;
}
function productCard(product) {
  const wished = wishlist.includes(product.id);
  const discount = product.oldPrice ? Math.round((1-product.price/product.oldPrice)*100) : 0;
  return `<article class="product-card">
    <div class="product-image-wrap">
      <img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" data-product-image="${product.id}" onerror="this.onerror=null;this.src='https://placehold.co/600x720/eee5f6/6d557f?text=Veloura'">
      <span class="product-badge">${escapeHTML(product.badge || (product.isNew?"JUST ARRIVED":"CURATED PICK"))}</span>
      <button class="heart-button ${wished?"active":""}" data-wishlist="${product.id}" aria-label="${wished?"Remove":"Add"} ${escapeHTML(product.name)} ${wished?"from":"to"} wishlist" aria-pressed="${wished}">${wished?"♥":"♡"}</button>
      <button class="quick-add" data-add="${product.id}">${cart[product.id]?"Add another · "+cart[product.id]+" in bag":"＋ Add to bag"}</button>
    </div>
    <div class="product-info"><span class="product-category">${escapeHTML(product.category)}</span>
      <div class="product-name-row"><h3 class="product-name">${escapeHTML(product.name)}</h3><span class="product-rating">★ ${product.rating.toFixed(1)}</span></div>
      <div class="product-price-row"><span class="product-price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span><span class="save-label">${discount}% off</span></div>
    </div>
  </article>`;
}
function getFilteredProducts() {
  let items = PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = !searchTerm || [product.name,product.category,product.description,...product.tags].join(" ").toLowerCase().includes(searchTerm);
    const matchesWishlist = !wishlistOnly || wishlist.includes(product.id);
    return matchesCategory && matchesSearch && matchesWishlist;
  });
  if (sortMode === "price-low") items.sort((a,b)=>a.price-b.price);
  else if (sortMode === "price-high") items.sort((a,b)=>b.price-a.price);
  else if (sortMode === "rating") items.sort((a,b)=>b.rating-a.rating);
  else if (sortMode === "newest") items.sort((a,b)=>Number(b.isNew)-Number(a.isNew));
  return items;
}
function renderProducts() {
  const items = getFilteredProducts();
  $("#productGrid").innerHTML = items.map(productCard).join("");
  $("#productGrid").classList.toggle("hidden",items.length===0);
  $("#emptyState").classList.toggle("hidden",items.length!==0);
  $("#resultsCount").textContent = wishlistOnly ? `${items.length} saved favourite${items.length===1?"":"s"}` : `Showing ${items.length} of ${PRODUCTS.length} finds`;
  $("#wishlistToggle").classList.toggle("active",wishlistOnly);
}
function recommendationProducts() {
  const viewed = recentlyViewed.map(productById).filter(Boolean);
  const basis = viewed[0] || PRODUCTS.find(product => product.isNew) || PRODUCTS[0];
  const recommended = PRODUCTS.filter(product => product.id !== basis.id && (product.category === basis.category || product.price <= basis.price+700)).slice(0,3);
  return recommended.length ? recommended : PRODUCTS.filter(product=>product.id!==basis.id).slice(0,3);
}
function renderRecommendations() {
  const items = recommendationProducts();
  $("#recommendGrid").innerHTML = items.map(product=>`<article class="recommend-card">
    <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/200x220/eee5f6/6d557f?text=Veloura'">
    <div><span class="product-category">${escapeHTML(product.category)}</span><h3>${escapeHTML(product.name)}</h3><p><span class="recommend-price">${money(product.price)}</span> · ★ ${product.rating.toFixed(1)}</p><button data-add="${product.id}">Add to bag ↗</button></div>
  </article>`).join("");
}
function renderCart() {
  const entries = Object.entries(cart).filter(([id,qty])=>productById(id)&&qty>0);
  $("#cartItems").innerHTML = entries.map(([id,quantity]) => {
    const product = productById(id);
    return `<article class="cart-item">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" onerror="this.onerror=null;this.src='https://placehold.co/200x240/eee5f6/6d557f?text=Veloura'">
      <div><h3>${escapeHTML(product.name)}</h3><div class="item-meta">${escapeHTML(product.category)}</div><div class="item-price">${money(product.price)}</div>
        <div class="quantity-control" aria-label="Quantity for ${escapeHTML(product.name)}"><button data-quantity="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${quantity}</span><button data-quantity="${id}" data-delta="1" aria-label="Increase quantity" ${quantity>=product.stock?"disabled":""}>＋</button></div>
        <button class="remove-item" data-remove="${id}">Remove</button>
      </div><div class="cart-item-right"><span class="item-price">${money(product.price*quantity)}</span></div>
    </article>`;
  }).join("");
  const empty = entries.length===0;
  $("#emptyCart").classList.toggle("hidden",!empty);
  $("#cartBottom").classList.toggle("hidden",empty);
  const subtotal = cartSubtotal();
  const price = pricing();
  $("#subtotalValue").textContent = money(price.subtotal);
  $("#discountValue").textContent = `−${money(price.discount)}`;
  $("#discountLabel").textContent = appliedCoupon ? `(${appliedCoupon})` : "";
  $("#taxValue").textContent = money(price.tax);
  $("#shippingValue").textContent = price.shipping===0 ? (subtotal===0?"—":"FREE") : money(price.shipping);
  $("#totalValue").textContent = money(price.total);
  $("#checkoutButton").disabled = empty;
  const remaining = Math.max(0,CONFIG.freeShippingThreshold-subtotal);
  $("#shippingProgress").style.width = `${Math.min(100,subtotal/CONFIG.freeShippingThreshold*100)}%`;
  $("#shippingMessage").textContent = subtotal===0 ? "A lovely find is just around the corner." : remaining===0 ? "Yay! Your shipping is on us." : "You're getting closer to free shipping!";
  $("#shippingAmount").textContent = subtotal===0 ? `${money(CONFIG.freeShippingThreshold)} to free shipping` : remaining===0 ? "You've unlocked free shipping!" : `Add ${money(remaining)} for free shipping`;
  if (appliedCoupon && subtotal < COUPONS[appliedCoupon].minSubtotal) {
    $("#couponMessage").textContent = `${appliedCoupon} needs a subtotal of ${money(COUPONS[appliedCoupon].minSubtotal)}.`;
    $("#couponMessage").style.color = "#c34568";
  } else if (appliedCoupon) {
    $("#couponMessage").textContent = `${appliedCoupon} applied — ${COUPONS[appliedCoupon].label} saved!`;
    $("#couponMessage").style.color = "var(--green)";
  } else {
    $("#couponMessage").textContent = "Try VELVET10 or WELCOME150";
    $("#couponMessage").style.color = "";
  }
  updateHeaderCounts();
}
function renderAll() { renderProducts(); renderCart(); renderRecommendations(); }
function addToCart(id) {
  const product = productById(id);
  if (!product) return;
  if ((cart[id]||0) >= product.stock) { showToast(`Only ${product.stock} available for ${product.name}.`,"error"); return; }
  cart[id] = (cart[id]||0)+1;
  persistRecentlyViewed(id); saveCart(); renderAll();
  showToast(`${product.name} added to your bag.`);
}
function changeQuantity(id,delta) {
  const product = productById(id);
  if (!product || !cart[id]) return;
  const next = cart[id]+delta;
  if (next<=0) delete cart[id];
  else if (next>product.stock) { showToast(`Only ${product.stock} available.`,"error"); return; }
  else cart[id]=next;
  if (Object.keys(cart).length===0) { appliedCoupon=null; currentCouponCode=""; }
  saveCart(); renderAll();
}
function removeFromCart(id) {
  const product = productById(id);
  delete cart[id];
  if (!Object.keys(cart).length) { appliedCoupon=null; currentCouponCode=""; }
  saveCart(); renderAll();
  showToast(`${product?.name || "Item"} removed from your bag.`);
}
function toggleWishlist(id) {
  const product=productById(id);
  if (!product) return;
  if (wishlist.includes(id)) { wishlist=wishlist.filter(item=>item!==id); showToast("Removed from your favourites."); }
  else { wishlist.push(id); showToast("Saved to your favourites."); }
  saveWishlist(); renderAll();
}
function openCart() {
  lastFocusedElement=document.activeElement;
  $("#overlay").classList.add("visible");
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  $("#closeCart").focus();
}
function closeCart() {
  $("#overlay").classList.remove("visible");
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden","true");
  if (!$(".modal.open")) document.body.style.overflow="";
  if (lastFocusedElement?.focus) lastFocusedElement.focus();
}
function openModal(id) {
  lastFocusedElement=document.activeElement;
  $(id).classList.add("open"); $(id).setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  const firstInput=$("input,button,textarea",$(id));
  if(firstInput) firstInput.focus();
}
function closeModal(id) {
  $(id).classList.remove("open"); $(id).setAttribute("aria-hidden","true");
  if (!$(".modal.open") && !$("#cartDrawer").classList.contains("open")) document.body.style.overflow="";
  if (lastFocusedElement?.focus) lastFocusedElement.focus();
}
function applyCoupon(code) {
  const cleaned=code.trim().toUpperCase();
  if (!cleaned) { showToast("Enter a coupon code first.","error"); return; }
  const coupon=COUPONS[cleaned];
  if (!coupon) { appliedCoupon=null; currentCouponCode=""; $("#couponMessage").textContent="That code isn't recognised. Try VELVET10."; $("#couponMessage").style.color="#c34568"; renderCart(); showToast("Please check that coupon code.","error"); return; }
  if (cartSubtotal() < coupon.minSubtotal) { $("#couponMessage").textContent=`Add items worth ${money(coupon.minSubtotal-cartSubtotal())} more to use ${cleaned}.`; $("#couponMessage").style.color="#c34568"; showToast(`Minimum subtotal for ${cleaned} is ${money(coupon.minSubtotal)}.`,"error"); return; }
  appliedCoupon=cleaned; currentCouponCode=cleaned; $("#couponInput").value=cleaned; renderCart(); showToast(`${coupon.label} applied!`);
}
function openCheckout() {
  if (!cartQuantity()) { showToast("Your bag is empty.","error"); return; }
  closeCart();
  const price=pricing();
  $("#checkoutSummary").innerHTML=`<span>${cartQuantity()} item${cartQuantity()===1?"":"s"} · ${price.discount?`Saved ${money(price.discount)}`:"Lovely finds selected"}</span><strong>${money(price.total)}</strong>`;
  $("#checkoutError").textContent="";
  $("#checkoutForm").reset();
  $("#checkoutContent").classList.remove("hidden");
  $("#orderSuccess").classList.add("hidden");
  openModal("#checkoutModal");
}
function createOrder(formData) {
  const price=pricing();
  const order={
    id:"VL"+Date.now().toString().slice(-8),
    date:new Date().toISOString(),
    customer:{name:formData.get("fullName").trim(),email:formData.get("email").trim(),phone:formData.get("phone").trim(),address:formData.get("address").trim(),city:formData.get("city").trim(),pincode:formData.get("pincode").trim()},
    items:Object.entries(cart).map(([id,quantity])=>({id,name:productById(id).name,price:productById(id).price,quantity})),
    coupon:appliedCoupon,
    pricing:price,
    status:"Demo order confirmed"
  };
  orders.unshift(order);
  orders=orders.slice(0,20);
  safeWrite(CONFIG.storageKeys.orders,orders);
  return order;
}
function placeOrder(event) {
  event.preventDefault();
  const form=$("#checkoutForm");
  if (!form.reportValidity()) { $("#checkoutError").textContent="Please complete all required fields correctly."; return; }
  if (!cartQuantity()) { $("#checkoutError").textContent="Your bag is empty. Add an item before checking out."; return; }
  const data=new FormData(form);
  const order=createOrder(data);
  cart={}; appliedCoupon=null; currentCouponCode="";
  saveCart(); renderAll();
  $("#checkoutContent").classList.add("hidden");
  $("#orderSuccess").classList.remove("hidden");
  $("#orderSuccess").innerHTML=`<div class="success-icon">✓</div><span class="eyebrow">IT'S OFFICIALLY A LITTLE TREAT</span><h3>Order placed!</h3><p>Thank you, ${escapeHTML(order.customer.name.split(" ")[0])}. Your demo order has been saved in this browser.</p>
    <div class="order-receipt"><div><span>Order reference</span><strong>${escapeHTML(order.id)}</strong></div><div><span>Items</span><strong>${order.items.reduce((sum,item)=>sum+item.quantity,0)}</strong></div><div><span>Total</span><strong>${money(order.pricing.total)}</strong></div><div><span>Delivery to</span><strong>${escapeHTML(order.customer.city)} · ${escapeHTML(order.customer.pincode)}</strong></div></div>
    <div class="success-actions"><button class="primary-button" id="printReceipt">Print receipt ↗</button><button class="secondary-button" id="continueAfterOrder">Continue shopping</button></div>`;
  $("#printReceipt").addEventListener("click",()=>printOrder(order));
  $("#continueAfterOrder").addEventListener("click",()=>{closeModal("#checkoutModal");showToast("Happy browsing!");});
}
function printOrder(order) {
  const receiptWindow=window.open("","_blank","width=650,height=750");
  if(!receiptWindow){showToast("Allow pop-ups to print the receipt.","error");return;}
  const rows=order.items.map(item=>`<tr><td>${escapeHTML(item.name)}</td><td>${item.quantity}</td><td>${money(item.price*item.quantity)}</td></tr>`).join("");
  receiptWindow.document.write(`<!doctype html><html><head><title>Veloura receipt ${escapeHTML(order.id)}</title><style>body{font:14px Arial,sans-serif;max-width:650px;margin:40px auto;color:#30283a}h1{color:#8060a4}table{width:100%;border-collapse:collapse;margin:25px 0}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}.total{font-size:20px;font-weight:bold;text-align:right}.muted{color:#777;font-size:12px}</style></head><body><h1>veloura</h1><p>Your little treasures, all in one place.</p><h2>Order receipt</h2><p>Reference: ${escapeHTML(order.id)}<br>Date: ${new Date(order.date).toLocaleString(CONFIG.locale)}</p><p>Customer: ${escapeHTML(order.customer.name)}<br>Delivery: ${escapeHTML(order.customer.address)}, ${escapeHTML(order.customer.city)} - ${escapeHTML(order.customer.pincode)}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><p>Subtotal: ${money(order.pricing.subtotal)}</p><p>Discount: −${money(order.pricing.discount)}</p><p>Estimated tax: ${money(order.pricing.tax)}</p><p>Shipping: ${order.pricing.shipping?money(order.pricing.shipping):"FREE"}</p><p class="total">Total: ${money(order.pricing.total)}</p><p class="muted">Demo order only. No payment has been collected.</p><script>window.onload=()=>window.print()<\/script></body></html>`);
  receiptWindow.document.close();
}
function showOrders() {
  const content=$("#ordersContent");
  if(!orders.length) content.innerHTML='<div class="no-orders"><div style="font-size:30px">♡</div><p>No orders yet. Your future little treasures will appear here.</p></div>';
  else content.innerHTML=orders.map(order=>`<article class="order-history-item"><div><strong>${escapeHTML(order.id)}</strong><strong>${money(order.pricing.total)}</strong></div><p>${new Date(order.date).toLocaleDateString(CONFIG.locale,{day:"numeric",month:"short",year:"numeric"})} · ${order.items.reduce((sum,item)=>sum+item.quantity,0)} item(s) · ${escapeHTML(order.status)}</p><div class="order-actions"><button data-view-order="${escapeHTML(order.id)}">View receipt ↗</button><button data-reorder="${escapeHTML(order.id)}">Reorder ↻</button></div></article>`).join("");
  openModal("#ordersModal");
}
function reorderOrder(id) {
  const order=orders.find(item=>item.id===id);
  if(!order) return;
  let added=0, skipped=0;
  order.items.forEach(item=>{
    const product=productById(item.id);
    if(!product){skipped++;return;}
    const current=cart[item.id]||0;
    const next=Math.min(product.stock,current+item.quantity);
    if(next>current){cart[item.id]=next;added+=next-current;}
    if(next<current+item.quantity) skipped++;
  });
  saveCart();renderAll();closeModal("#ordersModal");
  if(added) {openCart();showToast(`Added ${added} item(s) from order ${order.id}${skipped?`; ${skipped} unavailable/over-stock item(s) skipped`:""}.`);}
  else showToast("Those items are currently unavailable.","error");
}
function viewOrder(id) {
  const order=orders.find(item=>item.id===id);
  if(!order) return;
  $("#ordersContent").innerHTML=`<button class="text-button" id="backToOrders">← Back to order history</button><div class="order-history-item"><div><strong>${escapeHTML(order.id)}</strong><strong>${money(order.pricing.total)}</strong></div><p>${new Date(order.date).toLocaleString(CONFIG.locale)}</p><p>${escapeHTML(order.customer.name)} · ${escapeHTML(order.customer.email)}</p><p>${escapeHTML(order.customer.address)}, ${escapeHTML(order.customer.city)} ${escapeHTML(order.customer.pincode)}</p>${order.items.map(item=>`<div><span>${escapeHTML(item.name)} × ${item.quantity}</span><strong>${money(item.price*item.quantity)}</strong></div>`).join("")}<hr><div><span>Subtotal</span><strong>${money(order.pricing.subtotal)}</strong></div><div><span>Discount</span><strong>−${money(order.pricing.discount)}</strong></div><div><span>Tax</span><strong>${money(order.pricing.tax)}</strong></div><div><span>Shipping</span><strong>${order.pricing.shipping?money(order.pricing.shipping):"FREE"}</strong></div><div><strong>Total</strong><strong>${money(order.pricing.total)}</strong></div><p>Demo order — no payment collected.</p></div>`;
  $("#backToOrders").addEventListener("click",showOrders);
}
function setTheme(dark) {
  document.body.classList.toggle("dark-mode",dark);
  $("#themeToggle").textContent=dark?"☀":"☾";
  $("#themeToggle").setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");
  safeWrite(CONFIG.storageKeys.theme,dark?"dark":"light");
}
function initEvents() {
  $("#categoryFilters").addEventListener("click",event=>{
    const button=event.target.closest("[data-category]");
    if(!button)return;
    activeCategory=button.dataset.category; wishlistOnly=false;
    $$(".category-chip").forEach(chip=>chip.classList.toggle("active",chip===button));
    renderProducts();
  });
  $$("[data-nav-category]").forEach(link=>link.addEventListener("click",()=>{
    activeCategory=link.dataset.navCategory;wishlistOnly=false;
    $$(".category-chip").forEach(chip=>chip.classList.toggle("active",chip.dataset.category===activeCategory));
    renderProducts();
  }));
  $("#searchInput").addEventListener("input",event=>{searchTerm=event.target.value.trim().toLowerCase();renderProducts();});
  $("#sortSelect").addEventListener("change",event=>{sortMode=event.target.value;renderProducts();});
  $("#clearFilters").addEventListener("click",()=>{activeCategory="All";searchTerm="";sortMode="featured";wishlistOnly=false;$("#searchInput").value="";$("#sortSelect").value="featured";$$(".category-chip").forEach(chip=>chip.classList.toggle("active",chip.dataset.category==="All"));renderProducts();});
  $("#resetSearch").addEventListener("click",()=>$("#clearFilters").click());
  $("#productGrid").addEventListener("click",event=>{
    const add=event.target.closest("[data-add]"), heart=event.target.closest("[data-wishlist]");
    if(add){addToCart(add.dataset.add);return;}
    if(heart){toggleWishlist(heart.dataset.wishlist);return;}
    const image=event.target.closest("[data-product-image]");
    if(image){persistRecentlyViewed(image.dataset.productImage);renderRecommendations();}
  });
  $("#recommendGrid").addEventListener("click",event=>{const add=event.target.closest("[data-add]");if(add)addToCart(add.dataset.add);});
  $("#openCart").addEventListener("click",openCart);
  $("#closeCart").addEventListener("click",closeCart);
  $("#continueShopping").addEventListener("click",closeCart);
  $("#overlay").addEventListener("click",closeCart);
  $("#cartItems").addEventListener("click",event=>{
    const quantity=event.target.closest("[data-quantity]"),remove=event.target.closest("[data-remove]");
    if(quantity)changeQuantity(quantity.dataset.quantity,Number(quantity.dataset.delta));
    if(remove)removeFromCart(remove.dataset.remove);
  });
  $("#couponForm").addEventListener("submit",event=>{event.preventDefault();applyCoupon($("#couponInput").value);});
  $("#checkoutButton").addEventListener("click",openCheckout);
  $("#checkoutForm").addEventListener("submit",placeOrder);
  $$("[data-close-modal]").forEach(button=>button.addEventListener("click",()=>closeModal("#"+button.dataset.closeModal)));
  $$(".modal").forEach(modal=>modal.addEventListener("click",event=>{if(event.target===modal)closeModal("#"+modal.id);}));
  $("#wishlistToggle").addEventListener("click",()=>{
    wishlistOnly=!wishlistOnly;activeCategory="All";searchTerm="";$("#searchInput").value="";
    $$(".category-chip").forEach(chip=>chip.classList.toggle("active",chip.dataset.category==="All"));
    renderProducts();$("#shop").scrollIntoView({behavior:"smooth"});
    if(wishlistOnly)showToast("Showing your saved favourites.");
  });
  $("#themeToggle").addEventListener("click",()=>setTheme(!document.body.classList.contains("dark-mode")));
  $("#newsletterForm").addEventListener("submit",event=>{
    event.preventDefault();
    const email=$("#newsletterEmail");
    if(!email.checkValidity()){email.reportValidity();return;}
    $("#newsletterMessage").textContent="You're on the list! Thanks for joining our demo newsletter.";
    $("#newsletterMessage").style.color="var(--green)";
    email.value="";showToast("Thanks for joining the Veloura list!");
  });
  $("#footerOrders").addEventListener("click",showOrders);
  $("#ordersContent").addEventListener("click",event=>{const button=event.target.closest("[data-view-order]");const reorder=event.target.closest("[data-reorder]");if(button)viewOrder(button.dataset.viewOrder);if(reorder)reorderOrder(reorder.dataset.reorder);});
  document.addEventListener("keydown",event=>{
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();$("#searchInput").focus();$("#shop").scrollIntoView({behavior:"smooth"});}
    if(event.key==="Escape"){
      if($("#checkoutModal").classList.contains("open"))closeModal("#checkoutModal");
      else if($("#ordersModal").classList.contains("open"))closeModal("#ordersModal");
      else if($("#cartDrawer").classList.contains("open"))closeCart();
    }
  });
}
function init() {
  $("#currentYear").textContent=new Date().getFullYear();
  setTheme(safeRead(CONFIG.storageKeys.theme,"light")==="dark");
  initEvents();renderAll();
}
document.addEventListener("DOMContentLoaded",init);
