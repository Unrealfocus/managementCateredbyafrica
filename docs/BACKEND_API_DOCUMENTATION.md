# Backend API Documentation
## Catered by Africa - Sales & Customer Management Dashboard

### Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [WebSocket Events](#websocket-events)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Overview

### Base URL
```
Production: https://api.cateredbyafrica.com/v1
Development: http://localhost:3000/api/v1
```

### Technology Stack Recommendations
- **Runtime**: Node.js (Express/Fastify) or Python (FastAPI/Django)
- **Database**: PostgreSQL (primary) + Redis (caching)
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or Cloudinary
- **Email Service**: SendGrid or AWS SES
- **SMS/WhatsApp**: Twilio or Africa's Talking
- **Real-time**: Socket.io or WebSockets

### Response Format
All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-12-01T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { ... }
  },
  "timestamp": "2025-12-01T10:30:00Z"
}
```

---

## Authentication

### 1. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@cateredbyafrica.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "admin@cateredbyafrica.com",
      "name": "Musfiq",
      "role": "admin",
      "avatar": "https://cdn.cateredbyafrica.com/avatars/usr_123456.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

### 2. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

### Protected Routes
All protected routes require the `Authorization` header:
```
Authorization: Bearer {accessToken}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0.00,
    last_order_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[], -- Array of tags
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
```

### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    order_type VARCHAR(50), -- online, offline
    items JSONB, -- Order items as JSON
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sales_count ON products(sales_count DESC);
```

### Email Campaigns Table
```sql
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(100),
    recipient_type VARCHAR(50), -- all, with_orders, without_orders, vip, custom
    recipient_ids UUID[],
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);
```

### SMS/WhatsApp Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- sms, whatsapp
    recipient_type VARCHAR(50),
    recipient_ids UUID[],
    content TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
```

### Automation Rules Table
```sql
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- customer_registered, order_placed, etc.
    action_type VARCHAR(100) NOT NULL, -- email, sms, whatsapp
    delay_minutes INTEGER DEFAULT 0,
    template_id UUID,
    message_content TEXT,
    is_active BOOLEAN DEFAULT true,
    total_sent INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_active ON automation_rules(is_active);
