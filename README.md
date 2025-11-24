# Marketing Dashboard - Catered by Africa

A comprehensive marketing dashboard UI built with React and Vite, featuring SEO performance tracking and Google Analytics integration.

## Features

### SEO Section
- **Key Metrics**: Organic traffic, keyword rankings, backlinks, and domain authority
- **Top Keywords**: Track keyword positions, search volume, and difficulty
- **Technical SEO**: Monitor page speed, mobile-friendliness, core web vitals, indexed pages, and crawl errors
- **Content Performance**: Overview of total pages, blog posts, average word count, and content quality score

### Google Analytics Section
- **Overview Metrics**: Total users, sessions, bounce rate, and average session duration
- **Real-time Data**: Live active users and top active pages
- **Traffic Sources**: Visual breakdown of traffic from organic search, direct, social media, referral, and email
- **Top Pages**: Most visited pages with views, average time on page, and bounce rates
- **Device Breakdown**: Visual chart showing desktop, mobile, and tablet usage
- **Goal Completions**: Track conversions and goal values
- **Demographics**: Top countries with user counts

## Tech Stack

- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with CSS variables for theming
- **Lucide React** - Beautiful icon library

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
│   ├── MarketingDashboard.jsx    # Main dashboard container
│   ├── MarketingDashboard.css
│   ├── SEOSection.jsx             # SEO metrics and analytics
│   ├── SEOSection.css
│   ├── GoogleAnalyticsSection.jsx # Google Analytics metrics
│   └── GoogleAnalyticsSection.css
├── App.jsx                         # Root component
├── App.css
├── main.jsx                        # Application entry point
└── index.css                       # Global styles
```

## Features Overview

### Dashboard Navigation
- **Overview**: Combined view of both SEO and Analytics sections
- **SEO**: Dedicated SEO performance view
- **Google Analytics**: Dedicated analytics view

### Responsive Design
- Fully responsive layout that works on desktop, tablet, and mobile devices
- Adaptive grid layouts for different screen sizes
- Touch-friendly interface for mobile users

### Visual Design
- Modern gradient accents
- Clean card-based layout
- Smooth animations and transitions
- Consistent color scheme using CSS variables

## Mock Data

The dashboard currently uses mock data for demonstration purposes. In a production environment, you would integrate with:
- Google Search Console API for SEO data
- Google Analytics API for traffic and user data
- SEO tools like SEMrush, Ahrefs, or Moz for additional metrics

## Customization

### Theme Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  /* ... */
}
```

## Future Enhancements

- Real API integrations (Google Analytics, Search Console)
- Date range selector
- Export reports to PDF/CSV
- Email report scheduling
- Custom dashboard widgets
- Dark mode support
- Multi-language support

## License

MIT License - feel free to use this project for your own purposes.
