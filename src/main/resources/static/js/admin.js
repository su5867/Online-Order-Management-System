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
        padding: 12px 20px;
        background-color: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

function getAdminToken() {
    return localStorage.getItem('token');
}

function isAdminLoggedIn() {
    return !!getAdminToken();
}

function logoutAdmin() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Image preview function
function updateImagePreview(url) {
    const preview = document.getElementById('imagePreview');
    if (url) {
        preview.src = url;
        preview.classList.add('visible');
    } else {
        preview.classList.remove('visible');
    }
}

// Section navigation functions
function showDashboard() {
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('userManagementSection').style.display = 'none';
}

function showUserManagement() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('userManagementSection').style.display = 'block';
    loadUsersTable();
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const [productsRes, ordersRes, usersRes, revenueRes] = await Promise.all([
            fetch(`${adminApiBaseUrl}/products`, {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            }),
            fetch(`${adminApiBaseUrl}/admin/orders`, {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            }),
            fetch(`${adminApiBaseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            }),
            fetch(`${adminApiBaseUrl}/admin/reports/revenue`, {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            })
        ]);

        let products = [], orders = [], users = [], revenue = { total: 0 };

        if (productsRes.ok) products = await productsRes.json();
        if (ordersRes.ok) orders = await ordersRes.json();
        if (usersRes.ok) users = await usersRes.json();
        if (revenueRes.ok) revenue = await revenueRes.json();

        // Use sample data if API returns empty
        if (products.length === 0) products = getSampleProducts();
        if (orders.length === 0) orders = getSampleOrders();
        if (users.length === 0) users = getSampleUsers();
        if (revenue.total === 0) revenue.total = 12500;

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalRevenue').textContent = `$${revenue.total.toLocaleString()}`;

        // Load charts
        loadSalesChart(orders);
        loadUsersChart(users);
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
        // Load sample data on error
        loadSampleData();
    }
}

// Load products table
async function loadProductsTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/products`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        let products = [];
        
        if (response.ok) {
            products = await response.json();
        } else {
            showAdminMessage('Failed to load products from API, using sample data', 'error');
            products = getSampleProducts();
        }
        
        displayProductsTable(products);
    } catch (error) {
        showAdminMessage('Network error. Using sample products data.', 'error');
        const products = getSampleProducts();
        displayProductsTable(products);
    }
}

function displayProductsTable(products) {
    const container = document.getElementById('productsTable');
    if (!container) return;

    let html = `<div class="table-container">
        <table>
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
                <button class="btn btn-small btn-edit" onclick="openEditProductModal(${p.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// Open modal for adding or editing product
function openEditProductModal(productId) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');

    if (!modal || !modalTitle) return;

    if (productId) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Product';
        // Load product data and fill form
        const products = getSampleProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category ? product.category.id : '';
            document.getElementById('productImageUrl').value = product.imageUrl || '';
            updateImagePreview(product.imageUrl);
        } else {
            showAdminMessage('Product not found', 'error');
            return;
        }
    } else {
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        updateImagePreview('');
    }

    modal.style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
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
            closeModal('productModal');
            loadProductsTable();
            loadDashboardStats(); // Refresh stats
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
            loadDashboardStats(); // Refresh stats
        } else {
            showAdminMessage('Failed to delete product', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/categories`);
        if (response.ok) {
            const categories = await response.json();
            const categorySelect = document.getElementById('productCategory');
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            
            // Sort categories by name for consistent ordering
            categories.sort((a, b) => a.name.localeCompare(b.name));
            
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } else {
            // Use sample categories if API fails
            showAdminMessage('Failed to load categories from API, using sample data', 'error');
            loadSampleCategories();
        }
    } catch (error) {
        showAdminMessage('Network error. Using sample categories.', 'error');
        loadSampleCategories();
    }
}

function loadSampleCategories() {
    const categories = [
        { id: 1, name: 'Appetizers' },
        { id: 2, name: 'Main Course' },
        { id: 3, name: 'Desserts' },
        { id: 4, name: 'Beverages' },
        { id: 5, name: 'Traditional Nepali' }
    ];
    
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categories.sort((a, b) => a.name.localeCompare(b.name));
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

// Load clients table
async function loadClientsTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        let clients = [];
        
        if (response.ok) {
            clients = await response.json();
            // Filter for customers only
            clients = clients.filter(user => user.role === 'CUSTOMER');
        } else {
            showAdminMessage('Failed to load clients from API, using sample data', 'error');
            clients = getSampleUsers().filter(user => user.role === 'CUSTOMER');
        }
        
        displayClientsTable(clients);
    } catch (error) {
        showAdminMessage('Network error. Using sample clients data.', 'error');
        const clients = getSampleUsers().filter(user => user.role === 'CUSTOMER');
        displayClientsTable(clients);
    }
}

