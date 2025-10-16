# ClientDocs Guard

A comprehensive document management and sharing platform built with Next.js 14, Supabase, and modern web technologies.

## 🚀 Features

### Core Features
- **Document Management**: Upload, organize, and manage documents
- **Secure Sharing**: Share documents with users and groups via signed URLs
- **Client Groups**: Organize clients into groups for efficient document distribution
- **Access Control**: Role-based permissions and authentication
- **File Analytics**: Track views, downloads, and access patterns
- **Watermarking**: Add watermarks to shared documents
- **AI Integration**: Document Q&A and client explanations

### Advanced Features
- **Signed URLs**: Secure, time-limited access to shared documents
- **Group Management**: Create and manage client groups with member roles
- **Access Logs**: Detailed logging of document access and downloads
- **File Expiry**: Set expiration dates for shared documents
- **Download Limits**: Control how many times documents can be downloaded
- **View-Only Mode**: Share documents for viewing without download capability

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenRouter API integration
- **PDF Processing**: pdf-lib for watermarks
- **UI Components**: Radix UI, Lucide React icons

## 📁 Project Structure

```
clientdocs-guard/
├── app/                          # Next.js 14 App Router
│   ├── admin/                   # Admin dashboard pages
│   │   ├── files/              # File management
│   │   ├── groups/             # Group management
│   │   ├── users/              # User management
│   │   └── analytics/          # Analytics dashboard
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── files/             # File operations
│   │   ├── groups/            # Group management
│   │   ├── shares/            # Document sharing
│   │   └── analytics/         # Analytics data
│   ├── auth/                  # Authentication pages
│   └── dashboard/             # User dashboard
├── components/                 # Reusable UI components
│   ├── admin/                # Admin-specific components
│   ├── auth/                 # Authentication components
│   ├── dashboard/            # Dashboard components
│   ├── files/                # File-related components
│   └── ui/                   # Base UI components
├── lib/                      # Utility libraries
│   ├── supabase/            # Supabase client configurations
│   └── utils.ts             # Common utilities
├── prisma/                   # Database schema
├── types/                    # TypeScript type definitions
└── docs/                     # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clientdocs-guard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENROUTER_API_KEY=your_openrouter_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Run the complete database setup
   # Execute docs/database/SETUP.sql in Supabase SQL Editor
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Register an account or login
   - Access admin features at `/admin`

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Complete installation and configuration
- [API Documentation](docs/API.md) - API endpoints and usage
- [Database Schema](docs/DATABASE.md) - Database structure and relationships
- [Feature Guide](docs/FEATURES.md) - Detailed feature explanations
- [Deployment](docs/DEPLOYMENT.md) - Production deployment guide
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the database migration scripts
3. Set up storage buckets
4. Configure RLS policies

### Storage Configuration
- Create a `documents` bucket in Supabase Storage
- Set appropriate RLS policies
- Configure public access for shared documents

## 🎯 Core Workflows

### Document Sharing
1. Upload document to `/admin/upload`
2. Share via `/admin/files` → Actions → Share
3. Select users or groups
4. Configure sharing options (expiry, download limits, watermarks)
5. Generate secure share link

### Group Management
1. Create groups at `/admin/client-groups`
2. Add members to groups
3. Share documents to groups
4. Members access via group pages `/admin/groups/[groupId]`

### User Roles
- **Super Admin**: Full system access
- **Admin**: User and content management
- **User**: Basic document access and sharing

## 🔒 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control
- **Row Level Security**: Database-level security policies
- **Signed URLs**: Time-limited, secure document access
- **Access Logging**: Complete audit trail
- **File Validation**: Upload restrictions and validation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
- Docker support available
- Environment variables required
- Database migrations needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Review [Issues](https://github.com/your-repo/issues)
- Contact: support@clientdocs-guard.com

## 🗺️ Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for upcoming features and development plans.

---

**Built with ❤️ for secure document management**