# Dormitory Bed Management System

A full-stack application for managing dormitory beds, customer allocations, and tracking costs.

## Technology Stack

- **Frontend**: Angular 17 (Standalone Components)
- **Backend**: Java Spring Boot 3.2
- **Database**: PostgreSQL

## Features

- **Dashboard**: Real-time overview with color-coded bed status visualization
  - Green = Available (IDLE)
  - Red = Occupied (ALLOCATED)
  - Orange = Maintenance
- **Bed Management**: Add, edit, and manage beds across rooms and floors
- **Customer Management**: Register and manage customer information
- **Allocation System**: 
  - Allocate beds to customers
  - Track check-in time automatically
  - Calculate costs based on hourly/daily rates
  - Process checkouts with automatic cost calculation

## Prerequisites

1. **Java 17+** - [Download](https://adoptium.net/)
2. **Maven** - [Download](https://maven.apache.org/download.cgi)
3. **Node.js 18+** - [Download](https://nodejs.org/)
4. **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)

## Setup Instructions

### 1. Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE dormitory_db;

-- Then run the init.sql script
\i database/init.sql
```

Or manually run the SQL from `database/init.sql`

### 2. Backend Setup

```bash
cd backend

# Update database credentials in src/main/resources/application.properties if needed:
# spring.datasource.username=your_username
# spring.datasource.password=your_password

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
# or
npm start
```

Frontend will be available at `http://localhost:4200`

## API Endpoints

### Beds
- `GET /api/beds` - Get all beds
- `GET /api/beds/available` - Get available beds
- `GET /api/beds/status/{status}` - Get beds by status
- `POST /api/beds` - Create a bed
- `PUT /api/beds/{id}` - Update a bed
- `DELETE /api/beds/{id}` - Delete a bed

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/search?query=` - Search customers
- `POST /api/customers` - Create a customer
- `PUT /api/customers/{id}` - Update a customer
- `DELETE /api/customers/{id}` - Delete a customer

### Allocations
- `GET /api/allocations` - Get all allocations
- `GET /api/allocations/active` - Get active allocations
- `GET /api/allocations/completed` - Get completed allocations
- `POST /api/allocations/allocate` - Allocate a bed
- `POST /api/allocations/{id}/checkout` - Check out

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Cost Calculation

- **Hourly Rate**: Applied for stays under 20 hours
- **Daily Rate**: Applied when hourly total exceeds daily rate, or for stays 20+ hours
- Costs are calculated automatically at checkout based on actual stay duration

## Project Structure

```
dormitory-management/
├── backend/
│   ├── src/main/java/com/dormitory/bedmanagement/
│   │   ├── controller/     # REST API controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access layer
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── config/         # Configuration classes
│   │   └── exception/      # Exception handlers
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   └── src/app/
│       ├── pages/          # Page components
│       ├── services/       # Angular services
│       └── models/         # TypeScript interfaces
└── database/
    └── init.sql            # Database initialization
```

## Screenshots

The application features:
1. **Dashboard** - Visual bed grid with occupancy stats
2. **Beds Management** - Table view with CRUD operations
3. **Customers** - Customer registry
4. **Allocations** - Active/completed allocation tracking

## License

MIT License
