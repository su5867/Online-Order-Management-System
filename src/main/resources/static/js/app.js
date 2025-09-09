// OOMS Frontend JavaScript

const API_BASE_URL = 'http://localhost:8080/api';

// Utility functions
function showMessage(message, type = 'info') {
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

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login response data:', data); // Debug log
            setToken(data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', data.email);
            showMessage('Login successful!', 'success');

            // Redirect based on role
            console.log('User role:', data.role); // Debug log
            if (data.role === 'ADMIN') {
                console.log('Redirecting to admin.html'); // Debug log
                window.location.href = 'admin.html';
            } else {
                console.log('Redirecting to index.html'); // Debug log
                window.location.href = 'index.html';
            }
        } else {
            const error = await response.text();
            console.log('Login error:', error); // Debug log
            showMessage(error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function signup(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            window.location.href = 'login.html';
        } else {
            const error = await response.text();
            showMessage(error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            signup(name, email, password);
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showMessage('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
        });
    }

    // Check if user is logged in and update navigation
    if (isLoggedIn()) {
        updateNavigationForLoggedInUser();
    }
});

function updateNavigationForLoggedInUser() {
    const nav = document.querySelector('nav ul');
    if (nav) {
        const loginLink = nav.querySelector('a[href="login.html"]');
        const signupLink = nav.querySelector('a[href="signup.html"]');

        if (loginLink) loginLink.textContent = 'Logout';
        if (signupLink) signupLink.style.display = 'none';

        if (loginLink) {
            loginLink.addEventListener('click', function(e) {
                e.preventDefault();
                removeToken();
                window.location.href = 'index.html';
            });
        }
    }
}

// Product functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        } else {
            showMessage('Failed to load products', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">$${product.price}</p>
            <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

async function addToCart(productId) {
    if (!isLoggedIn()) {
        showMessage('Please login to add items to cart', 'error');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ productId, quantity: 1 }),
        });

        if (response.ok) {
            showMessage('Product added to cart!', 'success');
            loadCart(); // Refresh cart if on cart page
        } else {
            const error = await response.text();
            showMessage(error || 'Failed to add product to cart', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Load cart items
async function loadCart() {
    if (!isLoggedIn()) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });

        if (response.ok) {
            const cartItems = await response.json();
            displayCart(cartItems);
        } else {
            showMessage('Failed to load cart', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Display cart items
function displayCart(cartItems) {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartSummaryDiv = document.getElementById('cartSummary');

    if (!cartItemsDiv || !cartSummaryDiv) return;

    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty</p>';
        cartSummaryDiv.innerHTML = '';
        return;
    }

    cartItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.product.imageUrl || 'images/placeholder.jpg'}" alt="${item.product.name}">
            <div class="item-details">
                <h4>${item.product.name}</h4>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${item.product.price}</p>
                <p>Subtotal: $${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onclick="removeFromCart(${item.id})" class="btn">Remove</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
        total += item.product.price * item.quantity;
    });

    cartSummaryDiv.innerHTML = `
        <h3>Cart Summary</h3>
        <p>Total: $${total.toFixed(2)}</p>
    `;
}

// Remove item from cart
async function removeFromCart(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });

        if (response.ok) {
            showMessage('Item removed from cart', 'success');
            loadCart();
        } else {
            showMessage('Failed to remove item', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Initialize products page
if (window.location.pathname.includes('products.html')) {
    loadProducts();
}

// Initialize cart page
if (window.location.pathname.includes('cart.html')) {
    loadCart();
}

// Initialize profile page
if (window.location.pathname.includes('profile.html')) {
    // Profile page initialization can be added here
}
