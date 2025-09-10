// Restaurant Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeRestaurantDashboard();

    // Set up navigation
    setupNavigation();

    // Load initial data
    loadDashboardData();
    loadOrders();
    loadMenuItems();
    loadAnalytics();
});

// Global variables
let currentUser = null;
let orders = [];
let menuItems = [];
let categories = [];

// Initialize dashboard
function initializeRestaurantDashboard() {
    // Check if user is logged in and has restaurant role
    checkAuthentication();

    // Set up event listeners
    setupEventListeners();

    // Initialize charts
    initializeCharts();
}

// Check authentication and user role
function checkAuthentication() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Decode token to get user info
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = payload;

        if (currentUser.role !== 'RESTAURANT') {
            showToast('Access denied. Restaurant access required.', 'error');
            window.location.href = '/index.html';
            return;
        }

        // Update user info in header if needed
        updateUserInfo();
    } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('jwtToken');
        window.location.href = '/login.html';
    }
}

// Update user info in the dashboard
function updateUserInfo() {
    // Could add user name display if needed
    console.log('Restaurant user:', currentUser);
}

// Set up navigation
function setupNavigation() {
    const navButtons = {
        dashboardBtn: 'dashboardSection',
        ordersBtn: 'ordersSection',
        menuBtn: 'menuSection',
        analyticsBtn: 'analyticsSection'
    };

    Object.keys(navButtons).forEach(btnId => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showSection(navButtons[btnId]);
                updateActiveNav(btnId);
            });
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = ['dashboardSection', 'ordersSection', 'menuSection', 'analyticsSection'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Update active navigation
function updateActiveNav(activeBtnId) {
    const navButtons = ['dashboardBtn', 'ordersBtn', 'menuBtn', 'analyticsBtn'];
    navButtons.forEach(btnId => {
        const button = document.getElementById(btnId);
        if (button) {
            if (btnId === activeBtnId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Order filters
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    const orderDateFilter = document.getElementById('orderDateFilter');

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }

    if (orderDateFilter) {
        orderDateFilter.addEventListener('change', filterOrders);
    }

    // Menu filters
    const menuCategoryFilter = document.getElementById('menuCategoryFilter');
    const menuSearch = document.getElementById('menuSearch');

    if (menuCategoryFilter) {
        menuCategoryFilter.addEventListener('change', filterMenuItems);
    }

    if (menuSearch) {
        menuSearch.addEventListener('input', filterMenuItems);
    }

    // Add menu item button
    const addMenuItemBtn = document.getElementById('addMenuItemBtn');
    if (addMenuItemBtn) {
        addMenuItemBtn.addEventListener('click', () => openMenuItemModal());
    }

    // Modal close buttons
    const closeOrderDetailsModalBtn = document.getElementById('closeOrderDetailsModalBtn');
    const closeMenuItemModalBtn = document.getElementById('closeMenuItemModalBtn');

    if (closeOrderDetailsModalBtn) {
        closeOrderDetailsModalBtn.addEventListener('click', () => closeModal('orderDetailsModal'));
    }

    if (closeMenuItemModalBtn) {
        closeMenuItemModalBtn.addEventListener('click', () => closeModal('menuItemModal'));
    }

    // Menu item form
    const menuItemForm = document.getElementById('menuItemForm');
    if (menuItemForm) {
        menuItemForm.addEventListener('submit', handleMenuItemSubmit);
    }

    // Update order status button
    const updateOrderStatusBtn = document.getElementById('updateOrderStatusBtn');
    if (updateOrderStatusBtn) {
        updateOrderStatusBtn.addEventListener('click', updateOrderStatus);
    }

    // Print order button
    const printOrderBtn = document.getElementById('printOrderBtn');
    if (printOrderBtn) {
        printOrderBtn.addEventListener('click', printOrder);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Initialize charts
function initializeCharts() {
    // Performance chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
                datasets: [{
                    label: 'Orders',
                    data: [2, 5, 8, 12, 15, 18, 14, 10, 6],
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Revenue chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue (Rs.)',
                    data: [1200, 1500, 1800, 1600, 2100, 2400, 1900],
                    backgroundColor: '#ff6b35',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Order status chart
    const orderStatusCtx = document.getElementById('orderStatusChart');
    if (orderStatusCtx) {
        new Chart(orderStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'],
                datasets: [{
                    data: [5, 8, 12, 6, 15],
                    backgroundColor: [
                        '#ed8936',
                        '#4299e1',
                        '#f59e0b',
                        '#10b981',
                        '#48bb78'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load today's stats
        await loadTodayStats();

        // Load recent orders
        await loadRecentOrders();

        // Load popular items
        await loadPopularItems();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Load today's statistics
async function loadTodayStats() {
    try {
        const response = await fetch('/api/restaurant/stats/today', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
        } else {
            // Use mock data if API not available
            updateStatsDisplay({
                totalOrders: 24,
                pendingOrders: 5,
                completedOrders: 19,
                todayRevenue: 12500
            });
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Use mock data
        updateStatsDisplay({
            totalOrders: 24,
            pendingOrders: 5,
            completedOrders: 19,
            todayRevenue: 12500
        });
    }
}

// Update stats display
function updateStatsDisplay(stats) {
    document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
    document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
    document.getElementById('completedOrders').textContent = stats.completedOrders || 0;
    document.getElementById('todayRevenue').textContent = `Rs. ${stats.todayRevenue || 0}`;
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch('/api/restaurant/orders/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            const recentOrders = await response.json();
            displayRecentOrders(recentOrders);
        } else {
            // Use mock data
            displayRecentOrders([
                { id: 1, customerName: 'John Doe', total: 450, status: 'PENDING', orderTime: '10:30 AM' },
                { id: 2, customerName: 'Jane Smith', total: 320, status: 'CONFIRMED', orderTime: '10:15 AM' },
                { id: 3, customerName: 'Bob Johnson', total: 680, status: 'PREPARING', orderTime: '10:00 AM' }
            ]);
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        // Use mock data
        displayRecentOrders([
            { id: 1, customerName: 'John Doe', total: 450, status: 'PENDING', orderTime: '10:30 AM' },
            { id: 2, customerName: 'Jane Smith', total: 320, status: 'CONFIRMED', orderTime: '10:15 AM' },
            { id: 3, customerName: 'Bob Johnson', total: 680, status: 'PREPARING', orderTime: '10:00 AM' }
        ]);
    }
}

// Display recent orders
function displayRecentOrders(recentOrders) {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;

    container.innerHTML = '';

    recentOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-info">
                <h4>Order #${order.id}</h4>
                <p>${order.customerName} - Rs. ${order.total}</p>
            </div>
            <div class="order-meta">
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                <small>${order.orderTime}</small>
            </div>
        `;
        container.appendChild(orderElement);
    });
}

// Load popular items
async function loadPopularItems() {
    try {
        const response = await fetch('/api/restaurant/items/popular', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            const popularItems = await response.json();
            displayPopularItems(popularItems);
        } else {
            // Use mock data
            displayPopularItems([
                { name: 'Chicken Momo', image: '/images/momo.jpg', orders: 45 },
                { name: 'Buff Thukpa', image: '/images/thukpa.jpg', orders: 32 },
                { name: 'Veg Fried Rice', image: '/images/fried-rice.jpg', orders: 28 }
            ]);
        }
    } catch (error) {
        console.error('Error loading popular items:', error);
        // Use mock data
        displayPopularItems([
            { name: 'Chicken Momo', image: '/images/momo.jpg', orders: 45 },
            { name: 'Buff Thukpa', image: '/images/thukpa.jpg', orders: 32 },
            { name: 'Veg Fried Rice', image: '/images/fried-rice.jpg', orders: 28 }
        ]);
    }
}

// Display popular items
function displayPopularItems(popularItems) {
    const container = document.getElementById('popularItemsList');
    if (!container) return;

    container.innerHTML = '';

    popularItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'popular-item';
        itemElement.innerHTML = `
            <img src="${item.image || '/images/default-food.jpg'}" alt="${item.name}" onerror="this.src='/images/default-food.jpg'">
            <div class="popular-item-info">
                <h4>${item.name}</h4>
                <p>${item.orders || 0} orders today</p>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/restaurant/orders', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            orders = await response.json();
            displayOrders(orders);
        } else {
            // Use mock data
            orders = [
                {
                    id: 1,
                    customerName: 'John Doe',
                    items: ['Chicken Momo', 'Buff Thukpa'],
                    total: 450,
                    status: 'PENDING',
                    orderTime: '2024-09-11T10:30:00',
                    deliveryAddress: 'Kathmandu, Nepal'
                },
                {
                    id: 2,
                    customerName: 'Jane Smith',
                    items: ['Veg Fried Rice', 'Spring Rolls'],
                    total: 320,
                    status: 'CONFIRMED',
                    orderTime: '2024-09-11T10:15:00',
                    deliveryAddress: 'Pokhara, Nepal'
                }
            ];
            displayOrders(orders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

// Display orders
function displayOrders(ordersToDisplay) {
    const tableBody = document.getElementById('ordersTableBody');
    const orderCount = document.getElementById('orderCount');

    if (!tableBody || !orderCount) return;

    tableBody.innerHTML = '';
    orderCount.textContent = `${ordersToDisplay.length} orders found`;

    ordersToDisplay.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.items.join(', ')}</td>
            <td>Rs. ${order.total}</td>
            <td><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>${new Date(order.orderTime).toLocaleString()}</td>
            <td class="order-actions">
                <button class="btn-action btn-view" onclick="viewOrderDetails(${order.id})">View</button>
                <button class="btn-action btn-edit" onclick="updateOrderStatusFromTable(${order.id})">Update</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter orders
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('orderDateFilter').value;

    let filteredOrders = orders;

    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    if (dateFilter) {
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderTime).toDateString();
            const filterDate = new Date(dateFilter).toDateString();
            return orderDate === filterDate;
        });
    }

    displayOrders(filteredOrders);
}

// Load menu items
async function loadMenuItems() {
    try {
        const response = await fetch('/api/restaurant/menu-items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            menuItems = await response.json();
            displayMenuItems(menuItems);
        } else {
            // Use mock data
            menuItems = [
                {
                    id: 1,
                    name: 'Chicken Momo',
                    description: 'Steamed dumplings filled with spiced chicken',
                    price: 150,
                    category: 'Momos',
                    imageUrl: '/images/chicken-momo.jpg',
                    stock: 50,
                    available: true
                },
                {
                    id: 2,
                    name: 'Buff Thukpa',
                    description: 'Traditional Tibetan noodle soup with buffalo meat',
                    price: 180,
                    category: 'Soups',
                    imageUrl: '/images/buff-thukpa.jpg',
                    stock: 30,
                    available: true
                }
            ];
            displayMenuItems(menuItems);
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
        showToast('Error loading menu items', 'error');
    }
}

// Display menu items
function displayMenuItems(itemsToDisplay) {
    const container = document.getElementById('menuItemsGrid');
    const itemCount = document.getElementById('menuItemCount');

    if (!container || !itemCount) return;

    container.innerHTML = '';
    itemCount.textContent = `${itemsToDisplay.length} items found`;

    itemsToDisplay.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        itemCard.innerHTML = `
            <img src="${item.imageUrl || '/images/default-food.jpg'}" alt="${item.name}" class="menu-item-image" onerror="this.src='/images/default-food.jpg'">
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <span class="menu-item-price">Rs. ${item.price}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-meta">
                    <span class="menu-item-category">${item.category}</span>
                    <span class="menu-item-stock">Stock: ${item.stock}</span>
                </div>
                <div class="menu-item-actions">
                    <button class="btn btn-primary" onclick="editMenuItem(${item.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(itemCard);
    });
}

// Filter menu items
function filterMenuItems() {
    const categoryFilter = document.getElementById('menuCategoryFilter').value;
    const searchTerm = document.getElementById('menuSearch').value.toLowerCase();

    let filteredItems = menuItems;

    if (categoryFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === categoryFilter);
    }

    if (searchTerm) {
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }

    displayMenuItems(filteredItems);
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch('/api/restaurant/analytics', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            const analytics = await response.json();
            displayAnalytics(analytics);
        } else {
            // Use mock data
            displayAnalytics({
                topSellingItems: [
                    { name: 'Chicken Momo', sales: 45, revenue: 6750 },
                    { name: 'Buff Thukpa', sales: 32, revenue: 5760 },
                    { name: 'Veg Fried Rice', sales: 28, revenue: 3920 }
                ]
            });
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Use mock data
        displayAnalytics({
            topSellingItems: [
                { name: 'Chicken Momo', sales: 45, revenue: 6750 },
                { name: 'Buff Thukpa', sales: 32, revenue: 5760 },
                { name: 'Veg Fried Rice', sales: 28, revenue: 3920 }
            ]
        });
    }
}

// Display analytics
function displayAnalytics(analytics) {
    const container = document.getElementById('topSellingItems');
    if (!container) return;

    container.innerHTML = '';

    analytics.topSellingItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'analytics-item';
        itemElement.innerHTML = `
            <div class="analytics-item-info">
                <h4>${item.name}</h4>
                <p>${item.sales} units sold</p>
            </div>
            <div class="analytics-item-value">Rs. ${item.revenue}</div>
        `;
        container.appendChild(itemElement);
    });
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    const title = document.getElementById('orderDetailsTitle');

    if (modal && content && title) {
        title.textContent = `Order #${order.id} Details`;
        content.innerHTML = `
            <div class="order-details">
                <div class="detail-row">
                    <strong>Customer:</strong> ${order.customerName}
                </div>
                <div class="detail-row">
                    <strong>Order Time:</strong> ${new Date(order.orderTime).toLocaleString()}
                </div>
                <div class="detail-row">
                    <strong>Delivery Address:</strong> ${order.deliveryAddress}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="detail-row">
                    <strong>Items:</strong>
                    <ul>
                        ${order.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="detail-row">
                    <strong>Total:</strong> Rs. ${order.total}
                </div>
            </div>
        `;
        openModal('orderDetailsModal');
    }
}

// Update order status from table
function updateOrderStatusFromTable(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Simple status update - in real app, this would show a dropdown
    const newStatus = prompt(`Update status for Order #${orderId} (Current: ${order.status}):`, order.status);
    if (newStatus && newStatus !== order.status) {
        updateOrderStatusAPI(orderId, newStatus);
    }
}

// Update order status API call
async function updateOrderStatusAPI(orderId, newStatus) {
    try {
        const response = await fetch(`/api/restaurant/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showToast('Order status updated successfully', 'success');
            loadOrders(); // Refresh orders
            loadDashboardData(); // Refresh dashboard
        } else {
            showToast('Error updating order status', 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Error updating order status', 'error');
    }
}

// Update order status (from modal)
function updateOrderStatus() {
    // This would be implemented based on modal content
    showToast('Order status update functionality', 'info');
}

// Print order
function printOrder() {
    window.print();
}

// Open menu item modal
function openMenuItemModal(itemId = null) {
    const modal = document.getElementById('menuItemModal');
    const form = document.getElementById('menuItemForm');
    const title = document.getElementById('menuItemModalTitle');

    if (modal && form && title) {
        if (itemId) {
            // Edit mode
            const item = menuItems.find(i => i.id === itemId);
            if (item) {
                title.textContent = 'Edit Menu Item';
                populateMenuItemForm(item);
            }
        } else {
            // Add mode
            title.textContent = 'Add Menu Item';
            form.reset();
            document.getElementById('menuItemId').value = '';
            updateItemImagePreview('');
        }
        openModal('menuItemModal');
    }
}

// Populate menu item form
function populateMenuItemForm(item) {
    document.getElementById('menuItemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemImageUrl').value = item.imageUrl || '';
    document.getElementById('itemStock').value = item.stock;
    document.getElementById('itemAvailable').checked = item.available;

    updateItemImagePreview(item.imageUrl || '');
}

// Handle menu item form submit
async function handleMenuItemSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const itemData = {
        name: formData.get('itemName'),
        description: formData.get('itemDescription'),
        price: parseFloat(formData.get('itemPrice')),
        category: formData.get('itemCategory'),
        imageUrl: formData.get('itemImageUrl'),
        stock: parseInt(formData.get('itemStock')),
        available: formData.get('itemAvailable') === 'on'
    };

    const itemId = document.getElementById('menuItemId').value;

    try {
        let response;
        if (itemId) {
            // Update existing item
            response = await fetch(`/api/restaurant/menu-items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify(itemData)
            });
        } else {
            // Create new item
            response = await fetch('/api/restaurant/menu-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify(itemData)
            });
        }

        if (response.ok) {
            showToast(`Menu item ${itemId ? 'updated' : 'created'} successfully`, 'success');
            closeModal('menuItemModal');
            loadMenuItems(); // Refresh menu items
        } else {
            showToast('Error saving menu item', 'error');
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        showToast('Error saving menu item', 'error');
    }
}

// Edit menu item
function editMenuItem(itemId) {
    openMenuItemModal(itemId);
}

// Delete menu item
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
        const response = await fetch(`/api/restaurant/menu-items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            showToast('Menu item deleted successfully', 'success');
            loadMenuItems(); // Refresh menu items
        } else {
            showToast('Error deleting menu item', 'error');
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showToast('Error deleting menu item', 'error');
    }
}

// Update item image preview
function updateItemImagePreview(imageUrl) {
    const preview = document.getElementById('itemImagePreview');
    if (preview) {
        if (imageUrl) {
            preview.src = imageUrl;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login.html';
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Load categories for filters
async function loadCategories() {
    try {
        const response = await fetch('/api/categories', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });

        if (response.ok) {
            categories = await response.json();
            populateCategoryFilters();
        } else {
            // Use mock categories
            categories = [
                { id: 1, name: 'Momos' },
                { id: 2, name: 'Soups' },
                { id: 3, name: 'Rice/Noodles' },
                { id: 4, name: 'Beverages' }
            ];
            populateCategoryFilters();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        // Use mock categories
        categories = [
            { id: 1, name: 'Momos' },
            { id: 2, name: 'Soups' },
            { id: 3, name: 'Rice/Noodles' },
            { id: 4, name: 'Beverages' }
        ];
        populateCategoryFilters();
    }
}

// Populate category filters
function populateCategoryFilters() {
    const menuCategoryFilter = document.getElementById('menuCategoryFilter');
    const itemCategorySelect = document.getElementById('itemCategory');

    if (menuCategoryFilter) {
        menuCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            menuCategoryFilter.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
    }

    if (itemCategorySelect) {
        itemCategorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            itemCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
    }
}

// Initialize categories on load
loadCategories();
