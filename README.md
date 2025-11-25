# Catered by Africa - Management Dashboard

A comprehensive customer management and communication dashboard built with React and Vite. This platform helps you manage customers, track orders, and automate communications for your catering business.

## Features

### 1. Customer Management
- **Customer List**: View all customers with detailed information
  - Search and filter capabilities
  - Customer avatars and contact details
  - Order history and total spending
  - Status indicators (New, Active, VIP)
  - Quick action buttons for emails and messages
- **Statistics Dashboard**:
  - Total customers count
  - New customers today
  - Customers with orders
  - Customers without orders

### 2. Customer Segmentation
- **Segment by Order Status**: Separate customers into two groups
  - **Customers with Orders**: View purchasing history, total spent, average order value, and last order date
  - **Customers without Orders**: Track days since registration, source, and last activity
- **Conversion Analytics**: Monitor conversion rates and potential revenue
- **Bulk Actions**: Export lists and send targeted communications

### 3. Email Communication
- **Email Composer**: Rich email composition interface
  - Pre-built templates (Welcome, Promotion, Reminder, Newsletter)
  - Recipient segmentation
  - Subject and message editor
  - Save drafts functionality
- **Email Statistics**:
  - Total emails sent this month
  - Average open rate
  - Average click rate
- **Email History**: Track all sent emails with performance metrics

### 4. Messaging Center
- **Multi-Channel Messaging**: Send SMS and WhatsApp messages
- **Quick Templates**: Pre-built message templates for common scenarios
  - Order Confirmation
  - Delivery Update
  - Thank You message
  - Special Offers
- **Character Counter**: Real-time SMS character and message count
- **Messaging Statistics**:
  - SMS sent this month
  - WhatsApp messages sent
  - Delivery rate tracking
- **Message History**: View all sent messages with delivery status

### 5. Message Automation
- **Automated Workflows**: Create rule-based automated messages
  - Trigger events (Customer registered, Order placed, Cart abandoned, etc.)
  - Multi-channel support (Email, SMS, WhatsApp)
  - Configurable delays
- **Automation Templates**:
  - Welcome new customers
  - Order confirmations
  - Abandoned cart reminders
  - Post-delivery follow-ups
  - Re-engagement campaigns
- **Performance Tracking**:
  - Total messages sent per automation
  - Success rates
  - Active/Paused status control
- **Visual Management**: Toggle automations on/off with intuitive switches

## Tech Stack

- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with CSS variables for theming
- **SVG Icons** - Inline SVG icons for performance

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── MarketingDashboard.jsx        # Main dashboard container with navigation
│   ├── MarketingDashboard.css
│   ├── CustomerList.jsx              # Customer list with search and filters
│   ├── CustomerList.css
│   ├── CustomerSegmentation.jsx      # Segment customers by order status
│   ├── CustomerSegmentation.css
│   ├── EmailSection.jsx              # Email composition and history
│   ├── EmailSection.css
│   ├── MessagingSection.jsx          # SMS and WhatsApp messaging
│   ├── MessagingSection.css
│   ├── AutomationSection.jsx         # Automated message workflows
│   └── AutomationSection.css
├── App.jsx                            # Root component
├── App.css
├── main.jsx                           # Application entry point
└── index.css                          # Global styles
```

## Features Overview

### Dashboard Navigation
The dashboard features a modern tabbed interface with icons:
- **Customers**: Manage all customer information
- **Segmentation**: View customers by order status
- **Email**: Send and track email campaigns
- **Messages**: Send SMS and WhatsApp messages
- **Automation**: Set up automated communication workflows

### Responsive Design
- Fully responsive layout that works on desktop, tablet, and mobile devices
- Adaptive grid layouts for different screen sizes
- Touch-friendly interface for mobile users
- Optimized tables with horizontal scrolling on small screens

### Visual Design
- Modern gradient accents and color schemes
- Clean card-based layout
- Smooth animations and transitions
- Consistent color scheme using CSS variables
- Status badges and visual indicators
- Interactive toggles and buttons

## Mock Data

The dashboard currently uses mock data for demonstration purposes. In a production environment, you would integrate with:
- Backend API for customer data
- Email service providers (SendGrid, Mailgun, etc.)
- SMS/WhatsApp providers (Twilio, MessageBird, etc.)
- Order management system
- Analytics and tracking systems

## Customization

### Theme Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  /* ... */
}
```

### Adding New Automations
To add new automation triggers, edit the `triggers` array in `AutomationSection.jsx`:
```javascript
const triggers = [
  { value: 'your_trigger', label: 'Your Trigger Name', icon: '🎯' },
  // ... more triggers
]
```

## Use Cases

This dashboard is perfect for:
- **Catering Businesses**: Manage event orders and client communications
- **Food Delivery Services**: Track customers and automate order updates
- **Restaurant Chains**: Segment customers and send targeted promotions
- **Event Management**: Follow up with clients and automate reminders
- **E-commerce Platforms**: Recover abandoned carts and engage customers

## Future Enhancements

- Real backend API integration
- Advanced analytics and reporting
- Customer lifetime value calculation
- A/B testing for email campaigns
- Integration with CRM systems
- Export functionality (CSV, PDF)
- Calendar view for scheduled automations
- Dark mode support
- Multi-language support
- Real-time notifications
- Advanced customer filtering

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues, questions, or contributions, please open an issue in the repository.
