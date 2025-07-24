# E-Brochure Creator Application

## Overview

This is a full-stack web application for creating digital brochures and promotional campaigns. The system allows users to create campaigns by selecting products, applying discounts, and generating professional brochures. Built with a React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
The application follows a monorepo structure with separate client and server directories, sharing common types and schemas through a shared directory. The system uses modern web technologies with TypeScript throughout for type safety.

### Frontend Architecture
- **Framework**: React 18 with Vite for development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database**: PostgreSQL with Drizzle ORM
- **File Uploads**: Multer for handling file uploads (templates, logos)
- **Development**: Hot reload with Vite integration

## Key Components

### Authentication System
- Simple username/password authentication
- Client-side session management with localStorage
- Protected routes requiring authentication
- Default test credentials (username: "test", password: "test")

### Campaign Management
- Campaign creation with product selection
- Product search and filtering by category
- Discount calculation and pricing management
- Campaign status tracking (draft, active, completed)

### Product Management
- Product catalog with categories (Electronics, Fashion, Home & Garden)
- Product search functionality
- Image handling for product displays
- Price management with discount calculations

### Template System
- Custom template upload functionality
- Template management for brochure generation
- File storage for template assets
- Thumbnail generation for template previews

### Logo Management
- Company logo upload and management
- Active logo selection for brochures
- File storage for logo assets

### Brochure Generation
- Visual brochure editor with template selection
- Product positioning on brochures
- Company branding integration
- PDF generation for final output

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to backend API endpoints
2. Backend processes requests and interacts with PostgreSQL database
3. Responses are returned as JSON with appropriate status codes
4. TanStack Query manages caching and state synchronization

### File Upload Flow
1. Files uploaded through multipart/form-data
2. Multer middleware processes uploads to local storage
3. File paths stored in database for reference
4. Files served through static routes or API endpoints

### Campaign Creation Workflow
1. User searches and selects products
2. Products added to campaign with quantities and discounts
3. Template and logo selected for brochure design
4. Campaign saved as draft or activated
5. Brochure generated and available for download

## External Dependencies

### Database
- **Neon Database**: PostgreSQL hosting service
- **Connection**: Uses @neondatabase/serverless for connections
- **Migrations**: Drizzle Kit for schema management

### UI Components
- **Radix UI**: Comprehensive set of unstyled, accessible components
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel/slider functionality
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **Vite**: Build tool and development server
- **ESBuild**: Fast JavaScript bundler for production
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Build Process
1. Frontend built using Vite to static assets in `dist/public`
2. Backend bundled using ESBuild to `dist/index.js`
3. Single deployable artifact with server serving static files

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development vs production mode detection
- File upload directory configuration

### Production Considerations
- Static file serving for uploaded assets
- Database connection pooling
- Error handling and logging
- CORS configuration for cross-origin requests

## Recent Changes: Latest modifications with dates

### January 24, 2025 - Enhanced Design Experience
- **Date Management**: Date selector moved outside design area for better UX
- **Interactive Elements**: Added draggable date elements on each brochure page 
- **Logo Interaction**: Logo area now clickable for upload/removal in Design view
- **Auto Layout**: Added automatic product arrangement feature enabled by default
- **Export Quality**: Enhanced JPEG download with 2x scale and 95% quality
- **Multi-page Support**: Fixed Create Campaign button and ZIP download for multiple pages

### Development Environment
- Hot module replacement for frontend
- TypeScript compilation checking
- Automatic server restart on changes
- Integrated error overlay for development

The application provides a complete solution for digital brochure creation with a focus on user experience, performance, and maintainability. The modular architecture allows for easy extension and modification of features while maintaining type safety throughout the stack.