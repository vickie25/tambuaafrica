# Tambua Africa Tours & Safaris

A modern, full-stack web application for safari bookings and travel management built with React, TypeScript, Vite, Supabase, and Stripe.

## 🚀 Features

- **Modern React Architecture**: Built with React 18, TypeScript, and Vite
- **Authentication**: Secure user authentication with Supabase Auth
- **Database**: PostgreSQL with Supabase (Row Level Security enabled)
- **Payments**: Stripe integration for secure safari bookings
- **Admin Dashboard**: Complete CMS for managing safaris, destinations, and blogs
- **PWA Ready**: Progressive Web App with offline capabilities
- **Performance Optimized**: Lazy loading, code splitting, and caching
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **SEO Friendly**: Server-side rendering ready with proper meta tags

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel
- **Testing**: Vitest, Playwright
- **Linting**: ESLint

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Rainhard-Bonnke/tambua-next-wave.git
cd tambua-next-wave
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email
VITE_RESEND_API_KEY=your_resend_api_key
COMPANY_EMAIL=your_company_email
```

### 3. Database Setup

```bash
# Apply database migrations
npm run setup-db

# Set up storage bucket for images
npm run setup-storage
```

### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   ├── home/           # Homepage sections
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   └── ui/             # Base UI components (shadcn/ui)
├── contexts/           # React contexts (Auth, etc.)
├── data/               # Static data and types
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions and configurations
├── pages/              # Page components
└── test/               # Test files

supabase/
├── config.toml         # Supabase configuration
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── SETUP.md           # Setup instructions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npm run setup-db         # Apply database migrations
npm run setup-storage    # Set up storage bucket

# Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure user sessions with Supabase Auth
- **CORS Protection**: Configured for production domains
- **Input Validation**: Zod schemas for form validation
- **HTTPS Only**: All external requests use HTTPS
- **Service Role Protection**: Sensitive operations use service role key

## 📊 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic compression and WebP conversion
- **Caching**: PWA with intelligent caching strategies
- **Bundle Analysis**: Optimized chunk sizes and tree shaking

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npx playwright test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email cresdynamics@gmail.com or create an issue in this repository.

## 🔄 Recent Updates

- ✅ Fixed Supabase project ID mismatch
- ✅ Implemented lazy loading for better performance
- ✅ Added error boundaries around admin components
- ✅ Optimized Vite build configuration
- ✅ Enhanced PWA caching strategies
- ✅ Improved authentication timeout handling
- ✅ Added comprehensive Vercel deployment config
- ✅ Created automated storage bucket setup
- ✅ Fixed blog detail loading issues
- ✅ Added proper TypeScript types throughout

---

**Built with ❤️ for the African safari experience**

- **Build**: `npm run build`
- **Test**: `npm run test`
- **Lint**: `npm run lint`
- **Format**: `npm run format`

## Deployment

Follow the build process and deploy using your preferred hosting platform.

### Bookings and payments (Phase 2)

- **Stripe (card checkout)**  
  - In Supabase, set `safaris.stripe_price_id` to a real **Stripe Price ID** (`price_...`) for each bookable package. An empty string blocks checkout.  
  - `STRIPE_SECRET_KEY` is already expected in Supabase **Edge Function secrets** for `create-checkout` / `verify-payment`.  
  - If JWT verification errors appear with ES256 tokens, deploy payment functions with **`--no-verify-jwt`** (app code still validates the user JWT in the function).  
  - Optional: add `SMOKE_STRIPE_PRICE_ID=price_...` in `.env` to run `node scripts/smoke-booking-payments.cjs` when DB price IDs are not filled yet.  

- **M-Pesa**  
  - Set in Supabase secrets: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, and optionally `MPESA_ENVIRONMENT`, `SUPABASE_PROJECT_REF`, then deploy `mpesa-stk-push`.  

- **Live smoke**  
  - `node scripts/smoke-booking-payments.cjs` (creates a test user, booking, calls checkout/M-Pesa, then cleans up).

## Contributing

Please ensure all tests pass and code follows the linting standards before submitting pull requests.