function displayClientsTable(clients) {
    const container = document.getElementById('clientsTable');
    if (!container) return;

    let html = `<div class="table-container">
        <table>
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
                <button class="btn btn-small btn-edit" onclick="openEditUserModal(${client.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteUser(${client.id})"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// Load restaurants table
async function loadRestaurantsTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        let restaurants = [];
        
        if (response.ok) {
            restaurants = await response.json();
            // Filter for restaurants only
            restaurants = restaurants.filter(user => user.role === 'RESTAURANT');
        } else {
            showAdminMessage('Failed to load restaurants from API, using sample data', 'error');
            restaurants = getSampleRestaurants();
        }
        
        displayRestaurantsTable(restaurants);
    } catch (error) {
        showAdminMessage('Network error. Using sample restaurants data.', 'error');
        const restaurants = getSampleRestaurants();
        displayRestaurantsTable(restaurants);
    }
}

function displayRestaurantsTable(restaurants) {
    const container = document.getElementById('restaurantsTable');
    if (!container) return;

    let html = `<div class="table-container">
        <table>
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
                <button class="btn btn-small btn-edit" onclick="openEditUserModal(${restaurant.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteUser(${restaurant.id})"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// Load users table for user management section
async function loadUsersTable() {
    try {
        const response = await fetch(`${adminApiBaseUrl}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });
        let users = [];
        
        if (response.ok) {
            users = await response.json();
        } else {
            showAdminMessage('Failed to load users from API, using sample data', 'error');
            users = getAllSampleUsers();
        }
        
        displayUsersTable(users);
    } catch (error) {
        showAdminMessage('Network error. Using sample users data.', 'error');
        const users = getAllSampleUsers();
        displayUsersTable(users);
    }
}

function displayUsersTable(users) {
    const container = document.getElementById('usersTableBody');
    if (!container) return;

    let html = '';

    users.forEach(user => {
        const statusBadge = user.enabled ? 'Active' : 'Inactive';
        const statusClass = user.enabled ? 'status-active' : 'status-inactive';

        html += `<tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.phone || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${statusBadge}</span></td>
            <td>
                <button class="btn btn-small btn-edit" onclick="openEditUserModal(${user.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>`;
    });

    container.innerHTML = html;
    document.getElementById('userCount').textContent = `${users.length} users found`;
}

// Open modal for adding or editing user
function openEditUserModal(userId) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('userModalTitle');

    if (!modal || !modalTitle) return;

    if (userId) {
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit User';
        // Load user data and fill form
        const users = getAllSampleUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = ''; // Don't fill password for security
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.enabled;
        } else {
            showAdminMessage('User not found', 'error');
            return;
        }
    } else {
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add User';
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
    }

    modal.style.display = 'flex';
}

// Save user (add or update)
async function saveUser(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const phone = document.getElementById('userPhone').value;
    const role = document.getElementById('userRole').value;
    const enabled = document.getElementById('userStatus').value === 'true';

    if (!name || !email || !role || (!userId && !password)) {
        showAdminMessage('Please fill all required fields', 'error');
        return;
    }

    const userData = {
        name,
        email,
        role,
        enabled,
        phone: phone || null
    };

    // Only include password if it's provided (for new users or password changes)
    if (password) {
        userData.password = password;
    }

    try {
        let response;
        if (userId) {
            response = await fetch(`${adminApiBaseUrl}/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(userData)
            });
        } else {
            response = await fetch(`${adminApiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(userData)
            });
        }

        if (response.ok) {
            showAdminMessage('User saved successfully', 'success');
            closeModal('userModal');
            loadClientsTable();
            loadRestaurantsTable();
            loadUsersTable();
            loadDashboardStats(); // Refresh stats
        } else {
            const error = await response.text();
            showAdminMessage(error || 'Failed to save user', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`${adminApiBaseUrl}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAdminToken()}`
            }
        });

        if (response.ok) {
            showAdminMessage('User deleted successfully', 'success');
            loadClientsTable();
            loadRestaurantsTable();
            loadUsersTable();
            loadDashboardStats(); // Refresh stats
        } else {
            showAdminMessage('Failed to delete user', 'error');
        }
    } catch (error) {
        showAdminMessage('Network error. Please try again.', 'error');
    }
}

