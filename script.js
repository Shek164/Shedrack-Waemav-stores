/* =========================================
   BUSINESS MANAGEMENT SYSTEM
   ========================================= */


let products =
    JSON.parse(
        localStorage.getItem("bizmanager_products")
    ) || [];


const productTable =
    document.getElementById("productTable");

const emptyState =
    document.getElementById("emptyState");

const productModal =
    document.getElementById("productModal");

const productForm =
    document.getElementById("productForm");

const searchInput =
    document.getElementById("searchProduct");

const stockFilter =
    document.getElementById("stockFilter");


/* =========================================
   STORAGE
   ========================================= */

function saveProducts() {

    localStorage.setItem(
        "bizmanager_products",
        JSON.stringify(products)
    );

}


/* =========================================
   MODAL
   ========================================= */

function openProductModal(product = null) {

    productModal.classList.add("show");

    productModal.setAttribute(
        "aria-hidden",
        "false"
    );


    if (product) {

        document.getElementById("modalTitle")
            .textContent = "Edit Product";

        document.getElementById("editingProductId")
            .value = product.id;

        document.getElementById("productName")
            .value = product.name;

        document.getElementById("productPrice")
            .value = product.price;

        document.getElementById("productStock")
            .value = product.stock;

    } else {

        productForm.reset();

        document.getElementById("editingProductId")
            .value = "";

        document.getElementById("modalTitle")
            .textContent = "Add Product";

    }


    setTimeout(() => {

        document
            .getElementById("productName")
            .focus();

    }, 100);

}


function closeProductModal() {

    productModal.classList.remove("show");

    productModal.setAttribute(
        "aria-hidden",
        "true"
    );

    productForm.reset();

}


/* =========================================
   ADD / EDIT PRODUCT
   ========================================= */

productForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const id =
            document
                .getElementById("editingProductId")
                .value;


        const name =
            document
                .getElementById("productName")
                .value
                .trim();


        const price =
            Number(
                document
                    .getElementById("productPrice")
                    .value
            );


        const stock =
            Number(
                document
                    .getElementById("productStock")
                    .value
            );


        if (
            !name ||
            price < 0 ||
            stock < 0
        ) {

            showToast(
                "Error",
                "Please enter valid product information.",
                "!"
            );

            return;

        }


        if (id) {

            const product =
                products.find(
                    item =>
                        item.id === Number(id)
                );


            if (product) {

                product.name = name;

                product.price = price;

                product.stock = stock;

                showToast(
                    "Product Updated",
                    `${name} has been updated.`
                );

            }

        } else {

            const newProduct = {

                id: Date.now(),

                name,

                price,

                stock

            };


            products.unshift(
                newProduct
            );


            showToast(
                "Product Added",
                `${name} has been added successfully.`
            );

        }


        saveProducts();

        renderProducts();

        updateDashboard();

        closeProductModal();

    }
);


/* =========================================
   RENDER PRODUCTS
   ========================================= */

function renderProducts() {

    const search =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const filter =
        stockFilter.value;


    let filtered =
        products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);


            let matchesFilter = true;


            if (filter === "available") {

                matchesFilter =
                    product.stock > 10;

            }


            if (filter === "low") {

                matchesFilter =
                    product.stock > 0 &&
                    product.stock <= 10;

            }


            if (filter === "out") {

                matchesFilter =
                    product.stock === 0;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    productTable.innerHTML = "";


    if (filtered.length === 0) {

        productTable.style.display = "none";

        emptyState.style.display = "block";

        return;

    }


    productTable.style.display = "table";

    emptyState.style.display = "none";


    filtered.forEach(product => {

        const row =
            document.createElement("tr");


        let statusClass = "available";

        let statusText = "Available";


        if (product.stock === 0) {

            statusClass = "out";

            statusText = "Out of stock";

        } else if (product.stock <= 10) {

            statusClass = "low";

            statusText = "Low stock";

        }


        row.innerHTML = `

            <td>
                ${escapeHTML(product.name)}
            </td>

            <td>
                KSh ${formatNumber(product.price)}
            </td>

            <td>
                ${formatNumber(product.stock)}
            </td>

            <td>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </td>

            <td>

                <div class="action-group">

                    <button
                        class="action-btn edit-btn"
                        data-action="edit"
                        data-id="${product.id}">

                        Edit

                    </button>

                    <button
                        class="action-btn delete-btn"
                        data-action="delete"
                        data-id="${product.id}">

                        Delete

                    </button>

                </div>

            </td>

        `;


        productTable.appendChild(row);

    });

}


/* =========================================
   TABLE ACTIONS
   ========================================= */

productTable.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) return;


        const id =
            Number(button.dataset.id);


        const action =
            button.dataset.action;


        const product =
            products.find(
                item => item.id === id
            );


        if (!product) return;


        if (action === "edit") {

            openProductModal(product);

        }


        if (action === "delete") {

            deleteProduct(product);

        }

    }
);


/* =========================================
   DELETE
   ========================================= */

