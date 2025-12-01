# Database Setup Guide
## Catered by Africa - Sales & Customer Management Dashboard

This guide provides step-by-step instructions for setting up the database for the Catered by Africa dashboard application.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [PostgreSQL Installation](#postgresql-installation)
3. [Database Creation](#database-creation)
4. [Schema Setup](#schema-setup)
5. [Seed Data](#seed-data)
6. [Redis Setup](#redis-setup)
7. [Backup & Restore](#backup--restore)

---

## Prerequisites

### Required Software
- PostgreSQL 14+
- Redis 6+
- Node.js 18+ (for migrations)
- pgAdmin or similar GUI tool (optional)

---

## PostgreSQL Installation

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### macOS
```bash
# Using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify installation
psql --version
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

---

## Database Creation

### 1. Create Database User
```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Create database user
CREATE USER cateredbyafrica_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
ALTER USER cateredbyafrica_user WITH SUPERUSER;
```

### 2. Create Database
```sql
-- Create production database
CREATE DATABASE cateredbyafrica_prod OWNER cateredbyafrica_user;

-- Create development database
CREATE DATABASE cateredbyafrica_dev OWNER cateredbyafrica_user;

-- Create test database
CREATE DATABASE cateredbyafrica_test OWNER cateredbyafrica_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE cateredbyafrica_prod TO cateredbyafrica_user;
GRANT ALL PRIVILEGES ON DATABASE cateredbyafrica_dev TO cateredbyafrica_user;
GRANT ALL PRIVILEGES ON DATABASE cateredbyafrica_test TO cateredbyafrica_user;
```

### 3. Enable UUID Extension
```sql
-- Connect to your database
\c cateredbyafrica_prod

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## Schema Setup

### Complete SQL Schema Script

Save this as `schema.sql`:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0.00,
    last_order_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    tags TEXT[],
    notes TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'South Africa',
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX idx_customers_total_revenue ON customers(total_revenue DESC);
CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sales_count ON products(sales_count DESC);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partial')),
    payment_method VARCHAR(50),
    order_type VARCHAR(50) DEFAULT 'online' CHECK (order_type IN ('online', 'offline')),
    items JSONB NOT NULL,
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- =============================================
-- ORDER ITEMS TABLE (Normalized)
-- =============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =============================================
-- EMAIL CAMPAIGNS TABLE
-- =============================================
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(100) CHECK (template_type IN ('blank', 'welcome', 'promotion', 'reminder', 'newsletter')),
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('all', 'with_orders', 'without_orders', 'vip', 'custom')),
    recipient_ids UUID[],
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5, 2) DEFAULT 0.00,
    click_rate DECIMAL(5, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    schedule_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);

-- =============================================
-- EMAIL TEMPLATES TABLE
-- =============================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- =============================================
-- MESSAGES TABLE (SMS/WhatsApp)
-- =============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('sms', 'whatsapp')),
    content TEXT NOT NULL,
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('all', 'with_orders', 'without_orders', 'vip', 'custom')),
    recipient_ids UUID[],
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    delivery_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    schedule_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

-- =============================================
-- MESSAGE TEMPLATES TABLE
-- =============================================
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sms', 'whatsapp')),
    content TEXT NOT NULL,
    variables TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_templates_type ON message_templates(type);
CREATE INDEX idx_message_templates_active ON message_templates(is_active);

-- =============================================
-- AUTOMATION RULES TABLE
-- =============================================
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL CHECK (trigger_type IN (
        'customer_registered',
        'order_placed',
        'order_delivered',
        'cart_abandoned',
        'birthday',
        'anniversary',
        'no_order_30_days'
    )),
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN ('email', 'sms', 'whatsapp')),
    delay_minutes INTEGER DEFAULT 0,
    template_id UUID,
    message_content TEXT,
    is_active BOOLEAN DEFAULT true,
    total_sent INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX idx_automation_rules_created_by ON automation_rules(created_by);

-- =============================================
-- AUTOMATION LOGS TABLE
-- =============================================
CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status VARCHAR(50) CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    metadata JSONB,
    executed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX idx_automation_logs_customer_id ON automation_logs(customer_id);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at DESC);

-- =============================================
-- ANALYTICS TABLE
-- =============================================
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_sales DECIMAL(12, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    products_sold INTEGER DEFAULT 0,
    online_sales DECIMAL(12, 2) DEFAULT 0.00,
    offline_sales DECIMAL(12, 2) DEFAULT 0.00,
    loyal_customers_count INTEGER DEFAULT 0,
    unique_customers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date DESC);