// Chart functions
function loadSalesChart(orders) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    const monthlyData = getMonthlySalesData(orders);

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Monthly Sales ($)',
                data: monthlyData.data,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sales Trend (Last 6 Months)',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function loadUsersChart(users) {
    const ctx = document.getElementById('usersChart');
    if (!ctx) return;
    
    const userStats = getUserStats(users);

    new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Active Users', 'Inactive Users'],
            datasets: [{
                data: [userStats.active, userStats.inactive],
                backgroundColor: ['#10b981', '#64748b'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'User Status Distribution',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Helper functions for charts
function getMonthlySalesData(orders) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [4500, 5200, 4800, 6100, 5500, 6200]; // Sample data

    // If we have real orders, calculate from them
    if (orders && orders.length > 0) {
        const monthlySales = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt || Date.now());
            const monthKey = date.toLocaleString('default', { month: 'short' });
            monthlySales[monthKey] = (monthlySales[monthKey] || 0) + (order.totalAmount || 100);
        });

        return {
            labels: Object.keys(monthlySales),
            data: Object.values(monthlySales)
        };
    }

    return { labels: months, data: data };
}

function getUserStats(users) {
    let active = 0, inactive = 0;

    if (users && users.length > 0) {
        users.forEach(user => {
            if (user.enabled) active++;
            else inactive++;
        });
    } else {
        active = 85; // Sample data
        inactive = 15;
    }

    return { active, inactive };
}

// Sample data functions
function getSampleProducts() {
    return [
        { id: 1, name: 'Nepali Mo:Mo', price: 150, category: { id: 5, name: 'Traditional Nepali' }, description: 'Delicious steamed dumplings with spicy sauce', imageUrl: '' },
        { id: 2, name: 'Chicken Chowmein', price: 200, category: { id: 2, name: 'Main Course' }, description: 'Stir-fried noodles with vegetables and chicken', imageUrl: '' },
        { id: 3, name: 'Buff Thukpa', price: 180, category: { id: 5, name: 'Traditional Nepali' }, description: 'Hearty noodle soup with buffalo meat', imageUrl: '' },
        { id: 4, name: 'Veg Pizza', price: 350, category: { id: 2, name: 'Main Course' }, description: '12-inch pizza with assorted vegetables', imageUrl: '' },
        { id: 5, name: 'Chicken Burger', price: 250, category: { id: 2, name: 'Main Course' }, description: 'Juicy chicken patty with fresh veggies', imageUrl: '' },
        { id: 6, name: 'Veg Burger', price: 220, category: { id: 2, name: 'Main Course' }, description: 'Plant-based patty with fresh veggies', imageUrl: '' },
        { id: 7, name: 'Fried Rice', price: 180, category: { id: 2, name: 'Main Course' }, description: 'Stir-fried rice with vegetables and eggs', imageUrl: '' }
    ];
}

function getSampleOrders() {
    return [
        { id: 1, totalAmount: 450, createdAt: '2024-01-15', status: 'DELIVERED' },
        { id: 2, totalAmount: 320, createdAt: '2024-01-16', status: 'PROCESSING' },
        { id: 3, totalAmount: 680, createdAt: '2024-01-17', status: 'SHIPPED' },
        { id: 4, totalAmount: 290, createdAt: '2024-01-18', status: 'PENDING' },
        { id: 5, totalAmount: 550, createdAt: '2024-01-19', status: 'DELIVERED' },
        { id: 6, totalAmount: 400, createdAt: '2024-01-20', status: 'DELIVERED' },
        { id: 7, totalAmount: 600, createdAt: '2024-01-21', status: 'PROCESSING' }
    ];
}

function getSampleUsers() {
    return [
        { id: 1, name: 'Ram Sharma', email: 'ram@example.com', phone: '9841000001', enabled: true, role: 'CUSTOMER' },
        { id: 2, name: 'Sita Thapa', email: 'sita@example.com', phone: '9841000002', enabled: true, role: 'CUSTOMER' },
        { id: 3, name: 'Hari Gurung', email: 'hari@example.com', phone: '9841000003', enabled: false, role: 'CUSTOMER' },
        { id: 4, name: 'Gita Rai', email: 'gita@example.com', phone: '9841000004', enabled: true, role: 'CUSTOMER' },
        { id: 5, name: 'Bikash Lama', email: 'bikash@example.com', phone: '9841000005', enabled: true, role: 'CUSTOMER' },
        { id: 6, name: 'Suman Karki', email: 'suman@example.com', phone: '9841000006', enabled: true, role: 'CUSTOMER' },
        { id: 7, name: 'Maya Shrestha', email: 'maya@example.com', phone: '9841000007', enabled: false, role: 'CUSTOMER' }
    ];
}