function deleteProduct(product) {

    const confirmed =
        confirm(
            `Delete "${product.name}"? This action cannot be undone.`
        );


    if (!confirmed) return;


    products =
        products.filter(
            item =>
                item.id !== product.id
        );


    saveProducts();

    renderProducts();

    updateDashboard();


    showToast(
        "Product Deleted",
        `${product.name} was removed.`
    );

}


/* =========================================
   DASHBOARD
   ========================================= */

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total + product.stock,
            0
        );


    document.getElementById(
        "productCount"
    ).textContent =
        formatNumber(totalProducts);


    document.getElementById(
        "stockCount"
    ).textContent =
        formatNumber(totalStock);


    /*
        Revenue will become connected
        to the sales module later.
    */

    document.getElementById(
        "salesTotal"
    ).textContent =
        "KSh 0";


    /*
        Customer module will be added later.
    */

    document.getElementById(
        "customerCount"
    ).textContent =
        "0";


    const stockStatus =
        document.getElementById(
            "stockStatus"
        );


    const lowStock =
        products.filter(
            product =>
                product.stock <= 10
        ).length;


    if (lowStock > 0) {

        stockStatus.textContent =
            `${lowStock} item(s) need attention`;

    } else {

        stockStatus.textContent =
            "Inventory healthy";

    }

}


/* =========================================
   SEARCH & FILTER
   ========================================= */

searchInput.addEventListener(
    "input",
    renderProducts
);


stockFilter.addEventListener(
    "change",
    renderProducts
);


/* =========================================
   TOAST
   ========================================= */

let toastTimer;


function showToast(
    title,
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById("toast");


    document.getElementById(
        "toastTitle"
    ).textContent =
        title;


    document.getElementById(
        "toastMessage"
    ).textContent =
        message;


    document.getElementById(
        "toastIcon"
    ).textContent =
        icon;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================
   MOBILE SIDEBAR
   ========================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const overlay =
    document.getElementById(
        "overlay"
    );


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    overlay.classList.remove(
        "show"
    );

}


mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.add(
            "open"
        );

        overlay.classList.add(
            "show"
        );

    }
);


overlay.addEventListener(
    "click",
    closeSidebar
);


document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeSidebar
        );

    });


/* =========================================
   CLOSE MODAL WITH ESCAPE
   ========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeProductModal();

            closeSidebar();

        }

    }
);


/* =========================================
   SECURITY / OUTPUT HELPERS
   ========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatNumber(value) {

    return Number(value)
        .toLocaleString(
            "en-KE"
        );

}


/* =========================================
   INITIALIZE
   ========================================= */

renderProducts();

updateDashboard();
/* =========================================
   SALES MANAGEMENT
========================================= */

let sales =
    JSON.parse(
        localStorage.getItem("bizmanager_sales")
    ) || [];


const saleModal =
    document.getElementById("saleModal");

const saleForm =
    document.getElementById("saleForm");

const saleProduct =
    document.getElementById("saleProduct");
const saleCustomer =
    document.getElementById("saleCustomer");

const saleQuantity =
    document.getElementById("saleQuantity");

const saleTotal =
    document.getElementById("saleTotal");
/* POPULATE CUSTOMER SELECT */

function populateSaleCustomers() {

    saleCustomer.innerHTML =
        `<option value="">
            Select customer
        </option>`;

    customers.forEach(customer => {

        const option =
            document.createElement("option");

        option.value = customer.id;

        option.textContent =
            `${customer.name} — ${customer.phone}`;

        saleCustomer.appendChild(option);

    });
}

/* OPEN SALE MODAL */

function openSaleModal() {

    populateSaleCustomers();

    populateSaleProducts();

    saleForm.reset();

    saleQuantity.value = 1;

    calculateSaleTotal();

    saleModal.classList.add("active");

    saleModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* CLOSE SALE MODAL */

function closeSaleModal() {

    saleModal.classList.remove("active");

    saleModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* POPULATE PRODUCT SELECT */

function populateSaleProducts() {

    saleProduct.innerHTML =
        `<option value="">
            Select product
        </option>`;

    products.forEach(product => {

        if (product.stock > 0) {

            const option =
                document.createElement("option");

            option.value = product.id;

            option.textContent =
                `${product.name} — KSh ${formatNumber(product.price)} (${product.stock} available)`;

            saleProduct.appendChild(option);
        }

    });
}


/* CALCULATE SALE TOTAL */

function calculateSaleTotal() {

    const selectedProduct =
        products.find(
            product =>
                String(product.id) ===
                String(saleProduct.value)
        );

    if (!selectedProduct) {

        saleTotal.textContent = "KSh 0";

        return;
    }

    const quantity =
        Number(saleQuantity.value) || 1;

    const total =
        selectedProduct.price * quantity;

    saleTotal.textContent =
        `KSh ${formatNumber(total)}`;
}


/* PRODUCT CHANGE */

saleProduct.addEventListener(
    "change",
    calculateSaleTotal
);


/* QUANTITY CHANGE */

saleQuantity.addEventListener(
    "input",
    calculateSaleTotal
);


/* SAVE SALE */

saleForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const customer =
            document
                .getElementById("saleCustomer")
                .value
                .trim();

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(saleProduct.value)
            );

        const quantity =
            Number(saleQuantity.value);

        const payment =
            document
                .getElementById("salePayment")
                .value;


        if (!product) {

            showToast(
                "Error",
                "Please select a product.",
                "!"
            );

            return;
        }


        if (quantity <= 0) {

            showToast(
                "Error",
                "Quantity must be at least 1.",
                "!"
            );

            return;
        }


        if (quantity > product.stock) {

            showToast(
                "Insufficient Stock",
                `Only ${product.stock} units are available.`,
                "!"
            );

            return;
        }


        const total =
            product.price * quantity;


        const newSale = {

    id: Date.now(),

    customerId: selectedCustomer.id,

    customer: selectedCustomer.name,

    productId: product.id,

            productName: product.name,

            quantity: quantity,

            total: total,

            payment: payment,

            date: new Date().toISOString()

        };


        sales.unshift(newSale);
       /* UPDATE CUSTOMER PURCHASE TOTAL */

selectedCustomer.totalPurchases =
    (Number(selectedCustomer.totalPurchases) || 0)
    + total;

localStorage.setItem(
    "bizmanager_customers",
    JSON.stringify(customers)
);


        /* REDUCE INVENTORY */

        product.stock -= quantity;

        saveProducts();


        /* SAVE SALES */

        localStorage.setItem(
            "bizmanager_sales",
            JSON.stringify(sales)
        );


        renderSales();

        updateSalesSummary();

        updateDashboard();


        closeSaleModal();


        showToast(
            "Sale Recorded",
            "The transaction was successfully saved.",
            "✓"
        );

    }
);

