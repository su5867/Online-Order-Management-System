// Admin Dashboard JavaScript

const adminApiBaseUrl = 'http://localhost:8080/api';

// Utility function to show messages
function showAdminMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

function getAdminToken() {
    return localStorage.getItem('token');
}

function isAdminLoggedIn() {
    // For simplicity, check if token exists
    return !!getAdminToken();
}

function logoutAdmin() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const [productsRes, ordersRes, usersRes, revenueRes] = await Promise.all([
            fetch(`${adminApiBaseUrl}/products`),
            fetch(`${adminApiBaseUrl}/orders`),
            fetch(`${adminApiBaseUrl}/users`),
            fetch(`${adminApiBaseUrl}/reports/revenue`)
        ]);

        if (productsRes.ok && ordersRes.ok && usersRes.ok && revenueRes.ok) {
            const products = await productsRes.json();
            const orders = await ordersRes.json();
            const users = await usersRes.json();
            const revenue = await revenueRes.json();

            document.getElementById('totalProducts').textContent = products.length;
            document.getElementById('totalOrders').textContent = orders.length;
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('totalRevenue').textContent = `$${revenue.total || 0}`;
        } else {
            showAdminMessage('Failed to load dashboard stats', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Load products table
async function loadProductsTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/products`);
        if (response.ok) {
            const products = await response.json();
            displayProductsTable(products);
        } else {
            showAdminMessage('Failed to load products', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

function displayProductsTable(products) {
    const container = document.getElementById('productsTable');
    if (!container) return;

    let html = `<table>
        <thead>
            <tr>
                <th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    products.forEach(p => {
        html += `<tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.category ? p.category.name : ''}</td>
            <td>
                <button class="btn btn-small btn-edit" onclick="openEditProductModal(${p.id})">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Open modal for adding or editing product
function openEditProductModal(productId) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');

    if (!modal || !modalTitle || !productForm) return;

    if (productId) {
        modalTitle.textContent = 'Edit Product';
        // Load product data and fill form
        fetch(`${adminApiBaseUrl}/products/${productId}`)
            .then(res => res.json())
            .then(product => {
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productCategory').value = product.category ? product.category.id : '';
                document.getElementById('productImageUrl').value = product.imageUrl || '';
            })
            .catch(() => showAdminMessage('Failed to load product details', 'error'));
    } else {
        modalTitle.textContent = 'Add Product';
        productForm.reset();
        document.getElementById('productId').value = '';
    }

    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save product (add or update)
async function saveProduct(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const categoryId = document.getElementById('productCategory').value;
    const imageUrl = document.getElementById('productImageUrl').value;

    if (!name || !description || isNaN(price) || !categoryId) {
        showAdminMessage('Please fill all required fields', 'error');
        return;
    }

    const productData = {
        name,
        description,
        price,
        category: { id: parseInt(categoryId) },
        imageUrl
    };

    try {
        let response;
        if (productId) {
            response = await fetch(`${adminApiBaseUrl}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch(`${adminApiBaseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            showAdminMessage('Product saved successfully', 'success');
            closeModal();
            loadProductsTable();
        } else {
            const error = await response.text();
            showAdminMessage(error || 'Failed to save product', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${adminApiBaseUrl}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });

        if (response.ok) {
            showAdminMessage('Product deleted successfully', 'success');
            loadProductsTable();
        } else {
            showAdminMessage('Failed to delete product', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Load categories for product form
async function loadCategories() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/categories`);
        if (response.ok) {
            const categories = await response.json();
            const categorySelect = document.getElementById('productCategory');
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } else {
            showAdminMessage('Failed to load categories', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Load clients table
async function loadClientsTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/users?role=CUSTOMER`);
        if (response.ok) {
            const clients = await response.json();
            displayClientsTable(clients);
        } else {
            showAdminMessage('Failed to load clients', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

function displayClientsTable(clients) {
    const container = document.getElementById('clientsTable');
    if (!container) return;

    let html = `<table>
        <thead>
            <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    clients.forEach(client => {
        const statusBadge = client.enabled ? 'Active' : 'Inactive';
        const statusClass = client.enabled ? 'status-active' : 'status-inactive';

        html += `<tr>
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${statusBadge}</span></td>
            <td>
                <button class="btn btn-small btn-edit" onclick="editClient(${client.id})">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteClient(${client.id})">Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Load restaurants table
async function loadRestaurantsTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/users?role=RESTAURANT`);
        if (response.ok) {
            const restaurants = await response.json();
            displayRestaurantsTable(restaurants);
        } else {
            showAdminMessage('Failed to load restaurants', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

function displayRestaurantsTable(restaurants) {
    const container = document.getElementById('restaurantsTable');
    if (!container) return;

    let html = `<table>
        <thead>
            <tr>
                <th>ID</th><th>Name</th><th>Cuisine</th><th>Owner</th><th>Email</th><th>Status</th><th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    restaurants.forEach(restaurant => {
        const statusBadge = restaurant.enabled ? 'Active' : 'Inactive';
        const statusClass = restaurant.enabled ? 'status-active' : 'status-inactive';

        html += `<tr>
            <td>${restaurant.id}</td>
            <td>${restaurant.name}</td>
            <td>${restaurant.cuisine || 'N/A'}</td>
            <td>${restaurant.owner || 'N/A'}</td>
            <td>${restaurant.email}</td>
            <td><span class="status-badge ${statusClass}">${statusBadge}</span></td>
            <td>
                <button class="btn btn-small btn-edit" onclick="editRestaurant(${restaurant.id})">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteRestaurant(${restaurant.id})">Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Client management functions
function editClient(clientId) {
    // Implement edit client functionality
    showAdminMessage('Edit client functionality not implemented yet', 'info');
}

async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
        const response = await fetch(`${adminApiBaseUrl}/users/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });

        if (response.ok) {
            showAdminMessage('Client deleted successfully', 'success');
            loadClientsTable();
        } else {
            showAdminMessage('Failed to delete client', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Restaurant management functions
function editRestaurant(restaurantId) {
    // Implement edit restaurant functionality
    showAdminMessage('Edit restaurant functionality not implemented yet', 'info');
}

async function deleteRestaurant(restaurantId) {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
        const response = await fetch(`${adminApiBaseUrl}/users/${restaurantId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });

        if (response.ok) {
            showAdminMessage('Restaurant deleted successfully', 'success');
            loadRestaurantsTable();
        } else {
            showAdminMessage('Failed to delete restaurant', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdminLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    loadDashboardStats();
    loadProductsTable();
    loadCategories();
    loadClientsTable();
    loadRestaurantsTable();

    const modal = document.getElementById('productModal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);

    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', saveProduct);

    const addProductBtn = document.getElementById('addProductBtn');
    addProductBtn.addEventListener('click', () => openEditProductModal(null));

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutAdmin();
    });
});
