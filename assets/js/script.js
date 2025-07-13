// ===============================================
// == CONFIG ==
const CONFIG = {
    PRODUCTS: [
        { id: 1, name: "Producto 1", price: 10000 },
        { id: 2, name: "Producto 2", price: 20000 },
        { id: 3, name: "Producto 3", price: 30000 },
        { id: 4, name: "Producto 4", price: 40000 },
        { id: 5, name: "Producto 5", price: 50000 },
        { id: 6, name: "Producto 6", price: 60000 },
        { id: 7, name: "Producto 7", price: 70000 },
        { id: 8, name: "Producto 8", price: 80000 },
        { id: 9, name: "Producto 9", price: 90000 },
        { id: 10, name: "Producto 10", price: 100000 }
    ],

    MAX_PRODUCTS: 100, // MAXIMUM NUMBER OF PRODUCTS IN CART

    // AUTOMATIC DISCOUNTS BY PURCHASE AMOUNT
    DISCOUNTS: [
        { id: 1, step: 80000, rate: 0.15 },
        { id: 2, step: 50000, rate: 0.10 }
    ],

    // COUPONS
    COUPONS: [
        { id: 1, code: "DESC10", discount: 0.10 },
        { id: 2, code: "WINTER15", discount: 0.15 },
        { id: 3, code: "PROMO20", discount: 0.20 }
    ]
};

// ===============================================
// == GLOBAL VARIABLES ==

let cart = [];
let couponDiscount = 0;

// ===============================================
// == UTILITY FUNCTIONS ==

// GET PRODUCT BY ID
function getProductById(id) {
    return CONFIG.PRODUCTS.find(p => p.id === id);
}

// GET COUPON BY CODE
function getCouponByCode(code) {
    return CONFIG.COUPONS.find(c => c.code === code);
}

// GET DISCOUNT LEVEL BY RATE
function getDiscountByRate(rate) {
    return CONFIG.DISCOUNTS.find(d => d.rate === rate);
}

// CALCULATE TOTALS
function calculateTotals() {
    let subtotal = cart.reduce((acc, p) => acc + p.quantity * p.price, 0);
    let autoRate = 0;
    for (const level of CONFIG.DISCOUNTS) {
        if (subtotal >= level.step) {
        autoRate = level.rate;
        break;
        }
    }
    const autoDiscount = subtotal * autoRate;
    const coupon = couponDiscount > 0 ? subtotal * couponDiscount : 0;
    const total = subtotal - autoDiscount - coupon;
    return { subtotal, autoDiscount, coupon, total, autoRate };
}

// ===============================================
// == FUNCTIONS ==

// LOAD PRODUCT LIST (FORM)
function loadProductList() {
    const select = document.getElementById("productName");
    select.innerHTML = "";
    CONFIG.PRODUCTS.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} - $${p.price.toLocaleString()}`;
        select.appendChild(opt);
    });
    updateProductPrice();
}

// UPDATE PRODUCT PRICE (FORM)
function updateProductPrice() {
    const id = parseInt(document.getElementById("productName").value);
    const qty = parseInt(document.getElementById("productoQty").value) || 0;
    const priceDisplay = document.getElementById("productPrice");
    const product = getProductById(id);
    priceDisplay.textContent = product ? `$${(product.price * qty).toLocaleString()}` : "$0";
}

// ADD PRODUCT TO CART
function addProduct() {
    const id = parseInt(document.getElementById("productName").value);
    const qty = parseInt(document.getElementById("productoQty").value);
    const product = getProductById(id);
    const msg = document.getElementById("message");
    const cpnMsg = document.getElementById("couponMessage");
    msg.innerHTML = cpnMsg.innerHTML = "";

    if (!product || qty <= 0 || isNaN(qty)) {
        msg.innerHTML = `<div class="alert alert-warning">⚠️ Datos inválidos. Revisa los campos.</div>`;
        return;
    }
    if (cart.length >= CONFIG.MAX_PRODUCTS) {
        msg.innerHTML = `<div class="alert alert-danger">🚫 Límite de productos alcanzado.</div>`;
        return;
    }

    // CHECK IF PRODUCT IS ALREADY IN CART, IF SO, INCREASE QUANTITY, ELSE ADD
    const idx = cart.findIndex(i => i.id === id);
    if (idx !== -1) cart[idx].quantity += qty;
    else cart.push({ id, name: product.name, quantity: qty, price: product.price });

    // SHOW SUCCESS MESSAGE
    msg.innerHTML = `<div class="alert alert-success">✅ "${product.name}" añadido al carrito.</div>`;
    updateCartView();
    updateSummary();
}

// REMOVE PRODUCT FROM CART
function removeProduct(index) {
    cart.splice(index, 1);
    updateCartView();
    updateSummary();
    document.getElementById("message").innerHTML = `<div class="alert alert-info">🗑️ Producto eliminado.</div>`;
    document.getElementById("couponMessage").innerHTML = "";
}

// UPDATE PRODUCT QUANTITY
function updateCartQuantity(index, newQty) {
    if (newQty <= 0) return;
    cart[index].quantity = parseInt(newQty);
    updateCartView();
    updateSummary();

    // CLEAR ALERT MESSAGES
    document.getElementById("couponMessage").innerHTML = "";
}

// UPDATE CART VIEW
function updateCartView() {
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = "";
    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <strong>${item.name}</strong>
                x 
                <input type="number" min="1" value="${item.quantity}" onchange="updateCartQuantity(${index}, this.value)" style="width: 60px;" />
                - $${(item.quantity * item.price).toLocaleString()}
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removeProduct(${index})">Eliminar</button>
        </div>`;
        cartList.appendChild(li);
    });
}