/* RENDER SALES */

function renderSales() {

    const table =
        document.getElementById("salesTable");

    const emptyState =
        document.getElementById("salesEmptyState");


    if (!table || !emptyState) {
        return;
    }


    table.innerHTML = "";


    if (sales.length === 0) {

        emptyState.style.display = "block";

        return;
    }


    emptyState.style.display = "none";


    sales.forEach(sale => {

        const row =
            document.createElement("tr");


        const date =
            new Date(sale.date);


        const formattedDate =
            date.toLocaleDateString(
                "en-KE",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );


        // PREMIUM: Elegant indicator badges with semantic state colors
        const paymentClass =
            sale.payment === "Paid"
                ? "badge-premium-success"
                : "badge-premium-warning";


        row.innerHTML = `

            <td class="cell-primary-text">
                <div class="user-meta-group">
                    <span class="user-avatar-initial">${escapeHTML(sale.customer.charAt(0))}</span>
                    <span class="user-title">${escapeHTML(sale.customer)}</span>
                </div>
            </td>

            <td class="cell-secondary-text">
                ${escapeHTML(sale.productName)}
            </td>

            <td class="cell-numeric-text">
                <span class="muted-multiplier">×</span> ${sale.quantity}
            </td>

            <td class="cell-amount-display text-bold">
                KSh ${formatNumber(sale.total)}
            </td>

            <td>
                <span class="status-pill ${paymentClass}">
                    <span class="status-dot"></span>
                    ${sale.payment}
                </span>
            </td>

            <td class="cell-date-display">
                ${formattedDate}
            </td>

        `;


        table.appendChild(row);

    });

}


/* SALES SUMMARY */

function updateSalesSummary() {

    const today =
        new Date().toDateString();


    const todayTotal =
        sales
            .filter(
                sale =>
                    new Date(sale.date)
                        .toDateString() === today
            )
            .reduce(
                (sum, sale) =>
                    sum + sale.total,
                0
            );


    const pendingTotal =
        sales
            .filter(
                sale =>
                    sale.payment === "Pending"
            )
            .reduce(
                (sum, sale) =>
                    sum + sale.total,
                0
            );


    const todaySalesEl = document.getElementById("todaySales");
    const transactionCountEl = document.getElementById("transactionCount");
    const pendingPaymentsEl = document.getElementById("pendingPayments");


    // PREMIUM: Display metrics wrapped inside clean HTML sub-structures with secondary labels
    if (todaySalesEl) {
        todaySalesEl.innerHTML = `
            <span class="currency-prefix">KSh</span>
            <span class="metric-value-huge">${formatNumber(todayTotal)}</span>
            <span class="metric-trend subtext-muted">Cleared Today</span>
        `;
    }

    if (transactionCountEl) {
        transactionCountEl.innerHTML = `
            <span class="metric-value-huge">${formatNumber(sales.length)}</span>
            <span class="metric-trend subtext-muted">Active Volume</span>
        `;
    }

    if (pendingPaymentsEl) {
        pendingPaymentsEl.innerHTML = `
            <span class="currency-prefix text-warning">KSh</span>
            <span class="metric-value-huge text-warning">${formatNumber(pendingTotal)}</span>
            <span class="metric-trend subtext-muted">Awaiting Settlement</span>
        `;
    }

}


/* UPDATE REVENUE & PREMIUM ANALYTICS OVERVIEW */