function getAllSampleUsers() {
    return [
        ...getSampleUsers(),
        { id: 101, name: 'Rajesh Shrestha', email: 'info@kathmandukitchen.com', phone: '9841000101', enabled: true, role: 'RESTAURANT' },
        { id: 102, name: 'Lhakpa Sherpa', email: 'contact@himalayanmomo.com', phone: '9841000102', enabled: true, role: 'RESTAURANT' },
        { id: 103, name: 'Bimala Maharjan', email: 'newaridine@example.com', phone: '9841000103', enabled: true, role: 'RESTAURANT' },
        { id: 104, name: 'Mohan Thakali', email: 'thakalifood@example.com', phone: '9841000104', enabled: false, role: 'RESTAURANT' },
        { id: 105, name: 'Ramesh Adhikari', email: 'pokharapizza@example.com', phone: '9841000105', enabled: true, role: 'RESTAURANT' },
        { id: 201, name: 'Admin User', email: 'admin@example.com', phone: '9841000201', enabled: true, role: 'ADMIN' },
        { id: 301, name: 'Delivery Person', email: 'delivery@example.com', phone: '9841000301', enabled: true, role: 'DELIVERY_STAFF' }
    ];
}

function getSampleRestaurants() {
    return [
        { id: 101, name: 'Kathmandu Kitchen', cuisine: 'Nepali, Indian', owner: 'Rajesh Shrestha', email: 'info@kathmandukitchen.com', enabled: true, role: 'RESTAURANT' },
        { id: 102, name: 'Himalayan Momo House', cuisine: 'Nepali, Tibetan', owner: 'Lhakpa Sherpa', email: 'contact@himalayanmomo.com', enabled: true, role: 'RESTAURANT' },
        { id: 103, name: 'Newari Dine', cuisine: 'Newari, Nepali', owner: 'Bimala Maharjan', email: 'newaridine@example.com', enabled: true, role: 'RESTAURANT' },
        { id: 104, name: 'Thakali Bhojanalaya', cuisine: 'Thakali, Nepali', owner: 'Mohan Thakali', email: 'thakalifood@example.com', enabled: false, role: 'RESTAURANT' },
        { id: 105, name: 'Pokhara Pizza Corner', cuisine: 'Italian, Continental', owner: 'Ramesh Adhikari', email: 'pokharapizza@example.com', enabled: true, role: 'RESTAURANT' }
    ];
}

function loadSampleData() {
    const products = getSampleProducts();
    const orders = getSampleOrders();
    const users = getSampleUsers();

    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalRevenue').textContent = '$12,500';

    loadSalesChart(orders);
    loadUsersChart(users);
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

    // Modal event listeners
    const productModal = document.getElementById('productModal');
    const closeProductModalBtn = document.getElementById('closeProductModalBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.getElementById('productForm');
    
    const userModal = document.getElementById('userModal');
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    const addUserBtn = document.getElementById('addUserBtn');
    const userForm = document.getElementById('userForm');
    
    const logoutBtn = document.getElementById('logoutBtn');
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const manageProductsBtn = document.getElementById('manageProductsBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');

    // Product modal handlers
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openEditProductModal(null);
        });
    }

    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', () => {
            closeModal('productModal');
        });
    }

    // User modal handlers
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            openEditUserModal(null);
        });
    }

    if (closeUserModalBtn) {
        closeUserModalBtn.addEventListener('click', () => {
            closeModal('userModal');
        });
    }

    // Navigation handlers
    if (manageUsersBtn) {
        manageUsersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showUserManagement();
        });
    }

    if (manageProductsBtn) {
        manageProductsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showDashboard();
        });
    }

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            showDashboard();
        });
    }

    // Form submission handlers
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }

    if (userForm) {
        userForm.addEventListener('submit', saveUser);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === productModal) {
            closeModal('productModal');
        }
        if (event.target === userModal) {
            closeModal('userModal');
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutAdmin();
        });
    }
});