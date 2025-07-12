// Lista de productos
const products = [
    { name: "Producto 1", price: 10000 },
    { name: "Producto 2", price: 20000 },
    { name: "Producto 3", price: 30000 },
    { name: "Producto 4", price: 40000 },
    { name: "Producto 5", price: 50000 },
    { name: "Producto 6", price: 60000 },
    { name: "Producto 7", price: 70000 },
    { name: "Producto 8", price: 80000 },
    { name: "Producto 9", price: 90000 },
    { name: "Producto 10", price: 100000 },
];

const automaticDiscounts = [
    { threshold: 80000, rate: 0.15 },
    { threshold: 50000, rate: 0.10 }
];

const coupons = [
  { code: "DESC10", discount: 0.10 },
  { code: "VERANO15", discount: 0.15 },
  { code: "PROMO20", discount: 0.20 },
];

const MAX_PRODUCTS = 100;

let cart = [];
let couponDiscount = 0;

// Mostrar lista de productos en el select
function loadProductList() {
    const productNameSelect = document.getElementById("productName");
    productNameSelect.innerHTML = "";

    products.forEach(product => {
        const option = document.createElement("option");
        option.value = product.name;
        option.textContent = `${product.name} - $${product.price.toLocaleString()}`;
        productNameSelect.appendChild(option);
    });
    updateProductPrice();
}

// Actualizar precio al seleccionar producto o cantidad
function updateProductPrice() {
    const name = document.getElementById("productName").value;
    const qty = parseInt(document.getElementById("productoQty").value) || 0;
    const priceDisplay = document.getElementById("productPrice");

    const selectedProduct = products.find(p => p.name === name);
    if (selectedProduct) {
        priceDisplay.textContent = `$${(selectedProduct.price * qty).toLocaleString()}`;
    } else {
        priceDisplay.textContent = "$0";
    }
}

// Añadir producto al carrito
function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const qty = parseInt(document.getElementById("productoQty").value);
    const selectedProduct = products.find(p => p.name === name);
    const message = document.getElementById("message");
    const couponMessage = document.getElementById("couponMessage");

    couponMessage.innerHTML = ""; // Limpiar mensajes de cupón al añadir producto
    message.innerHTML = "";

    if (!selectedProduct || qty <= 0 || isNaN(qty)) {
        message.innerHTML = `<div class="alert alert-warning">⚠️ Datos inválidos. Revisa los campos.</div>`;
        return;
    }

    if (cart.length >= MAX_PRODUCTS) {
        message.innerHTML = `<div class="alert alert-danger">🚫 Límite de productos alcanzado.</div>`;
        return;
    }

    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({ name, quantity: qty, price: selectedProduct.price });
    }

    message.innerHTML = `<div class="alert alert-success">✅ "${name}" añadido al carrito.</div>`;
    updateCartView();
    updateSummary();
}

// Eliminar producto del carrito
function removeProduct(index) {
    cart.splice(index, 1);
    updateCartView();
    updateSummary();
    document.getElementById("message").innerHTML = `<div class="alert alert-info">🗑️ Producto eliminado.</div>`;
    document.getElementById("couponMessage").innerHTML = "";
}

// Modificar cantidad desde el carrito
function updateCartQuantity(index, newQty) {
    if (newQty <= 0) return;
    cart[index].quantity = parseInt(newQty);
    updateCartView();
    updateSummary();
    document.getElementById("couponMessage").innerHTML = "";
}

