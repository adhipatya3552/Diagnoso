# Diagnosa - Healthcare Platform

A modern, full-stack healthcare platform that connects doctors and patients seamlessly. Built with React, TypeScript, and Supabase for secure, HIPAA-compliant healthcare management.

## 🏥 Overview

Diagnosa is a comprehensive healthcare platform that enables:
- **For Patients**: Easy appointment booking, health tracking, secure messaging with doctors, and medical report management
- **For Doctors**: Patient management, appointment scheduling, prescription creation, and secure communication
- **For Admins**: Platform oversight and user management

## ✨ Features

### 🔐 Authentication & Security
- Role-based authentication (Patient, Doctor, Admin)
- HIPAA-compliant data protection
- Secure user sessions with Supabase Auth
- Protected routes with role-based access control

### 👥 User Management
- **Patient Features**:
  - Profile management with medical history
  - Doctor search and booking
  - Appointment calendar and reminders
  - Health metrics tracking
  - Medical reports upload/view
  - Secure chat with doctors

- **Doctor Features**:
  - Professional profile management
  - Patient appointment management
  - Prescription creation and history
  - Calendar and availability management
  - Patient communication tools

- **Admin Features**:
  - Platform oversight dashboard
  - User management and approvals

### 📅 Appointment System
- Real-time appointment booking
- Calendar integration (Day, Week, Month views)
- Appointment reminders and notifications
- Video/phone/in-person consultation support
- Waitlist management

### 💬 Communication
- Real-time chat between doctors and patients
- File sharing and attachments
- Message history and search
- Typing indicators and read receipts

### 📊 Health Tracking
- Health metrics visualization
- Goal tracking and progress monitoring
- Health timeline and history
- Medical reports management

### 🔔 Notifications
- Real-time notification system
- Appointment reminders
- Customizable notification preferences
- Toast notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - File storage
  - Row Level Security (RLS)

### State Management
- **Zustand** - Lightweight state management
- **React Context** - Global state for auth and chat

### Additional Libraries
- **@dnd-kit** - Drag and drop functionality
- **date-fns** - Date manipulation
- **uuid** - Unique identifier generation
- **@emoji-mart** - Emoji picker

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Set up a Supabase project
   - Run the migrations in `supabase/migrations/` to create the database schema
   - Configure Row Level Security (RLS) policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Copy your project URL and anon key
3. Update your `.env` file
4. Run database migrations

### Database Schema
The application uses the following main tables:
- `users` - User accounts and authentication
- `patient_profiles` - Patient-specific information
- `doctor_profiles` - Doctor-specific information
- `appointments` - Appointment scheduling
- `messages` - Chat messages
- `notifications` - User notifications

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Customizable appearance
- **Animations** - Smooth transitions and micro-interactions
- **Accessibility** - WCAG compliant components
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages

## 🔒 Security Features

- **Authentication** - Secure user authentication with Supabase
- **Authorization** - Role-based access control
- **Data Encryption** - End-to-end encryption for sensitive data
- **Input Validation** - Client and server-side validation
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Content Security Policy

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices with:
- Touch-friendly interfaces
- Mobile-optimized navigation
- Responsive layouts
- Progressive Web App (PWA) features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for better healthcare** 
