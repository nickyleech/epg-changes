# EPG Changes Management System

Professional system for managing Electronic Programme Guide changes for British TV providers.

## Overview

This system allows you to:
- **Create new entries** easily with structured forms
- **Present entries neatly** for professional viewing
- **Email changes** to two different email addresses
- **Manage EPG information links** with easy add/delete functionality
- **Archive EPG channel lists** for UK providers (Sky, Virgin Media, Freeview)
- **Mobile-friendly interface** with British English throughout

## Features

### 📝 Entry Management
- Create, edit, and delete EPG change entries
- Professional form layout with validation
- Search and filter functionality
- Date-based organisation
- Status tracking (Pending, In Progress, Completed)

### 📧 Email Integration
- Send updates to two configured email addresses
- Pre-formatted email templates
- Summary generation of changes
- One-click email composition

### 🔗 Links Management
- Add EPG change information links
- Categorised link storage
- Easy delete functionality
- Quick access dashboard

### 📺 Channel Archive
- **Sky** channel listings
- **Virgin Media** channel listings
- **Freeview** channel listings
- Search within archives
- Version control and dating
- Export functionality

### 📱 Professional Interface
- Mobile-responsive design
- British English terminology
- Clean, modern UI
- Intuitive navigation
- Professional colour scheme

## Technical Implementation

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Local Storage (upgradeable to database)

### Project Structure
```
epg-changes/
├── app/
│   ├── page.tsx                 # Main dashboard
│   ├── entries/
│   │   ├── page.tsx            # Entries management
│   │   └── [id]/page.tsx       # Individual entry view
│   ├── links/
│   │   └── page.tsx            # Links management
│   ├── archive/
│   │   └── page.tsx            # Channel archive
│   └── components/
│       ├── EntryForm.tsx       # Entry creation/editing
│       ├── EntryList.tsx       # Display entries
│       ├── EmailForm.tsx       # Email functionality
│       ├── LinksManager.tsx    # Links CRUD
│       └── ChannelArchive.tsx  # Channel lists
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   └── storage.ts              # Local storage utilities
└── styles/
    └── globals.css             # Tailwind CSS
```

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation
1. **Create Next.js Project**
   ```bash
   npx create-next-app@15 epg-changes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   cd epg-changes
   ```

2. **Install Dependencies**
   ```bash
   npm install lucide-react
   ```

3. **Create Directory Structure**
   ```bash
   mkdir -p src/app/entries src/app/links src/app/archive
   mkdir -p src/components src/lib src/types
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

## Development Workflow

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

### Data Structure

#### EPG Entry
```typescript
interface EPGEntry {
  id: string;
  date: string;
  channel: string;
  provider: 'Sky' | 'Virgin Media' | 'Freeview' | 'Other';
  changeType: 'New Channel' | 'Channel Removal' | 'EPG Update' | 'Technical Change';
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
  emailSent: boolean;
}
```

#### Link
```typescript
interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: string;
}
```

#### Channel Archive
```typescript
interface ChannelArchive {
  id: string;
  provider: 'Sky' | 'Virgin Media' | 'Freeview';
  channels: Channel[];
  version: string;
  createdAt: string;
}
```

## Email Configuration

### Email Templates
- **Change Summary**: Professional format for EPG changes
- **Emergency Updates**: Urgent change notifications
- **Weekly Reports**: Scheduled summary emails

### Recipients
Configure two email addresses in the settings:
- Primary recipient (e.g., team lead)
- Secondary recipient (e.g., backup contact)

## UK Provider Support

### Sky
- Full channel listings management
- EPG number tracking
- Regional variations support

### Virgin Media
- Channel position management
- Package-specific listings
- Regional channel support

### Freeview
- Multiplexer information
- Regional variation tracking
- Channel availability by area

## Mobile Optimisation

- **Responsive Design**: Works perfectly on all device sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Offline Support**: Local storage for offline access
- **Fast Loading**: Optimised for mobile networks

## Security Features

- **Input Validation**: All forms validated client and server-side
- **Data Sanitisation**: XSS protection built-in
- **Local Storage**: No sensitive data stored remotely
- **Email Protection**: No direct email sending (uses mailto:)

## Future Enhancements

- **Database Integration**: PostgreSQL or MongoDB support
- **User Authentication**: Multi-user support
- **API Integration**: Connect to provider APIs
- **Automated Backups**: Scheduled data backups
- **Report Generation**: PDF/Excel export functionality

## British English Compliance

- Proper spelling (colour, organisation, etc.)
- British date formats (DD/MM/YYYY)
- UK-specific terminology
- Professional tone throughout

## Support

For issues or feature requests, please refer to the project documentation or contact the development team.

---

*EPG Changes Management System - Professional Electronic Programme Guide management for British television providers*