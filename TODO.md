# Online Order Management System (OOMS) Development TODO

## Phase 1: Project Setup
- [x] Create Maven project structure with standard directories (src/main/java, src/main/resources, etc.)
- [x] Configure pom.xml with Spring Boot 3.x, Java 17+, dependencies (Spring Security, JPA, MySQL, JWT, OAuth2, Mail, Validation, Swagger, Docker, Testing)
- [x] Create application.properties template with placeholders for DB, JWT, payment keys, email
- [x] Set up logging configuration (logback-spring.xml)

## Phase 2: Database & Entities
- [x] Design and create MySQL schema (users, addresses, products, categories, cart, wishlist, orders, order_items, payments, delivery_assignments)
- [x] Create JPA entities with relationships and validations
- [x] Create sample data SQL scripts

## Phase 3: Core Services
- [x] Implement repositories (UserRepository, ProductRepository, etc.)
- [x] Create service layer (UserService, ProductService, OrderService, etc.)
- [x] Implement business logic for cart, wishlist, order status flow

## Phase 4: Security & Authentication
- [x] Configure Spring Security with JWT authentication
- [x] Implement login/logout endpoints
- [x] Add OAuth2 integration (Google)
- [x] Implement role-based access (Admin, Customer, Delivery Staff)
- [x] Password hashing with BCrypt

## Phase 5: Controllers & APIs
- [x] Create REST controllers for user management, product CRUD, order management
- [x] Implement cart and wishlist endpoints
- [x] Add input validation and global exception handling
- [x] Configure Swagger/OpenAPI documentation

## Phase 6: Payment Integration
- [x] Integrate Stripe payment gateway
- [x] Handle COD and refunds
- [x] Store payment transactions in DB

## Phase 7: Notifications & Reports
- [x] Set up Spring Mail for email notifications
- [x] Implement order update and payment notifications
- [x] Create admin dashboard with reports (sales, revenue, best-sellers)
- [x] Add export functionality (Excel/PDF) - Basic CSV export available

## Phase 8: Advanced Features
- [x] Implement product search with filters, sorting, pagination
- [ ] Add discount coupons/vouchers (optional - skipped)
- [ ] Multi-language and multi-currency support (optional - skipped)
- [ ] WebSocket for real-time notifications (optional - skipped)

## Phase 9: Testing & Deployment
- [ ] Write unit tests with JUnit and Mockito (skipped as per user request)
- [ ] Integration tests for APIs (skipped as per user request)
- [x] Create Dockerfile for containerization
- [x] Build pre-configured JAR with README instructions
- [x] Successfully build and package the application

## Phase 10: Final Touches
- [x] Code review and refactoring for clean architecture
- [x] Performance optimization
- [x] Security audit
- [x] Documentation updates
- [x] Fix HTML pages to connect with backend APIs (login, signup, payment methods)
- [x] Update payment methods to use only Stripe
- [x] Create creative and Nepal-focused HTML pages (products, about, contact)
- [x] Integrate Nepali Rupee currency display and local branding
- [x] Update footers to match index.html design with social links
- [x] Add comprehensive content to all pages (hero sections, categories, team info, testimonials, FAQ, contact info)
- [x] Fix admin.html page loading issues (CSS/JS paths and role-based access)
- [x] Fix admin.html page loading issues (CSS/JS paths, role-based access, and API endpoints)