function updateSalesRevenue() {

    const totalRevenue =
        sales.reduce(
            (sum, sale) =>
                sum + sale.total,
            0
        );


    // Update Top Left Metric Block
    const revenueElement =
        document.getElementById(
            "salesTotal"
        );

    if (revenueElement) {
        revenueElement.innerHTML = `
            <span class="currency-prefix">KSh</span>
            <span class="headline-number">${formatNumber(totalRevenue)}</span>
        `;
    }


    // Update Premium Business Analytics Grid Elements
    const analyticsRevenueEl = document.getElementById("analyticsRevenue");
    const analyticsSalesEl = document.getElementById("analyticsSales");
    const analyticsCustomersEl = document.getElementById("analyticsCustomers");


    if (analyticsRevenueEl) {
        analyticsRevenueEl.innerHTML = `
            <span class="currency-label-sm">KSh</span>
            <span class="card-value-display">${formatNumber(totalRevenue)}</span>
        `;
    }

    if (analyticsSalesEl) {
        analyticsSalesEl.innerHTML = `
            <span class="card-value-display">${formatNumber(sales.length)}</span>
        `;
    }

    if (analyticsCustomersEl && typeof customers !== 'undefined') {
        analyticsCustomersEl.innerHTML = `
            <span class="card-value-display">${formatNumber(customers.length)}</span>
        `;
    }

}


/* INITIALIZE SALES COMPONENTS */

renderSales();

updateSalesSummary();

updateSalesRevenue();

/* =========================================
   CUSTOMER MANAGEMENT
========================================= */

let customers =
    JSON.parse(
        localStorage.getItem("bizmanager_customers")
    ) || [];


/* -----------------------------------------
   CUSTOMER ELEMENTS
----------------------------------------- */

const customerModal =
    document.getElementById("customerModal");

const customerForm =
    document.getElementById("customerForm");

const customerSearch =
    document.getElementById("customerSearch");


/* -----------------------------------------
   OPEN CUSTOMER MODAL
----------------------------------------- */

function openCustomerModal() {

    customerForm.reset();

    document
        .getElementById("customerStatus")
        .value = "Active";

    customerModal.classList.add("show");

    customerModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* -----------------------------------------
   CLOSE CUSTOMER MODAL
----------------------------------------- */

function closeCustomerModal() {

    customerModal.classList.remove("show");

    customerModal.setAttribute(
        "aria-hidden",
        "true"
    );
}

/* -----------------------------------------
   SAVE CUSTOMER
----------------------------------------- */

customerForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const name =
            document
                .getElementById("customerName")
                .value
                .trim();

        const phone =
            document
                .getElementById("customerPhone")
                .value
                .trim();

        const email =
            document
                .getElementById("customerEmail")
                .value
                .trim();

        const status =
            document
                .getElementById("customerStatus")
                .value;


        /* BASIC VALIDATION */

        if (!name || !phone) {

            showToast(
                "Missing Information",
                "Please enter the customer name and phone number.",
                "!"
            );

            return;
        }


        /* CHECK FOR DUPLICATE PHONE */

        const existingCustomer =
            customers.find(
                customer =>
                    customer.phone === phone
            );


        if (existingCustomer) {

            showToast(
                "Customer Exists",
                "A customer with this phone number already exists.",
                "!"
            );

            return;
        }


        /* CREATE CUSTOMER */

        const newCustomer = {

            id: Date.now(),

            name: name,

            phone: phone,

            email: email,

            status: status,

            totalPurchases: 0,

            createdAt:
                new Date().toISOString()

        };


        /* ADD CUSTOMER */

        customers.unshift(newCustomer);


        /* SAVE TO LOCAL STORAGE */

        localStorage.setItem(
            "bizmanager_customers",
            JSON.stringify(customers)
        );


        /* UPDATE DISPLAY */

        renderCustomers();

        updateCustomerSummary();


        /* CLOSE MODAL */

        closeCustomerModal();


        /* SUCCESS MESSAGE */

        showToast(
            "Customer Added",
            `${name} has been added successfully.`,
            "✓"
        );

    }
);
/* -----------------------------------------
   RENDER CUSTOMERS
----------------------------------------- */