```

---

## API Endpoints

### Dashboard Analytics

#### 1. Get Dashboard Metrics
```http
GET /dashboard/metrics
Authorization: Bearer {accessToken}
Query Parameters:
  - startDate: ISO 8601 date (optional)
  - endDate: ISO 8601 date (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": {
      "value": 1000,
      "currency": "USD",
      "change": 8.0,
      "changeType": "increase"
    },
    "totalOrders": {
      "value": 300,
      "change": 5.0,
      "changeType": "increase"
    },
    "productsSold": {
      "value": 5,
      "change": 1.2,
      "changeType": "increase"
    },
    "newCustomers": {
      "value": 8,
      "change": 0.5,
      "changeType": "increase"
    }
  }
}
```

#### 2. Get Revenue Chart Data
```http
GET /dashboard/revenue
Authorization: Bearer {accessToken}
Query Parameters:
  - period: day|week|month|year (default: week)
  - startDate: ISO 8601 date (optional)
  - endDate: ISO 8601 date (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "online": [15000, 28000, 20000, 32000, 18000, 25000, 30000],
    "offline": [22000, 18000, 25000, 15000, 28000, 20000, 23000]
  }
}
```

#### 3. Get Visitor Insights
```http
GET /dashboard/visitors
Authorization: Bearer {accessToken}
Query Parameters:
  - period: day|week|month (default: week)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    "loyalCustomers": [30, 45, 35, 55, 45, 65, 55],
    "newCustomers": [20, 35, 40, 30, 50, 45, 60],
    "uniqueCustomers": [40, 30, 45, 40, 35, 50, 45],
    "percentages": {
      "loyal": 78,
      "new": 15,
      "unique": 7
    }
  }
}
```

#### 4. Get Top Products
```http
GET /dashboard/top-products
Authorization: Bearer {accessToken}
Query Parameters:
  - limit: number (default: 10)
  - period: day|week|month|year (optional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "rank": 1,
      "name": "Home Decor Range",
      "popularity": 85,
      "sales": 45,
      "revenue": 12500.00
    },
    {
      "id": "prod_002",
      "rank": 2,
      "name": "Disney Princess Pink Bag 18",
      "popularity": 75,
      "sales": 29,
      "revenue": 8750.00
    }
  ]
}
```

### Customer Management

#### 1. Get All Customers
```http
GET /customers
Authorization: Bearer {accessToken}
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - search: string (searches name, email)
  - filter: all|with_orders|without_orders
  - sortBy: created_at|name|total_revenue (default: created_at)
  - sortOrder: asc|desc (default: desc)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cust_001",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "phone": "+27123456789",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        "totalOrders": 5,
        "totalRevenue": 2500.00,
        "lastOrderDate": "2025-11-28T14:30:00Z",
        "status": "active",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "stats": {
      "totalCustomers": 150,
      "newToday": 3,
      "withOrders": 82,
      "withoutOrders": 68
    }
  }
}
```

#### 2. Get Customer by ID
```http
GET /customers/:customerId
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cust_001",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+27123456789",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    "totalOrders": 5,
    "totalRevenue": 2500.00,
    "lastOrderDate": "2025-11-28T14:30:00Z",
    "status": "active",
    "tags": ["VIP", "Frequent Buyer"],
    "notes": "Prefers contactless delivery",
    "orders": [
      {
        "id": "ord_001",
        "orderNumber": "ORD-2025-001",
        "amount": 500.00,
        "status": "delivered",
        "createdAt": "2025-11-28T14:30:00Z"
      }
    ],
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-11-28T14:30:00Z"
  }
}
```

#### 3. Create Customer
```http
POST /customers
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+27987654321"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cust_002",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+27987654321",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    "totalOrders": 0,
    "totalRevenue": 0.00,
    "status": "active",
    "createdAt": "2025-12-01T10:30:00Z"
  },
  "message": "Customer created successfully"
}
```

#### 4. Update Customer
```http
PUT /customers/:customerId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+27111111111",
  "notes": "Prefers morning deliveries"
}
```

#### 5. Delete Customer
```http
DELETE /customers/:customerId
Authorization: Bearer {accessToken}
```

#### 6. Get Customer Segmentation
```http
GET /customers/segmentation
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withOrders": {
      "count": 82,
      "customers": [ ... ],
      "totalRevenue": 125000.00,
      "averageOrderValue": 1524.39
    },
    "withoutOrders": {
      "count": 68,
      "customers": [ ... ]
    },
    "conversionRate": 54.67
  }
}
```

### Email Marketing

#### 1. Get Email Campaigns
```http
GET /emails/campaigns
Authorization: Bearer {accessToken}
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: draft|sent|scheduled
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "email_001",
        "name": "Welcome Campaign",
        "subject": "Welcome to Catered by Africa!",
        "templateType": "welcome",
        "recipientType": "all",
        "sentCount": 150,
        "openedCount": 120,
        "clickedCount": 45,
        "openRate": 80.00,
        "clickRate": 30.00,
        "status": "sent",
        "sentAt": "2025-11-30T09:00:00Z",
        "createdAt": "2025-11-29T15:00:00Z"
      }
    ],
    "pagination": { ... },
    "stats": {
      "totalSent": 1250,
      "averageOpenRate": 75.50,
      "averageClickRate": 28.30
    }
  }
}
```

#### 2. Create Email Campaign
```http
POST /emails/campaigns
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Black Friday Sale",
  "subject": "50% Off Everything!",
  "body": "<html>...</html>",
  "templateType": "promotion",
  "recipientType": "with_orders",
  "recipientIds": [], // optional, for custom recipients
  "scheduleAt": "2025-12-05T08:00:00Z" // optional, for scheduled sending
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "email_002",
    "name": "Black Friday Sale",
    "status": "scheduled",
    "scheduleAt": "2025-12-05T08:00:00Z",
    "estimatedRecipients": 82
  },
  "message": "Email campaign scheduled successfully"
}
```

#### 3. Send Email Campaign
```http
POST /emails/campaigns/:campaignId/send
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "email_002",
    "sentCount": 82,
    "status": "sent",
    "sentAt": "2025-12-01T11:00:00Z"
  },
  "message": "Email campaign sent successfully"
}
```

#### 4. Get Email Templates
```http
GET /emails/templates
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_001",
      "name": "Welcome Email",
      "type": "welcome",
      "subject": "Welcome to {{company_name}}!",
      "body": "<html>...</html>",
      "variables": ["company_name", "customer_name"]
    }
  ]
}
```

### Messaging (SMS/WhatsApp)

#### 1. Get Messages
```http
GET /messages
Authorization: Bearer {accessToken}
Query Parameters:
  - type: sms|whatsapp
  - page: number (default: 1)
  - limit: number (default: 20)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_001",
        "type": "sms",
        "content": "Your order #12345 is on the way!",
        "recipientType": "custom",
        "sentCount": 50,
        "deliveredCount": 48,
        "failedCount": 2,
        "deliveryRate": 96.00,
        "status": "sent",
        "sentAt": "2025-11-30T10:00:00Z"
      }
    ],
    "pagination": { ... },
    "stats": {
      "totalSmsSent": 500,
      "totalWhatsAppSent": 320,
      "averageDeliveryRate": 95.50
    }
  }
}
```

#### 2. Send SMS/WhatsApp Message
```http
POST /messages/send
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "sms",
  "content": "Thank you for your order!",
  "recipientType": "with_orders",
  "recipientIds": [], // optional, for custom recipients
  "scheduleAt": "2025-12-02T09:00:00Z" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg_002",
    "type": "sms",
    "sentCount": 82,
    "estimatedCost": 8.20,
    "currency": "USD",
    "status": "sent",
    "sentAt": "2025-12-01T11:15:00Z"
  },
  "message": "SMS messages sent successfully"
}
```

#### 3. Get Message Templates
```http
GET /messages/templates
Authorization: Bearer {accessToken}
Query Parameters:
  - type: sms|whatsapp
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_001",
      "name": "Order Confirmation",
      "type": "sms",
      "content": "Hi {{customer_name}}, your order #{{order_number}} has been confirmed!"
    }
  ]
}
```

### Automation

#### 1. Get Automation Rules
```http
GET /automation/rules
Authorization: Bearer {accessToken}
Query Parameters:
  - isActive: true|false
  - triggerType: customer_registered|order_placed|etc.
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "auto_001",
        "name": "Welcome Email",
        "triggerType": "customer_registered",
        "actionType": "email",
        "delayMinutes": 0,
        "messageContent": "Welcome to our platform!",
        "isActive": true,
        "totalSent": 150,
        "successRate": 98.50,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "stats": {
      "totalRules": 5,
      "activeRules": 4,
      "totalMessagesSent": 1250,
      "averageSuccessRate": 97.80
    }
  }
}
```

#### 2. Create Automation Rule
```http
POST /automation/rules
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Cart Abandoned",
  "triggerType": "cart_abandoned",
  "actionType": "email",
  "delayMinutes": 60,
  "templateId": "template_005",
  "messageContent": "You left items in your cart!",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "auto_002",
    "name": "Cart Abandoned",
    "triggerType": "cart_abandoned",
    "actionType": "email",
    "delayMinutes": 60,
    "isActive": true,
    "createdAt": "2025-12-01T11:30:00Z"
  },
  "message": "Automation rule created successfully"
}
```

#### 3. Update Automation Rule
```http
PUT /automation/rules/:ruleId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "isActive": false,
  "delayMinutes": 120
}
```

#### 4. Delete Automation Rule
```http
DELETE /automation/rules/:ruleId
Authorization: Bearer {accessToken}
```

#### 5. Get Automation Logs
```http
GET /automation/rules/:ruleId/logs
Authorization: Bearer {accessToken}
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 50)
  - startDate: ISO 8601 date
  - endDate: ISO 8601 date
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "ruleId": "auto_001",
        "customerId": "cust_001",
        "status": "success",
        "executedAt": "2025-12-01T10:00:00Z",
        "details": {
          "messageId": "msg_001",
          "deliveryStatus": "delivered"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

### Orders Management

#### 1. Get All Orders
```http
GET /orders
Authorization: Bearer {accessToken}
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: pending|processing|completed|cancelled
  - customerId: UUID
  - startDate: ISO 8601 date
  - endDate: ISO 8601 date
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord_001",
        "orderNumber": "ORD-2025-001",
        "customer": {
          "id": "cust_001",
          "name": "Alice Johnson",
          "email": "alice.johnson@example.com"
        },
        "totalAmount": 500.00,
        "status": "completed",
        "paymentStatus": "paid",
        "orderType": "online",
        "items": [
          {
            "productId": "prod_001",
            "name": "Home Decor Range",
            "quantity": 2,
            "price": 250.00
          }
        ],
        "createdAt": "2025-11-28T14:30:00Z",
        "deliveredAt": "2025-11-30T16:00:00Z"
      }
    ],
    "pagination": { ... },
    "stats": {
      "totalOrders": 500,
      "totalRevenue": 125000.00,
      "averageOrderValue": 250.00
    }
  }
}
```

#### 2. Create Order
```http
POST /orders
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": "cust_001",
  "orderType": "online",
  "items": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "price": 250.00
    }
  ],
  "totalAmount": 500.00
}
```

#### 3. Update Order Status
```http
PATCH /orders/:orderId/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "completed",
  "paymentStatus": "paid"
}
```

### Products Management

#### 1. Get All Products
```http
GET /products
Authorization: Bearer {accessToken}
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - category: string
  - isActive: true|false
  - search: string
```

#### 2. Create Product
```http
POST /products
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "Home Decor",
  "stockQuantity": 100,
  "image": <file>
}
```

#### 3. Update Product
```http
PUT /products/:productId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "price": 89.99,
  "stockQuantity": 150
}
```

#### 4. Delete Product
```http
DELETE /products/:productId
Authorization: Bearer {accessToken}
```

---

## Data Models

### Customer Model
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate?: Date;
  status: 'active' | 'inactive' | 'blocked';
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model
```typescript
interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  orderType: 'online' | 'offline';
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
```

### Product Model
```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stockQuantity: number;
  salesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Email Campaign Model
```typescript
interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  templateType: 'blank' | 'welcome' | 'promotion' | 'reminder' | 'newsletter';
  recipientType: 'all' | 'with_orders' | 'without_orders' | 'vip' | 'custom';
  recipientIds?: string[];
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}
```

### Message Model
```typescript
interface Message {
  id: string;
  type: 'sms' | 'whatsapp';
  content: string;
  recipientType: 'all' | 'with_orders' | 'without_orders' | 'vip' | 'custom';
  recipientIds?: string[];
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  deliveryRate: number;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}
```

### Automation Rule Model
```typescript
interface AutomationRule {
  id: string;
  name: string;
  triggerType: 'customer_registered' | 'order_placed' | 'order_delivered' |
                'cart_abandoned' | 'birthday' | 'anniversary';
  actionType: 'email' | 'sms' | 'whatsapp';
  delayMinutes: number;
  templateId?: string;
  messageContent?: string;
  isActive: boolean;
  totalSent: number;
  successRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.cateredbyafrica.com', {
  auth: {
    token: 'Bearer {accessToken}'
  }
});
```

### Events to Listen

#### 1. New Order Created
```javascript
socket.on('order:created', (data) => {
  console.log('New order:', data);
  // data: { orderId, customerName, amount, ... }
});
```

#### 2. New Customer Registered
```javascript
socket.on('customer:registered', (data) => {
  console.log('New customer:', data);
  // data: { customerId, name, email, ... }
});
```

#### 3. Email Campaign Sent
```javascript
socket.on('email:sent', (data) => {
  console.log('Email campaign sent:', data);
  // data: { campaignId, sentCount, ... }
});
```

#### 4. Message Delivered
```javascript
socket.on('message:delivered', (data) => {
  console.log('Message delivered:', data);
  // data: { messageId, deliveryStatus, ... }
});
```

#### 5. Automation Triggered
```javascript
socket.on('automation:triggered', (data) => {
  console.log('Automation triggered:', data);
  // data: { ruleId, customerId, status, ... }
});
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "Must be a valid email address"
    }
  },
  "timestamp": "2025-12-01T10:30:00Z"
}
```

---

## Rate Limiting

### Default Limits
- **Authentication endpoints**: 5 requests per minute
- **Read operations (GET)**: 100 requests per minute
- **Write operations (POST/PUT/DELETE)**: 30 requests per minute
- **Email/SMS sending**: 10 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  },
  "timestamp": "2025-12-01T10:30:00Z"
}
```

