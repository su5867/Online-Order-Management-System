-- Sample data for Online Order Management System

-- Insert categories
INSERT INTO categories (name, parent_id) VALUES ('Electronics', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Clothing', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Books', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Smartphones', 1);
INSERT INTO categories (name, parent_id) VALUES ('Laptops', 1);

-- Insert products
INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ('iPhone 14', 'Latest iPhone model', 999.99, 50, 4, 'iphone14.jpg');
INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ('Samsung Galaxy S23', 'Android smartphone', 899.99, 40, 4, 'galaxys23.jpg');
INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ('MacBook Pro', 'High-performance laptop', 1999.99, 20, 5, 'macbookpro.jpg');
INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ('T-Shirt', 'Cotton t-shirt', 19.99, 100, 2, 'tshirt.jpg');
INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ('Java Programming Book', 'Learn Java', 49.99, 30, 3, 'javabook.jpg');

-- Insert users (passwords are hashed, e.g., 'password' -> BCrypt hash)
-- Note: In real app, use proper hashing
INSERT INTO users (name, email, password, role, created_at) VALUES ('Admin User', 'admin@ooms.com', '$2a$10$examplehash', 'ADMIN', NOW());
INSERT INTO users (name, email, password, role, created_at) VALUES ('John Customer', 'john@example.com', '$2a$10$examplehash', 'CUSTOMER', NOW());
INSERT INTO users (name, email, password, role, created_at) VALUES ('Jane Staff', 'jane@ooms.com', '$2a$10$examplehash', 'DELIVERY_STAFF', NOW());

-- Insert addresses
INSERT INTO addresses (user_id, address_line, city, state, zip, is_default) VALUES (2, '123 Main St', 'Kathmandu', 'Bagmati', '44600', true);
INSERT INTO addresses (user_id, address_line, city, state, zip, is_default) VALUES (2, '456 Side St', 'Pokhara', 'Gandaki', '33700', false);

-- Insert cart items
INSERT INTO cart (user_id, product_id, quantity) VALUES (2, 1, 1);
INSERT INTO cart (user_id, product_id, quantity) VALUES (2, 3, 1);

-- Insert wishlist items
INSERT INTO wishlist (user_id, product_id) VALUES (2, 2);
INSERT INTO wishlist (user_id, product_id) VALUES (2, 4);

-- Insert orders
INSERT INTO orders (user_id, total_amount, status, payment_status, created_at) VALUES (2, 2999.98, 'PLACED', 'PENDING', NOW());

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (1, 1, 1, 999.99);
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (1, 3, 1, 1999.99);

-- Insert payments
INSERT INTO payments (order_id, transaction_id, amount, status, method) VALUES (1, 'TXN123456', 2999.98, 'PENDING', 'STRIPE');

-- Insert delivery assignments
INSERT INTO delivery_assignments (order_id, staff_id, status) VALUES (1, 3, 'ASSIGNED');