function renderCustomers(
    searchTerm = ""
) {

    const table =
        document.getElementById(
            "customersTable"
        );

    const emptyState =
        document.getElementById(
            "customersEmptyState"
        );


    if (!table) return;


    table.innerHTML = "";


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const filteredCustomers =
        customers.filter(customer => {

            return (
                customer.name
                    .toLowerCase()
                    .includes(search)

                ||

                customer.phone
                    .toLowerCase()
                    .includes(search)

                ||

                customer.email
                    .toLowerCase()
                    .includes(search)
            );

        });


    if (filteredCustomers.length === 0) {

        emptyState.style.display =
            "block";

        return;
    }


    emptyState.style.display =
        "none";


    filteredCustomers.forEach(
        customer => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <div class="customer-cell">

                        <div class="small-avatar">
                            ${getInitials(customer.name)}
                        </div>

                        <strong>
                            ${escapeHTML(customer.name)}
                        </strong>

                    </div>
                </td>


                <td>
                    ${escapeHTML(customer.phone)}
                </td>


                <td>
                    ${customer.email
                        ? escapeHTML(customer.email)
                        : "—"}
                </td>


                <td>
                    KSh ${formatNumber(
                        customer.totalPurchases
                    )}
                </td>


                <td>

                    <span class="stock-badge ${
                        customer.status === "Active"
                            ? "available"
                            : "low"
                    }">

                        ${customer.status}

                    </span>

                </td>


                <td>

                    <button
                        class="table-action"
                        onclick="deleteCustomer(${customer.id})"
                        title="Delete customer">

                        🗑

                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* -----------------------------------------
   CUSTOMER INITIALS
----------------------------------------- */

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


/* -----------------------------------------
   DELETE CUSTOMER
----------------------------------------- */

function deleteCustomer(id) {

    const customer =
        customers.find(
            item => item.id === id
        );


    if (!customer) return;


    const confirmed =
        confirm(
            `Delete ${customer.name} from your customers?`
        );


    if (!confirmed) return;


    customers =
        customers.filter(
            item => item.id !== id
        );


    localStorage.setItem(
        "bizmanager_customers",
        JSON.stringify(customers)
    );


    renderCustomers();

    updateCustomerSummary();


    showToast(
        "Customer Deleted",
        "The customer was removed successfully.",
        "✓"
    );

}


/* -----------------------------------------
   CUSTOMER SUMMARY
----------------------------------------- */

function updateCustomerSummary() {

    const total =
        customers.length;


    const active =
        customers.filter(
            customer =>
                customer.status === "Active"
        ).length;


    const salesTotal =
        customers.reduce(
            (sum, customer) =>
                sum + Number(
                    customer.totalPurchases || 0
                ),
            0
        );


    const totalElement =
        document.getElementById(
            "totalCustomers"
        );

    const activeElement =
        document.getElementById(
            "activeCustomers"
        );

    const salesElement =
        document.getElementById(
            "customerSalesTotal"
        );


    if (totalElement)
        totalElement.textContent = total;


    if (activeElement)
        activeElement.textContent = active;


    if (salesElement)
        salesElement.textContent =
            `KSh ${formatNumber(salesTotal)}`;

}


/* -----------------------------------------
   CUSTOMER SEARCH
----------------------------------------- */

if (customerSearch) {

    customerSearch.addEventListener(
        "input",
        function() {

            renderCustomers(
                this.value
            );

        }
    );

}


/* -----------------------------------------
   INITIALIZE CUSTOMERS
----------------------------------------- */

renderCustomers();

updateCustomerSummary();
/* =====================================================
   INVOICE MANAGEMENT
===================================================== */

let invoices =
    JSON.parse(
        localStorage.getItem("bizmanager_invoices")
    ) || [];


/* -----------------------------------------
   CREATE INVOICE FROM LATEST SALE
----------------------------------------- */

function createInvoiceFromLatestSale() {

    if (!sales || sales.length === 0) {

        showToast(
            "No Sales Available",
            "Record a sale before creating an invoice.",
            "!"
        );

        return;
    }


    const latestSale =
        [...sales].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        )[0];


    openInvoice(latestSale);

}


/* -----------------------------------------
   OPEN INVOICE
----------------------------------------- */