---

## Webhooks

### Configuring Webhooks
```http
POST /webhooks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "url": "https://yourdomain.com/webhook",
  "events": ["order.created", "customer.registered"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events
- `order.created`
- `order.updated`
- `order.completed`
- `customer.registered`
- `customer.updated`
- `email.sent`
- `message.sent`
- `automation.triggered`

### Webhook Payload
```json
{
  "event": "order.created",
  "timestamp": "2025-12-01T10:30:00Z",
  "data": {
    "orderId": "ord_001",
    "customerId": "cust_001",
    "totalAmount": 500.00,
    "status": "pending"
  },
  "signature": "sha256=..."
}
```

---

## Best Practices

### 1. Authentication
- Always use HTTPS in production
- Store refresh tokens securely
- Implement token rotation
- Use short-lived access tokens (15-60 minutes)

### 2. Data Validation
- Validate all input on the server
- Sanitize user input to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement request size limits

### 3. Performance
- Implement caching (Redis) for frequently accessed data
- Use database indexes for common queries
- Paginate large result sets
- Implement connection pooling

### 4. Security
- Use environment variables for sensitive data
- Implement CORS properly
- Use rate limiting
- Log all authentication attempts
- Encrypt sensitive data at rest

### 5. Monitoring
- Log all errors and exceptions
- Monitor API response times
- Track failed authentication attempts
- Set up alerts for critical errors

---

## Testing

### Example API Test (Jest + Supertest)
```javascript
describe('Customer API', () => {
  it('should create a new customer', async () => {
    const response = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+27123456789'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

---

## Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cateredbyafrica
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@cateredbyafrica.com

# SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=cateredbyafrica-assets
AWS_REGION=us-east-1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domains
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Enable rate limiting
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Enable database connection pooling
- [ ] Set up CI/CD pipeline
- [ ] Configure load balancing
- [ ] Enable API documentation (Swagger/OpenAPI)

---

## Support & Resources

- **API Status**: https://status.cateredbyafrica.com
- **Documentation**: https://docs.cateredbyafrica.com
- **Support Email**: api-support@cateredbyafrica.com
- **Developer Portal**: https://developers.cateredbyafrica.com

---

**Last Updated**: December 1, 2025
**API Version**: v1.0.0
