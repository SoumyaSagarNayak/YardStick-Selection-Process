# Multi-Tenant SaaS Notes Application

A secure multi-tenant SaaS application for managing notes with role-based access control and subscription limits.

## Architecture

### Multi-Tenancy Approach: Shared Schema with Tenant ID

We've chosen the **shared schema with tenant ID column** approach for the following reasons:

1. **Cost Efficiency**: Single database instance reduces infrastructure costs
2. **Maintenance**: Easier to maintain and backup compared to multiple schemas/databases
3. **Scalability**: Can handle multiple tenants efficiently with proper indexing
4. **Security**: Row-level security (RLS) policies ensure strict tenant isolation

### Database Schema

- **tenants**: Stores tenant information (slug, name, subscription plan)
- **users**: User accounts with tenant association and roles
- **notes**: Notes with tenant isolation and user ownership

### Security Features

- JWT-based authentication
- Row-level security (RLS) for tenant isolation
- Role-based access control (Admin/Member)
- Subscription-based feature gating

## Test Accounts

All accounts use password: `password`

- `admin@acme.test` (Admin, Acme tenant)
- `user@acme.test` (Member, Acme tenant)
- `admin@globex.test` (Admin, Globex tenant)
- `user@globex.test` (Member, Globex tenant)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Notes (CRUD)
- `POST /api/notes` - Create a note
- `GET /api/notes` - List all notes for current tenant
- `GET /api/notes/[id]` - Retrieve specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Tenant Management
- `POST /api/tenants/[slug]/upgrade` - Upgrade tenant subscription (Admin only)

### Health Check
- `GET /api/health` - Health status

## Subscription Plans

- **Free Plan**: Maximum 3 notes per tenant
- **Pro Plan**: Unlimited notes

## Deployment

The application is deployed on Vercel with:
- Frontend: Next.js application
- Backend: Next.js API routes
- Database: Supabase PostgreSQL
- CORS enabled for external access

## Getting Started

1. Set up Supabase project and configure environment variables
2. Run database migrations
3. Deploy to Vercel
4. Access the application and test with provided accounts