-- =============================================
-- SESSIONS TABLE (for refresh tokens)
-- =============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE customers
        SET
            total_orders = (
                SELECT COUNT(*)
                FROM orders
                WHERE customer_id = NEW.customer_id
                AND status = 'completed'
            ),
            total_revenue = (
                SELECT COALESCE(SUM(total_amount), 0)
                FROM orders
                WHERE customer_id = NEW.customer_id
                AND status = 'completed'
            ),
            last_order_date = (
                SELECT MAX(created_at)
                FROM orders
                WHERE customer_id = NEW.customer_id
            )
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- Function to update product sales count
CREATE OR REPLACE FUNCTION update_product_sales()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET
        sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_sales_trigger
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_sales();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
    order_num VARCHAR;
    year_prefix VARCHAR;
    sequence_num INTEGER;
BEGIN
    year_prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-';

    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_number LIKE year_prefix || '%';

    order_num := year_prefix || LPAD(sequence_num::TEXT, 6, '0');

    RETURN order_num;
END;
$$ LANGUAGE plpgsql;
```

### Run the Schema
```bash
# From the command line
psql -U cateredbyafrica_user -d cateredbyafrica_prod -f schema.sql

# Or from within psql
\c cateredbyafrica_prod
\i schema.sql
```

---

## Seed Data

### Create Seed Data Script

Save this as `seed.sql`:

```sql
-- =============================================
-- SEED DATA
-- =============================================

-- Create admin user
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@cateredbyafrica.com', crypt('admin123', gen_salt('bf')), 'Musfiq', 'admin'),
('manager@cateredbyafrica.com', crypt('manager123', gen_salt('bf')), 'Sarah Manager', 'manager');

-- Create sample customers
INSERT INTO customers (name, email, phone, status, total_orders, total_revenue, tags) VALUES
('Alice Johnson', 'alice.johnson@example.com', '+27123456789', 'active', 5, 2500.00, ARRAY['VIP', 'Frequent Buyer']),
('Bob Smith', 'bob.smith@example.com', '+27234567890', 'active', 3, 1500.00, ARRAY['Regular']),
('Carol Williams', 'carol.williams@example.com', '+27345678901', 'active', 2, 800.00, NULL),
('David Brown', 'david.brown@example.com', '+27456789012', 'active', 0, 0.00, NULL),
('Emma Davis', 'emma.davis@example.com', '+27567890123', 'active', 0, 0.00, NULL),
('Frank Miller', 'frank.miller@example.com', '+27678901234', 'active', 8, 4200.00, ARRAY['VIP']),
('Grace Wilson', 'grace.wilson@example.com', '+27789012345', 'active', 1, 350.00, NULL),
('Henry Moore', 'henry.moore@example.com', '+27890123456', 'active', 0, 0.00, NULL);

-- Create sample products
INSERT INTO products (name, description, price, category, stock_quantity, sales_count, popularity_score, sku) VALUES
('Home Decor Range', 'Beautiful home decoration items', 250.00, 'Home & Living', 50, 120, 85, 'HDR-001'),
('Disney Princess Pink Bag 18', 'Kids backpack with Disney characters', 150.00, 'Kids', 30, 85, 75, 'DPB-002'),
('Bathroom Essentials', 'Complete bathroom accessory set', 75.00, 'Home & Living', 100, 45, 60, 'BAT-003'),
('Apple Smartwatches', 'Latest smartwatch technology', 350.00, 'Electronics', 20, 32, 50, 'APW-004');

-- Create email templates
INSERT INTO email_templates (name, type, subject, body, variables) VALUES
('Welcome Email', 'welcome', 'Welcome to Catered by Africa!',
 '<h1>Welcome {{customer_name}}!</h1><p>Thank you for joining us.</p>',
 ARRAY['customer_name']),
('Order Confirmation', 'promotion', 'Your Order #{{order_number}} is Confirmed',
 '<h1>Order Confirmed!</h1><p>Hi {{customer_name}}, your order has been confirmed.</p>',
 ARRAY['customer_name', 'order_number']);

-- Create message templates
INSERT INTO message_templates (name, type, content, variables) VALUES
('Order Shipped', 'sms', 'Hi {{customer_name}}, your order #{{order_number}} has shipped!',
 ARRAY['customer_name', 'order_number']),
('Welcome SMS', 'sms', 'Welcome to Catered by Africa! We are excited to serve you.',
 ARRAY[]);

-- Create sample automation rules
INSERT INTO automation_rules (name, trigger_type, action_type, delay_minutes, message_content, is_active) VALUES
('Welcome Email', 'customer_registered', 'email', 0, 'Welcome to our platform!', true),
('Order Confirmation', 'order_placed', 'sms', 0, 'Your order has been placed successfully!', true),
('Cart Abandoned Reminder', 'cart_abandoned', 'email', 60, 'You left items in your cart!', true);

