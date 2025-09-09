# Online Order Management System (OOMS)

## Overview
This project is a production-ready Online Order Management System built with Spring Boot 3.x, Java 17+, and MySQL. It supports user authentication with JWT and OAuth2 (Google), role-based access control, product and order management, payment gateway integration (Stripe), email notifications, and more.

## Features
- User registration, login, profile management
- Role-based access: Admin, Customer, Delivery Staff
- Product CRUD with categories and stock management
- Cart and wishlist functionality
- Order placement, tracking, and status updates
- Payment integration with eSewa, Khalti, Mobile Banking, and COD
- Email notifications for orders and payments
- Swagger API documentation
- Docker containerization

## Setup Instructions

### Prerequisites
- Java 17+
- Maven
- MySQL 8.x
- Docker (optional)

### Database Setup
1. Create a MySQL database named `ooms_db`.
2. Update `src/main/resources/application.properties` with your MySQL credentials.

### Configuration
- Update `application.properties` with:
  - JWT secret (auto-generated or set your own)
  - Google OAuth2 client ID and secret (see below)
  - Email SMTP settings
  - Payment gateway credentials (Stripe)

### Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Create OAuth 2.0 Client IDs with:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
5. Copy the Client ID and Client Secret.
6. Update `application.properties` with these values.

### Build and Run
```bash
mvn clean package
java -jar target/order-management-system-1.0.0.jar
```

### Docker
Build and run with Docker:
```bash
docker build -t ooms .
docker run -p 8080:8080 ooms
```

### API Documentation
Access Swagger UI at: `http://localhost:8080/swagger-ui.html`

## Testing
Testing is currently skipped. You can add unit and integration tests as needed.

## License
MIT License

## Contact
For any questions or support, please contact the maintainer.