// Mostrar carrito
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
                    x <input type="number" min="1" value="${item.quantity}" onchange="updateCartQuantity(${index}, this.value)" style="width: 60px;" />
                    - $${(item.quantity * item.price).toLocaleString()}
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeProduct(${index})">Eliminar</button>
            </div>
        `;
        cartList.appendChild(li);
    });
}

// Aplicar cupón
function applyCoupon() {
    const input = document.getElementById("couponInput").value.trim().toUpperCase();
    const couponMessage = document.getElementById("couponMessage");

    if (cart.length === 0) {
        couponMessage.innerHTML = `<div class="alert alert-danger">🚫 El carrito está vacío. No se puede aplicar cupones.</div>`;
        return;
    }

    const foundCoupon = coupons.find(c => c.code === input);

    if (foundCoupon) {
        couponDiscount = foundCoupon.discount;
        couponMessage.innerHTML = `<div class="alert alert-success">🎟️ Cupón "${input}" aplicado: ${(couponDiscount * 100).toFixed(0)}% de descuento.</div>`;
        updateSummary();
    } else {
        couponDiscount = 0;
        couponMessage.innerHTML = `<div class="alert alert-danger">❌ Cupón inválido.</div>`;
        updateSummary();
    }
}

// Calcular resumen
function updateSummary() {
    let subtotal = 0;
    cart.forEach(p => subtotal += p.quantity * p.price);

    // Determinar descuento automático (el primero que aplique, ordenado desc)
    let autoDiscountRate = 0;
    for (const level of automaticDiscounts) {
        if (subtotal >= level.threshold) {
            autoDiscountRate = level.rate;
            break;
        }
    }

    const autoDiscount = subtotal * autoDiscountRate;
    const coupon = couponDiscount > 0 ? subtotal * couponDiscount : 0;
    const total = subtotal - autoDiscount - coupon;

    // Actualizar resumen de precios en el carrito
    document.getElementById("subtotalDisplay").textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById("autoDiscountDisplay").textContent = `$${autoDiscount.toLocaleString()}`;
    document.getElementById("couponDiscountDisplay").textContent = `$${coupon.toLocaleString()}`;
    document.getElementById("totalDisplay").textContent = `$${total.toLocaleString()}`;

    // Mostrar mensajes de descuentos automáticos solo en #message (sin borrar #couponMessage)
    let msg = "";

    if (autoDiscountRate > 0) {
        const level = automaticDiscounts.find(d => d.rate === autoDiscountRate);
        msg += `📉 Descuento automático aplicado: ${(autoDiscountRate * 100).toFixed(0)}% por superar $${level.threshold.toLocaleString()}.<br>`;
    }

    document.getElementById("message").innerHTML = msg
        ? `<div class="alert alert-success">${msg}</div>`
        : "";
}

// Checkout
function checkout() {
    const name = document.getElementById("customerName").value.trim();
    const message = document.getElementById("message");
    const couponMessage = document.getElementById("couponMessage");

    couponMessage.innerHTML = "";
    message.innerHTML = "";

    if (!name) {
        message.innerHTML = `<div class="alert alert-warning">⚠️ Ingresa tu nombre para continuar.</div>`;
        return;
    }

    if (cart.length === 0) {
        message.innerHTML = `<div class="alert alert-danger">🚫 El carrito está vacío.</div>`;
        return;
    }

    // Cálculo final
    let subtotal = 0;
    cart.forEach(p => subtotal += p.quantity * p.price);

    let autoDiscountRate = 0;
    for (const level of automaticDiscounts) {
        if (subtotal >= level.threshold) {
            autoDiscountRate = level.rate;
            break;
        }
    }

    const autoDiscount = subtotal * autoDiscountRate;
    const coupon = couponDiscount > 0 ? subtotal * couponDiscount : 0;
    const total = subtotal - autoDiscount - coupon;

    // Generar HTML para el modal
    let summaryHTML = `<p><strong>Cliente:</strong> ${name}</p>`;
    summaryHTML += `<ul class="list-group mb-3">`;

    cart.forEach(p => {
        summaryHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${p.name} x${p.quantity}</span>
                <span>$${(p.price * p.quantity).toLocaleString()}</span>
            </li>`;
    });

    summaryHTML += `</ul>`;

    summaryHTML += `
        <p><strong>Subtotal:</strong> $${subtotal.toLocaleString()}</p>
        <p><strong>Descuento automático:</strong> $${autoDiscount.toLocaleString()}</p>
        <p><strong>Descuento cupón:</strong> $${coupon.toLocaleString()}</p>
        <h5><strong>Total a pagar:</strong> $${total.toLocaleString()}</h5>
    `;

    document.getElementById("checkoutModalBody").innerHTML = summaryHTML;

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
}

// Quitar cupón
function removeCoupon() {
    couponDiscount = 0;
    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").innerHTML = `<div class="alert alert-info">🗑️ Cupón eliminado.</div>`;
    updateSummary();
}

// Enviar pedido
function sendOrder() {
    const name = document.getElementById("customerName").value.trim();

    // Generar número de pedido aleatorio (4 dígitos)
    const orderNumber = Math.floor(1000 + Math.random() * 9000);

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
    modal.hide();

    // Limpiar todo
    cart = [];
    couponDiscount = 0;
    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").innerHTML = "";
    updateCartView();
    updateSummary();

    // Mensaje de confirmación
    document.getElementById("message").innerHTML = `
        <div class="alert alert-success">
            🧾 <strong>¡Pedido #${orderNumber} enviado con éxito!</strong><br>
            Gracias por tu compra, <strong>${name}</strong>.
        </div>
    `;

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").textContent = "$0";
    document.getElementById("customerName").value = "";
}

// Inicializar
window.onload = () => {
    loadProductList();
    document.getElementById("productName").addEventListener("change", updateProductPrice);
    document.getElementById("productoQty").addEventListener("input", updateProductPrice);
};
