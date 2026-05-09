-- Create Database
CREATE DATABASE dormitory_db;

-- Connect to the database
\c dormitory_db;

-- Create enum for bed status
CREATE TYPE bed_status AS ENUM ('IDLE', 'ALLOCATED', 'MAINTENANCE');

-- Create beds table
CREATE TABLE beds (
    id SERIAL PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL UNIQUE,
    room_number VARCHAR(20) NOT NULL,
    floor_number INTEGER NOT NULL,
    bed_type VARCHAR(50) DEFAULT 'STANDARD',
    status bed_status DEFAULT 'IDLE',
    hourly_rate DECIMAL(10, 2) DEFAULT 100.00,
    daily_rate DECIMAL(10, 2) DEFAULT 900.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create allocations table
CREATE TABLE allocations (
    id SERIAL PRIMARY KEY,
    bed_id INTEGER REFERENCES beds(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    expected_checkout TIMESTAMP,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    total_hours DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_allocations_bed_id ON allocations(bed_id);
CREATE INDEX idx_allocations_customer_id ON allocations(customer_id);
CREATE INDEX idx_allocations_check_in ON allocations(check_in_time);

-- Insert sample beds
INSERT INTO beds (bed_number, room_number, floor_number, bed_type, status, hourly_rate, daily_rate) VALUES
('B001', 'R101', 1, 'STANDARD', 'IDLE', 100.00, 900.00),
('B002', 'R101', 1, 'STANDARD', 'IDLE', 100.00, 900.00),
('B003', 'R102', 1, 'PREMIUM', 'IDLE', 150.00, 12000.00),
('B004', 'R102', 1, 'PREMIUM', 'IDLE', 150.00, 12000.00),
('B005', 'R201', 2, 'STANDARD', 'IDLE', 100.00, 900.00),
('B006', 'R201', 2, 'STANDARD', 'IDLE', 100.00, 900.00),
('B007', 'R202', 2, 'PREMIUM', 'IDLE', 150.00, 12000.00),
('B008', 'R202', 2, 'PREMIUM', 'IDLE', 150.00, 12000.00),
('B009', 'R301', 3, 'DELUXE', 'IDLE', 200.00, 15000.00),
('B010', 'R301', 3, 'DELUXE', 'IDLE', 200.00, 15000.00);

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, id_proof_type, id_proof_number) VALUES
('John', 'Doe', 'john.doe@email.com', '+1234567890', 'PASSPORT', 'P12345678'),
('Jane', 'Smith', 'jane.smith@email.com', '+1234567891', 'DRIVER_LICENSE', 'DL98765432'),
('Mike', 'Johnson', 'mike.j@email.com', '+1234567892', 'NATIONAL_ID', 'NI11223344');
