# SetStart - Workflow Management Platform

A modern, AI-powered workflow management platform built with Next.js, designed to help teams and individuals organize projects, track objectives, manage tasks, and collaborate effectively.

![SetStart](https://img.shields.io/badge/SetStart-Workflow%20Management-blue?style=for-the-badge&logo=next.js)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=for-the-badge&logo=prisma)

## 🚀 Features

### 📋 Project Management
- **Multi-workspace Support**: Create and manage multiple project workspaces
- **Visual Workflow Editor**: Interactive flow diagrams with React Flow
- **Project Overview**: Comprehensive project dashboard with key metrics
- **Smart Onboarding**: Guided setup for new users and projects

### 🎯 Objective & Task Management
- **Objective Tracking**: Define and track project objectives with priorities
- **Task Organization**: Categorize tasks by type (Photography, Web Development, etc.)
- **Status Management**: Track task progress (Not Started, In Progress, Complete)
- **Responsibility Assignment**: Assign tasks as In-House or Outsourced
- **Due Date Tracking**: Set and monitor task deadlines

### 👥 Team Collaboration
- **Role Management**: Assign team members to specific roles in workflows
- **Person Profiles**: Manage team member information and avatars
- **Task Assignment**: Assign specific people to tasks
- **Collaborative Editing**: Real-time updates across team members

### 🏷️ Organization & Categorization
- **Tag System**: Categorize projects and workflows with custom tags
- **Product Management**: Track products and variants with pricing
- **Social Links**: Manage project social media profiles and website links
- **File Management**: Upload and manage project assets (logos, banners, etc.)

### 🤖 AI Integration
- **AI-Powered Workflow Generation**: Generate project structures from natural language prompts
- **Smart Suggestions**: AI-assisted project planning and task organization
- **Automated Platform Detection**: Auto-detect social media platforms from URLs

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for optimal viewing
- **Interactive Components**: Rich text editing, drag-and-drop interfaces
- **Real-time Updates**: Live data synchronization across the application

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend & Database
- **Prisma 6.9.0** - Database ORM
- **SQLite** - Database (development)
- **Next.js API Routes** - Server-side API endpoints

### State Management & Data Fetching
- **TanStack Query** - Server state management
- **React Query DevTools** - Development debugging

### Authentication
- **Clerk** - User authentication and management

### AI & External Services
- **AI SDK** - OpenAI, Google, and DeepSeek integration
- **Upstash Redis** - Rate limiting and caching
- **Chart.js** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd setstart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # AI Services (Optional)
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   
   # Upstash Redis (Optional)
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Open Prisma Studio
   npx prisma studio
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
setstart/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Database schema definition
│   └── migrations/        # Database migration files
├── src/
│   ├── actions/           # Server actions for data operations
│   │   ├── objectives/    # Objective management
│   │   ├── people/        # Team member management
│   │   ├── products/      # Product management
│   │   ├── tasks/         # Task management
│   │   └── workflows/     # Workflow management
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Dashboard and workflow pages
│   │   ├── api/           # API routes
│   │   └── workflow/      # Workflow editor components
│   ├── components/        # Reusable UI components
│   │   └── ui/            # Shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   │   └── helpers/       # Helper functions
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles and common styles
├── public/                # Static assets
└── schema/                # Type definitions for database models
```

## 🚀 Usage

### Getting Started

1. **Sign Up/Login**: Create an account or sign in using Clerk authentication
2. **Create Your First Workspace**: Use the onboarding flow to create your first project workspace
3. **Define Objectives**: Set clear objectives for your project
4. **Add Tasks**: Break down objectives into actionable tasks
5. **Assign Team Members**: Add team members and assign roles
6. **Track Progress**: Monitor task completion and project milestones

### Key Features

#### Workflow Management
- Create multiple workspaces for different projects
- Use the visual flow editor to map out project relationships
- Organize projects with tags and categories

#### Task Management
- Create tasks with categories, priorities, and due dates
- Assign tasks to team members
- Track task status and progress
- Link tasks to specific objectives

#### Team Collaboration
- Add team members with roles and responsibilities
- Assign people to specific tasks
- Manage team member profiles and avatars

#### AI-Powered Features
- Generate project structures from natural language descriptions
- Get AI suggestions for task organization
- Automatically detect social media platforms from URLs

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run database migrations
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes to database
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

### Database Schema

The application uses Prisma with SQLite and includes models for:
- **Workflow**: Main project containers
- **Objective**: Project goals and milestones
- **Task**: Individual work items
- **Person**: Team member profiles
- **Product**: Product and variant management
- **SocialLink**: Social media and website links
- **Tag**: Categorization system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all tests pass before submitting PRs
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/setstart/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🔮 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Integration with external project management tools
- [ ] Advanced AI features for project optimization
- [ ] Custom workflow templates
- [ ] Advanced permission system

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Authentication by [Clerk](https://clerk.com/)
- Database management with [Prisma](https://www.prisma.io/)

---

**SetStart** - Streamline your workflow, amplify your productivity.