-- Create sample analytics data
INSERT INTO analytics_daily (date, total_sales, total_orders, new_customers, products_sold, online_sales, offline_sales) VALUES
(CURRENT_DATE - INTERVAL '7 days', 5000.00, 25, 3, 45, 3000.00, 2000.00),
(CURRENT_DATE - INTERVAL '6 days', 6500.00, 32, 5, 58, 4000.00, 2500.00),
(CURRENT_DATE - INTERVAL '5 days', 4800.00, 22, 2, 40, 2800.00, 2000.00),
(CURRENT_DATE - INTERVAL '4 days', 7200.00, 38, 4, 65, 4500.00, 2700.00),
(CURRENT_DATE - INTERVAL '3 days', 5500.00, 28, 3, 50, 3300.00, 2200.00),
(CURRENT_DATE - INTERVAL '2 days', 8000.00, 42, 6, 75, 5000.00, 3000.00),
(CURRENT_DATE - INTERVAL '1 days', 7500.00, 40, 5, 70, 4500.00, 3000.00);
```

### Run Seed Data
```bash
psql -U cateredbyafrica_user -d cateredbyafrica_prod -f seed.sql
```

---

## Redis Setup

### Installation
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Start Redis
sudo systemctl start redis-server  # Linux
brew services start redis          # macOS

# Verify
redis-cli ping
# Should return: PONG
```

### Redis Configuration
```bash
# Edit redis.conf
sudo nano /etc/redis/redis.conf

# Important settings:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# requirepass your_redis_password
```

### Redis Usage Examples
```javascript
// Cache customer data
SET customer:cust_001 '{"name":"Alice Johnson","email":"alice@example.com"}' EX 3600

// Cache dashboard metrics
SET dashboard:metrics '{"totalSales":1000,"totalOrders":300}' EX 300

// Rate limiting
INCR rate_limit:192.168.1.1
EXPIRE rate_limit:192.168.1.1 60
```

---

## Backup & Restore

### PostgreSQL Backup
```bash
# Full database backup
pg_dump -U cateredbyafrica_user -d cateredbyafrica_prod > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U cateredbyafrica_user -d cateredbyafrica_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Specific tables
pg_dump -U cateredbyafrica_user -d cateredbyafrica_prod -t customers -t orders > backup_critical_tables.sql
```

### PostgreSQL Restore
```bash
# Restore from backup
psql -U cateredbyafrica_user -d cateredbyafrica_prod < backup_20251201.sql

# Restore from compressed backup
gunzip -c backup_20251201.sql.gz | psql -U cateredbyafrica_user -d cateredbyafrica_prod
```

### Automated Backups (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U cateredbyafrica_user -d cateredbyafrica_prod | gzip > /backups/cateredbyafrica_$(date +\%Y\%m\%d).sql.gz

# Keep only last 30 days
0 3 * * * find /backups -name "cateredbyafrica_*.sql.gz" -mtime +30 -delete
```

---

## Database Maintenance

### Vacuum and Analyze
```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim storage
VACUUM;

-- Full vacuum (requires exclusive lock)
VACUUM FULL;

-- Analyze specific table
ANALYZE customers;
```

### Check Database Size
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('cateredbyafrica_prod'));

-- Table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Performance
```sql
-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Active connections
SELECT * FROM pg_stat_activity;

-- Kill long-running query
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';
```

---

## Connection String

### Format
```
postgresql://username:password@host:port/database?options
```

### Examples
```bash
# Production
DATABASE_URL=postgresql://cateredbyafrica_user:password@localhost:5432/cateredbyafrica_prod

# Development
DATABASE_URL=postgresql://cateredbyafrica_user:password@localhost:5432/cateredbyafrica_dev

# With SSL
DATABASE_URL=postgresql://cateredbyafrica_user:password@localhost:5432/cateredbyafrica_prod?sslmode=require
```

---

## Migration Tools

### Using Knex.js
```bash
npm install knex pg

# Create migration
npx knex migrate:make create_users_table

# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback
```

### Using Prisma
```bash
npm install @prisma/client prisma

# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate
```

---

## Security Best Practices

1. **Strong Passwords**: Use complex passwords for database users
2. **Limited Permissions**: Grant minimum required permissions
3. **SSL/TLS**: Enable SSL for production databases
4. **Regular Backups**: Implement automated backup strategy
5. **Update Regularly**: Keep PostgreSQL updated
6. **Monitor Access**: Log and monitor database access
7. **Network Security**: Use firewall rules to limit access
8. **Encryption**: Enable encryption at rest for sensitive data

---

## Troubleshooting

### Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check if port is listening
sudo netstat -plunt | grep 5432

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Permission Issues
```sql
-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE cateredbyafrica_prod TO cateredbyafrica_user;

-- Grant privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cateredbyafrica_user;

-- Grant privileges on sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cateredbyafrica_user;
```

---

**Last Updated**: December 1, 2025
