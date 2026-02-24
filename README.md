# SPACE Point System

This is a code bundle for Buddy Point System. The original project is available at https://www.figma.com/design/pyYKJa93e6sHizoDlNTT7Z/Buddy-Point-System.

## Features

- 🔐 **Authentication**: Student ID login and Kakao OAuth login
- 📊 **Point Management**: Track and manage student points
- 📅 **Event System**: Create and manage campus events with image uploads
- 🎁 **Rental System**: Manage equipment rental
- 👥 **Admin Panel**: Comprehensive admin dashboard
- 📱 **Responsive Design**: Optimized for mobile and desktop
- 📷 **Image Upload**: Supabase Storage integration for event and item images
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 🎨 **UI**: Tailwind CSS with Framer Motion animations

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth + Kakao OAuth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **UI Components**: Radix UI + shadcn/ui

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Kakao credentials

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

## Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [KAKAO_LOGIN_GUIDE.md](KAKAO_LOGIN_GUIDE.md) - Kakao OAuth configuration
- [SUPABASE_STORAGE_GUIDE.md](SUPABASE_STORAGE_GUIDE.md) - Image upload setup
- [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) - Frontend-Backend integration guide

## Project Structure

```
Spacepointsystem/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (backend)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event management
│   │   ├── rentals/      # Rental management
│   │   ├── users/        # User management
│   │   └── upload/       # Image upload
│   ├── admin/            # Admin pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── ...               # Other pages
├── src/
│   ├── components/       # React components
│   │   ├── pages/       # Page components
│   │   └── ui/          # UI components
│   └── lib/             # Utilities
│       ├── api.ts       # API client functions
│       ├── auth.ts      # Authentication service
│       └── supabase/    # Supabase clients
├── prisma/
│   └── schema.prisma    # Database schema
└── ...
```

## API Routes

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/kakao/callback` - Kakao OAuth callback

### Events

- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Rental Items

- `GET /api/rental-items` - List all rental items
- `POST /api/rental-items` - Create rental item
- `GET /api/rental-items/[id]` - Get item details
- `PUT /api/rental-items/[id]` - Update item
- `DELETE /api/rental-items/[id]` - Delete item

### Rentals

- `GET /api/rentals` - List all rentals
- `POST /api/rentals` - Create rental
- `GET /api/rentals/[id]` - Get rental details
- `POST /api/rentals/[id]/return` - Return rental

### Users

- `GET /api/users` - List all users (admin only)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `POST /api/users/[id]/points` - Add points to user

### Upload

- `POST /api/upload/image` - Upload image
- `DELETE /api/upload/image` - Delete image

## Current Status

### ✅ Completed

- Backend API routes (all endpoints)
- Database schema and migrations
- Kakao OAuth integration
- Image upload API
- Authentication service
- LoginPage with API integration
- SignUpPage with API integration

### ⚠️ In Progress

Most pages are still using `AppContext` (local memory) instead of API calls. See [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) for migration instructions.

### 📝 To Do

- Migrate all pages from AppContext to API calls
- Add error handling and loading states
- Add data caching (React Query or SWR)
- Add pagination for list endpoints
- Add search and filter functionality

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Open Prisma Studio
npx prisma studio
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=

# Kakao OAuth (optional)
NEXT_PUBLIC_KAKAO_REST_API_KEY=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
