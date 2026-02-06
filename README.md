# Knowledge AI - Full Stack Application

A full-stack AI knowledge management system with user authentication, document upload, and LocalStack S3 integration for local development.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with TypeScript
- **Express.js** REST API
- **Prisma** ORM with PostgreSQL
- **JWT** authentication with refresh tokens
- **AWS SDK** for S3 operations
- **bcrypt** for password hashing

### Infrastructure
- **Docker Compose** for orchestration
- **PostgreSQL** database
- **LocalStack** for local AWS S3 emulation

## 📁 Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/          # Page components
│   │   └── api/            # API configuration
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── config/         # Configuration files
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docker-compose.yml       # Docker services configuration
├── init-s3.sh              # LocalStack S3 initialization
└── README.md               # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **pnpm** (recommended) or npm

### 1. Clone and Install Dependencies

```bash
# Install workspace dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install

# Install backend dependencies
cd ../backend
pnpm install
```

### 2. Environment Configuration

Create environment files:

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/knowledge_base?schema=public"
JWT_SECRET="your_super_secret_jwt_key_for_authentication_123456789"

# LocalStack S3 Configuration
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566
S3_BUCKET_NAME=knowledge-base-bucket
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d db

# Generate Prisma client
cd backend
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev
```

### 4. LocalStack S3 Setup

```bash
# Start LocalStack (includes S3 bucket creation)
docker-compose up -d localstack

# Verify S3 service is running
curl http://localhost:4566/_localstack/health
```

## 🚀 Running the Application

### Development Mode

**Start all services:**
```bash
# Start database and LocalStack
docker-compose up -d db localstack

# Terminal 1: Start backend
cd backend
pnpm dev

# Terminal 2: Start frontend
cd frontend
pnpm dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- LocalStack: http://localhost:4566

### Production Mode

```bash
# Build and start all services
docker-compose up --build
```

## 🔐 Authentication

The application uses JWT-based authentication with refresh tokens:

- **Access Token**: Short-lived (15 minutes), stored in localStorage
- **Refresh Token**: Long-lived (7 days), stored as httpOnly cookie
- **Auto-refresh**: Tokens refresh automatically on API calls

### API Endpoints

```
POST /auth/register     # User registration
POST /auth/login        # User login
POST /auth/refresh      # Refresh access token
POST /auth/logout       # Logout user
GET  /auth/me          # Get current user info
```

## 📊 Database Schema

```sql
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🗂️ S3 Integration

### LocalStack Development
- **Endpoint**: http://localhost:4566
- **Bucket**: knowledge-base-bucket
- **Access**: Test credentials (test/test)

### Production Configuration
Update environment variables for real AWS/Azure:
```env
AWS_ENDPOINT=          # Remove for AWS, set for Azure
AWS_REGION=us-east-1   # Your preferred region
AWS_ACCESS_KEY_ID=     # Real credentials
AWS_SECRET_ACCESS_KEY= # Real credentials
```

## 🎨 Frontend Features

### Components
- **Layout**: Responsive sidebar navigation with header
- **Dashboard**: Welcome screen with module overview
- **Login/Register**: Azure-inspired authentication forms
- **AuthContext**: Centralized user state management

### Routing
```
/                    # Redirect to dashboard
/login              # Login page
/register           # Registration page
/dashboard          # Main dashboard
/dashboard/chat     # Chat interface (placeholder)
/dashboard/knowledge # Knowledge base (placeholder)
/dashboard/settings # Settings (placeholder)
```

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build
```

**Backend:**
```bash
pnpm dev        # Start development server
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
```

### Code Style
- **TypeScript** strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | React development server |
| Backend | 3000 | Express.js API server |
| PostgreSQL | 5432 | Database |
| LocalStack | 4566 | AWS services emulation |

## 🔍 Health Checks

```bash
# Check all services
docker-compose ps

# Check LocalStack health
curl http://localhost:4566/_localstack/health

# Check database connection
docker-compose exec db psql -U user -d knowledge_base -c "\dt"
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For questions or issues:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details