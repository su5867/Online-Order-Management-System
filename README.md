# Online Order Management System (OOMS)

## Overview
This project is a production-ready Online Order Management System built with Spring Boot 3.2.0, Java 17, and MySQL 8.0.33. It supports user authentication with JWT, role-based access control, product and order management, payment gateway integration (Stripe), email notifications, delivery management, and report generation. The application includes a static HTML frontend served by Spring Boot.

## Features
- User registration, login, and profile management
- Role-based access: Admin, Customer, Delivery Staff
- Product CRUD with categories and stock management
- Cart and wishlist functionality
- Order placement, tracking, and status updates
- Delivery assignment and status tracking
- Payment integration with Stripe
- Email notifications for orders and payments
- Report generation for admin insights
- Swagger API documentation
- Docker containerization

## Setup Instructions

### Prerequisites
- Java 17
- Maven 3.x
- MySQL 8.0.33
- Docker (optional, for containerized deployment)

### Database Setup
1. Install and start MySQL server.
2. Create a database named `ooms_db`:
   ```sql
   CREATE DATABASE ooms_db;
   ```
3. Update `src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### Configuration
1. Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties`.
2. Update `src/main/resources/application.properties` with your configuration (using environment variables for sensitive data):
   - Database credentials (as above)
   - JWT secret (auto-generated if not set)
   - Email SMTP settings (for notifications)
   - Stripe API keys (see below)

### Stripe Payment Gateway Setup
1. Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/).
2. Obtain your Publishable Key and Secret Key from the API keys section.
3. Update `application.properties` with:
   ```properties
   stripe.api.key=your_stripe_secret_key
   ```

### Build and Run
1. Clone the repository.
2. Navigate to the project directory.
3. Build the application:
   ```bash
   mvn clean package
   ```
4. Run the application:
   ```bash
   java -jar target/order-management-system-1.0.0.jar
   ```
5. Access the application at `http://localhost:8080`

### Docker
Build and run with Docker:
```bash
docker build -t ooms .
docker run -p 8080:8080 -e DB_USERNAME=your_db_user -e DB_PASSWORD=your_db_password ooms
```

### API Documentation
Access Swagger UI at: `http://localhost:8080/swagger-ui.html`

## Testing
Testing is currently skipped. You can add unit and integration tests as needed using Spring Boot Test framework.

## Project Structure
- `src/main/java/com/ooms/` - Java source code
  - `config/` - Security and JWT configuration
  - `controller/` - REST controllers
  - `entity/` - JPA entities
  - `repository/` - Data repositories
  - `service/` - Business logic services
  - `dto/` - Data transfer objects
  - `exception/` - Exception handlers
- `src/main/resources/` - Application resources
  - `static/` - Static HTML, CSS, JS files (frontend)
  - `templates/` - Thymeleaf templates (if used)
- `docs/` - Additional documentation

## License
MIT License

## Contact
For any questions or support, please contact the maintainer.