// APPLY COUPON
function applyCoupon() {
    const input = document.getElementById("couponInput").value.trim().toUpperCase();
    const couponMessage = document.getElementById("couponMessage");

    if (cart.length === 0) {
        couponMessage.innerHTML = `<div class="alert alert-danger">🚫 El carrito está vacío. No se puede aplicar cupones.</div>`;
        return;
    }

    const foundCoupon = getCouponByCode(input);
    if (foundCoupon) {
        couponDiscount = foundCoupon.discount;
        couponMessage.innerHTML = `<div class="alert alert-success">🎟️ Cupón "${input}" aplicado: ${(couponDiscount * 100).toFixed(0)}% de descuento.</div>`;
    } else {
        couponDiscount = 0;
        couponMessage.innerHTML = `<div class="alert alert-danger">❌ Cupón inválido.</div>`;
    }
    updateSummary();
}

// UPDATE SUMMARY
function updateSummary() {
    const { subtotal, autoDiscount, coupon, total, autoRate } = calculateTotals();

    document.getElementById("subtotalDisplay").textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById("autoDiscountDisplay").textContent = `$${autoDiscount.toLocaleString()}`;
    document.getElementById("couponDiscountDisplay").textContent = `$${coupon.toLocaleString()}`;
    document.getElementById("totalDisplay").textContent = `$${total.toLocaleString()}`;

    const level = getDiscountByRate(autoRate);
    const msg = autoRate > 0 && level
        ? `<div class="alert alert-success">📉 Descuento automático aplicado: ${(autoRate * 100).toFixed(0)}% por superar $${level.step.toLocaleString()}.</div>`
        : "";

    document.getElementById("message").innerHTML = msg;
}

// CHECKOUT
function checkout() {
    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerMail").value.trim();
    const message = document.getElementById("message");
    const couponMessage = document.getElementById("couponMessage");

    couponMessage.innerHTML = message.innerHTML = "";

    if (!name) {
        message.innerHTML = `<div class="alert alert-warning">⚠️ Ingresa tu nombre para continuar.</div>`;
        return;
    }
    if (cart.length === 0) {
        message.innerHTML = `<div class="alert alert-danger">🚫 El carrito está vacío.</div>`;
        return;
    }

    const { subtotal, autoDiscount, coupon, total } = calculateTotals();

    let html = `<p><strong>Cliente:</strong> ${name}</p><ul class="list-group mb-3">`;
    cart.forEach(p => {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${p.name} x${p.quantity}</span><span>$${(p.price * p.quantity).toLocaleString()}</span></li>`;
    });
    html += `</ul><p class="text-end"><strong>Subtotal:</strong> $${subtotal.toLocaleString()}</p>
            <p class="text-end"><strong>Descuento automático:</strong> $${autoDiscount.toLocaleString()}</p>
            <p class="text-end"><strong>Descuento cupón:</strong> $${coupon.toLocaleString()}</p>
            <h5 class="text-end"><strong>Total a pagar:</strong> $${total.toLocaleString()}</h5>`;

    document.getElementById("checkoutModalBody").innerHTML = html;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).show();
}

// REMOVE COUPON
function removeCoupon() {
    couponDiscount = 0;
    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").innerHTML = `<div class="alert alert-info">🗑️ Cupón eliminado.</div>`;
    updateSummary();
}

// SEND ORDER
function sendOrder() {
    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerMail").value.trim();
    const orderNumber = Math.floor(1000 + Math.random() * 9000);

    bootstrap.Modal.getInstance(document.getElementById("checkoutModal")).hide();

    cart = [];
    couponDiscount = 0;
    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").innerHTML = "";
    updateCartView();
    updateSummary();

    document.getElementById("message").innerHTML = `
        <div class="alert alert-success">
        🧾 <strong>¡Pedido #${orderNumber} enviado con éxito!</strong><br>
        <p>Hemos enviado el detalle de tu pedido a tu correo: <strong>${email}</strong>.</p>
        Gracias por tu compra, <strong>${name}</strong>.
        </div>`;

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").textContent = "$0";
    document.getElementById("customerName").value = "";
    document.getElementById("customerMail").value = "";
}

// INITIALIZE APP
window.onload = () => {
    loadProductList();
    document.getElementById("productName").addEventListener("change", updateProductPrice);
    document.getElementById("productoQty").addEventListener("input", updateProductPrice);
};


// ===============================================
// ADDITIONAL COMMENTS: The discount application logic could be improved. It currently applies step discounts to the product subtotal, without considering coupon discounts. In a future iteration, it should be modified to be calculated after the coupons, but for the purposes of the current academic exercice, I will leave it as is.