function openInvoice(sale) {
/* BUSINESS INFORMATION */

const invoiceBusinessName =
    document.getElementById(
        "invoiceBusinessName"
    );

const invoiceBusinessContact =
    document.getElementById(
        "invoiceBusinessContact"
    );

const invoiceBusinessLocation =
    document.getElementById(
        "invoiceBusinessLocation"
    );

const invoiceFooterText =
    document.getElementById(
        "invoiceFooterText"
    );


if (invoiceBusinessName) {

    invoiceBusinessName.textContent =
        businessSettings.name ||
        "BIZMANAGER";

}


if (invoiceBusinessContact) {

    invoiceBusinessContact.textContent =
        businessSettings.phone ||
        "+254743551445";

}


if (invoiceBusinessLocation) {

    invoiceBusinessLocation.textContent =
        businessSettings.location ||
        "Kenya";

}


if (invoiceFooterText) {

    invoiceFooterText.textContent =
        businessSettings.invoiceFooter ||
        "Thank you for your business.";

}
    const invoiceId =
        `INV-${String(
            invoices.length + 1
        ).padStart(6, "0")}`;


    const customer =
        customers.find(
            item =>
                item.name.toLowerCase() ===
                (sale.customer || "").toLowerCase()
        );


    document.getElementById(
        "invoiceNumber"
    ).textContent = invoiceId;


    document.getElementById(
        "invoiceCustomer"
    ).textContent =
        sale.customer || "Walk-in Customer";


    document.getElementById(
        "invoiceCustomerPhone"
    ).textContent =
        customer
            ? customer.phone
            : "—";


    document.getElementById(
        "invoiceDate"
    ).textContent =
        new Date(
            sale.date
        ).toLocaleDateString();


    document.getElementById(
        "invoiceProduct"
    ).textContent =
        sale.productName;


    document.getElementById(
        "invoiceQuantity"
    ).textContent =
        sale.quantity;


    const unitPrice =
        Number(sale.total || 0) /
        Number(sale.quantity || 1);


    document.getElementById(
        "invoicePrice"
    ).textContent =
        `KSh ${formatNumber(unitPrice)}`;


    document.getElementById(
        "invoiceTotal"
    ).textContent =
        `KSh ${formatNumber(sale.total)}`;


    document.getElementById(
        "invoiceGrandTotal"
    ).textContent =
        `KSh ${formatNumber(sale.total)}`;


    document.getElementById(
        "invoicePayment"
    ).textContent =
        sale.payment || "—";


    const invoice = {

        id: invoiceId,

        saleId: sale.id,

        customer:
            sale.customer ||
            "Walk-in Customer",

        amount:
            Number(sale.total || 0),

        payment:
            sale.payment,

        date:
            sale.date

    };


    const existing =
        invoices.find(
            item =>
                item.saleId === sale.id
        );


    if (!existing) {

        invoices.unshift(invoice);

        localStorage.setItem(
            "bizmanager_invoices",
            JSON.stringify(invoices)
        );

    }


    renderInvoices();

    updateInvoiceSummary();


    const modal =
        document.getElementById(
            "invoiceModal"
        );


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* -----------------------------------------
   CLOSE INVOICE
----------------------------------------- */

function closeInvoiceModal() {

    const modal =
        document.getElementById(
            "invoiceModal"
        );


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* -----------------------------------------
   RENDER INVOICES
----------------------------------------- */

function renderInvoices() {

    const table =
        document.getElementById(
            "invoicesTable"
        );

    const empty =
        document.getElementById(
            "invoicesEmptyState"
        );


    if (!table) return;


    table.innerHTML = "";


    if (invoices.length === 0) {

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    invoices.forEach(invoice => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(invoice.id)}
                </strong>
            </td>

            <td>
                ${escapeHTML(invoice.customer)}
            </td>

            <td>
                <strong>
                    KSh ${formatNumber(
                        invoice.amount
                    )}
                </strong>
            </td>

            <td>
                <span class="stock-badge available">
                    ${escapeHTML(
                        invoice.payment || "Paid"
                    )}
                </span>
            </td>

            <td>
                ${new Date(
                    invoice.date
                ).toLocaleDateString()}
            </td>

            <td>

                <button
                    class="table-action"
                    onclick="openInvoiceById('${invoice.id}')"
                    title="View invoice">

                    🧾

                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


/* -----------------------------------------
   OPEN EXISTING INVOICE
----------------------------------------- */

function openInvoiceById(invoiceId) {

    const invoice =
        invoices.find(
            item =>
                item.id === invoiceId
        );


    if (!invoice) return;


    const sale =
        sales.find(
            item =>
                item.id === invoice.saleId
        );


    if (!sale) {

        showToast(
            "Sale Not Found",
            "The original sale could not be found.",
            "!"
        );

        return;
    }


    openInvoice(sale);

}


/* -----------------------------------------
   INVOICE SUMMARY
----------------------------------------- */

function updateInvoiceSummary() {

    const total =
        invoices.length;


    const paid =
        invoices.filter(
            invoice =>
                invoice.payment &&
                invoice.payment.toLowerCase()
                    .includes("paid")
        ).length;


    const billed =
        invoices.reduce(
            (sum, invoice) =>
                sum +
                Number(
                    invoice.amount || 0
                ),
            0
        );


    const totalElement =
        document.getElementById(
            "totalInvoices"
        );

    const paidElement =
        document.getElementById(
            "paidInvoices"
        );

    const billedElement =
        document.getElementById(
            "totalBilled"
        );


    if (totalElement)
        totalElement.textContent =
            total;


    if (paidElement)
        paidElement.textContent =
            paid;


    if (billedElement)
        billedElement.textContent =
            `KSh ${formatNumber(billed)}`;

}


/* -----------------------------------------
   PRINT INVOICE
----------------------------------------- */

function printInvoice() {

    const invoiceContent =
        document.getElementById(
            "printInvoice"
        ).innerHTML;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Invoice</title>

            <style>

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding: 40px;

                    color: #111827;
                }

                table {
                    width: 100%;
                    border-collapse:
                        collapse;
                }

                th {
                    background:
                        #f1f5f9;

                    text-align:
                        left;

                    padding: 12px;
                }

                td {
                    padding: 12px;

                    border-bottom:
                        1px solid #e5e7eb;
                }

            </style>

        </head>

        <body>

            ${invoiceContent}

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

}


/* -----------------------------------------
   INITIALIZE INVOICES
----------------------------------------- */

renderInvoices();

updateInvoiceSummary();
/* -----------------------------------------
   INITIALIZE INVOICES
----------------------------------------- */

renderInvoices();

updateInvoiceSummary();
/* =========================================
   PREMIUM REPORTS & ANALYTICS ENGINE
========================================= */

function updateReportsDashboard() {

    /* -----------------------------------------
       BASIC TOTALS
    ----------------------------------------- */

    const totalRevenue =
        sales.reduce(
            (sum, sale) =>
                sum + Number(sale.total || 0),
            0
        );


    const totalSales =
        sales.length;


    const totalCustomers =
        customers.length;


    const totalProducts =
        products.length;


    /* -----------------------------------------
       UPDATE KPI CARDS
    ----------------------------------------- */

    const revenueElement =
        document.getElementById(
            "reportRevenue"
        );

    const salesElement =
        document.getElementById(
            "reportSales"
        );

    const customersElement =
        document.getElementById(
            "reportCustomers"
        );

    const productsElement =
        document.getElementById(
            "reportProducts"
        );


    if (revenueElement) {

        revenueElement.textContent =
            `KSh ${formatNumber(
                totalRevenue
            )}`;

    }


    if (salesElement) {

        salesElement.textContent =
            totalSales;

    }


    if (customersElement) {

        customersElement.textContent =
            totalCustomers;

    }


    if (productsElement) {

        productsElement.textContent =
            totalProducts;

    }


    /* -----------------------------------------
       INVENTORY ANALYSIS
    ----------------------------------------- */

    let availableStock = 0;

    let lowStock = 0;

    let outOfStock = 0;


    products.forEach(
        product => {

            const stock =
                Number(
                    product.stock || 0
                );


            if (stock <= 0) {

                outOfStock++;

            }

            else if (stock <= 5) {

                lowStock++;

            }

            else {

                availableStock++;

            }

        }
    );


    const availableElement =
        document.getElementById(
            "reportAvailableStock"
        );

    const lowElement =
        document.getElementById(
            "reportLowStock"
        );

    const outElement =
        document.getElementById(
            "reportOutOfStock"
        );


    if (availableElement)
        availableElement.textContent =
            availableStock;


    if (lowElement)
        lowElement.textContent =
            lowStock;


    if (outElement)
        outElement.textContent =
            outOfStock;


    /* -----------------------------------------
       SALES CHART
    ----------------------------------------- */

    renderReportSalesChart();


    /* -----------------------------------------
       TOP PRODUCTS
    ----------------------------------------- */

    renderTopProducts();

}


/* =========================================
   SALES PERFORMANCE CHART
========================================= */

function renderReportSalesChart() {

    const chart =
        document.getElementById(
            "reportSalesChart"
        );


    if (!chart) return;


    chart.innerHTML = "";


    /* LAST 7 DAYS */

    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );


        days.push({
            date: date,
            label: date.toLocaleDateString(
                "en-KE",
                {
                    weekday: "short"
                }
            ),
            revenue: 0
        });

    }


    /* CALCULATE REVENUE */

    sales.forEach(
        sale => {

            const saleDate =
                new Date(
                    sale.date
                );


            const day =
                days.find(
                    item =>
                        item.date.toDateString() ===
                        saleDate.toDateString()
                );


            if (day) {

                day.revenue +=
                    Number(
                        sale.total || 0
                    );

            }

        }
    );


    const maxRevenue =
        Math.max(
            ...days.map(
                day => day.revenue
            ),
            1
        );


    /* CREATE BARS */

    days.forEach(
        day => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                height: 100%;
                gap: 8px;
            `;


            const value =
                document.createElement(
                    "span"
                );


            value.textContent =
                `KSh ${formatNumber(
                    day.revenue
                )}`;


            value.style.cssText = `
                font-size: 10px;
                opacity: 0.6;
                white-space: nowrap;
            `;


            const bar =
                document.createElement(
                    "div"
                );


            const height =
                day.revenue > 0
                    ? Math.max(
                        (day.revenue /
                            maxRevenue) *
                            190,
                        12
                    )
                    : 6;


            bar.className =
                "chart-bar";


            bar.style.height =
                `${height}px`;


            bar.title =
                `${day.label}: KSh ${formatNumber(
                    day.revenue
                )}`;


            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                day.label;


            label.style.cssText = `
                font-size: 11px;
                opacity: 0.6;
            `;


            wrapper.appendChild(
                value
            );

            wrapper.appendChild(
                bar
            );

            wrapper.appendChild(
                label
            );


            chart.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================
   TOP SELLING PRODUCTS
========================================= */

function renderTopProducts() {

    const table =
        document.getElementById(
            "topProductsTable"
        );


    const emptyState =
        document.getElementById(
            "topProductsEmpty"
        );


    if (!table) return;


    table.innerHTML = "";


    const productStats = {};


    /* CALCULATE PRODUCT SALES */

    sales.forEach(
        sale => {

            const productName =
                sale.productName ||
                "Unknown Product";


            if (
                !productStats[
                    productName
                ]
            ) {

                productStats[
                    productName
                ] = {

                    quantity: 0,

                    revenue: 0

                };

            }


            productStats[
                productName
            ].quantity +=
                Number(
                    sale.quantity || 0
                );


            productStats[
                productName
            ].revenue +=
                Number(
                    sale.total || 0
                );

        }
    );


    const productsArray =
        Object.entries(
            productStats
        )
        .map(
            ([name, data]) => ({

                name: name,

                quantity:
                    data.quantity,

                revenue:
                    data.revenue

            })
        )
        .sort(
            (a, b) =>
                b.revenue -
                a.revenue
        );


    if (
        productsArray.length === 0
    ) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    /* SHOW TOP 10 */

    productsArray
        .slice(0, 10)
        .forEach(
            product => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${formatNumber(
                            product.quantity
                        )}
                    </td>

                    <td>
                        <strong>
                            KSh ${formatNumber(
                                product.revenue
                            )}
                        </strong>
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

}


/* =========================================
   INITIALIZE REPORTS
========================================= */

updateReportsDashboard();
/* =========================================
   BUSINESS SETTINGS MANAGEMENT
========================================= */

let businessSettings =
    JSON.parse(
        localStorage.getItem(
            "bizmanager_settings"
        )
    ) || {

        name: "",

        phone: "",

        email: "",

        location: "",

        currency: "KSh",

        invoicePrefix: "INV",

        invoiceFooter:
            "Thank you for your business."

    };


/* -----------------------------------------
   LOAD SETTINGS
----------------------------------------- */

function loadBusinessSettings() {

    const name =
        document.getElementById(
            "businessName"
        );

    const phone =
        document.getElementById(
            "businessPhone"
        );

    const email =
        document.getElementById(
            "businessEmail"
        );

    const location =
        document.getElementById(
            "businessLocation"
        );

    const currency =
        document.getElementById(
            "businessCurrency"
        );

    const prefix =
        document.getElementById(
            "invoicePrefix"
        );

    const footer =
        document.getElementById(
            "invoiceFooter"
        );


    if (name)
        name.value =
            businessSettings.name || "";


    if (phone)
        phone.value =
            businessSettings.phone || "";


    if (email)
        email.value =
            businessSettings.email || "";


    if (location)
        location.value =
            businessSettings.location || "";


    if (currency)
        currency.value =
            businessSettings.currency ||
            "KSh";


    if (prefix)
        prefix.value =
            businessSettings.invoicePrefix ||
            "INV";


    if (footer)
        footer.value =
            businessSettings.invoiceFooter ||
            "Thank you for your business.";

}


/* -----------------------------------------
   SAVE SETTINGS
----------------------------------------- */

const businessSettingsForm =
    document.getElementById(
        "businessSettingsForm"
    );


if (businessSettingsForm) {

    businessSettingsForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            businessSettings = {

                name:
                    document.getElementById(
                        "businessName"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "businessPhone"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "businessEmail"
                    ).value.trim(),

                location:
                    document.getElementById(
                        "businessLocation"
                    ).value.trim(),

                currency:
                    document.getElementById(
                        "businessCurrency"
                    ).value,

                invoicePrefix:
                    document.getElementById(
                        "invoicePrefix"
                    ).value
                        .trim()
                        .toUpperCase(),

                invoiceFooter:
                    document.getElementById(
                        "invoiceFooter"
                    ).value.trim()

            };


            localStorage.setItem(
                "bizmanager_settings",
                JSON.stringify(
                    businessSettings
                )
            );


            showToast(
                "Settings Saved",
                "Your business settings were saved successfully.",
                "✓"
            );

        }
    );

}


/* -----------------------------------------
   INITIALIZE SETTINGS
----------------------------------------- */

loadBusinessSettings();

/* =========================================================
   PREMIUM ANALYTICS
========================================================= */
function updatePremiumAnalytics() {
    const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const totalStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const low = products.filter(product => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 10).length;
    const out = products.filter(product => Number(product.stock || 0) <= 0).length;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set("analyticsRevenue", `KSh ${revenue.toLocaleString()}`);
    set("analyticsSales", sales.length.toLocaleString());
    set("analyticsCustomers", customers.length.toLocaleString());
    set("analyticsProducts", products.length.toLocaleString());
    set("availableStock", totalStock.toLocaleString());
    set("lowStock", low.toLocaleString());
    set("outOfStock", out.toLocaleString());
    const max = Math.max(products.length, 1);
    [
        ["availableStockBar", Math.min(100, totalStock > 0 ? 100 : 0)],
        ["lowStockBar", Math.min(100, low / max * 100)],
        ["outOfStockBar", Math.min(100, out / max * 100)]
    ].forEach(([id, width]) => { const el = document.getElementById(id); if (el) el.style.width = `${width}%`; });

    const chart = document.getElementById("salesChart");
    if (!chart) return;
    const days = Array.from({length:7}, (_, i) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(6-i)); return d; });
    const values = days.map(day => sales.filter(s => { const d = new Date(s.date); return d.toDateString() === day.toDateString(); }).reduce((sum,s) => sum + Number(s.total||0),0));
    const peak = Math.max(...values, 1);
    chart.innerHTML = values.map((value,i) => `<div class="chart-column"><div class="chart-value">${value ? `KSh ${Math.round(value).toLocaleString()}` : ""}</div><div class="chart-bar" style="height:${Math.max(8, value/peak*150)}px"></div><span>${days[i].toLocaleDateString(undefined,{weekday:'short'})}</span></div>`).join("");
}

window.updatePremiumAnalytics = updatePremiumAnalytics;
const originalUpdateDashboard = window.updateDashboard;
window.updateDashboard = function() {
    if (typeof originalUpdateDashboard === "function") originalUpdateDashboard();
    updatePremiumAnalytics();
};
setTimeout(updatePremiumAnalytics, 50);
