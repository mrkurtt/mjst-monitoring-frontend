import { 
  FileText, Users, BookOpen, XCircle, Upload, 
  LayoutDashboard, FileSpreadsheet, CheckCircle,
  XSquare, UserCog, UploadIcon, Layers, 
  FileCheck, UserPlus, Settings
} from 'lucide-react';

// Navigation menu items with icons for Directors
export const directorMenuItems = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'MANUSCRIPT PROCESSING',
    items: [
      { name: 'Pre-Review', id: 'pre-review', icon: FileText },
      { name: 'Double-Blind', id: 'double-blind', icon: FileSpreadsheet },
      { name: 'Published', id: 'published', icon: BookOpen },
      { name: 'Rejected', id: 'rejected', icon: XSquare }
    ]
  },
  {
    title: 'USER MANAGEMENT',
    items: [
      { name: 'Reviewers Info', id: 'reviewers-info', icon: Users },
      { name: 'Editors Info', id: 'editors-info', icon: UserCog }
    ]
  },
  {
    title: 'ACCOUNT SETTINGS',
    description: 'Manage system accounts and permissions',
    items: [
      { name: 'Create Account', id: 'create-account', icon: UserPlus }
    ]
  }
];

// Staff navigation menu items with icons
export const staffMenuItems = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'MANUSCRIPT PROCESSING',
    items: [
      {
        name: 'Pre-Review',
        id: 'pre-review',
        icon: FileText,
        items: [
          { name: 'Upload', id: 'pre-review-upload', icon: Upload },
          { name: 'Records', id: 'pre-review-records', icon: FileText }
        ]
      },
      { name: 'Double-Blind', id: 'double-blind', icon: FileSpreadsheet },
      {
        name: 'Accepted',
        id: 'accepted',
        icon: CheckCircle,
        items: [
          { name: 'Layouting', id: 'layouting', icon: Layers },
          { name: 'Final Proofreading', id: 'final-proofreading', icon: FileCheck }
        ]
      },
      { name: 'Published', id: 'published', icon: BookOpen },
      { name: 'Rejected', id: 'rejected', icon: XCircle }
    ]
  },
  {
    title: 'USER MANAGEMENT',
    items: [
      { name: 'Reviewers Info', id: 'reviewers-info', icon: Users },
      { name: 'Editors Info', id: 'editors-info', icon: UserCog }
    ]
  },
  {
    title: 'ACCOUNT SETTINGS',
    description: 'Manage system accounts and permissions',
    items: [
      { name: 'Create Account', id: 'create-account', icon: UserPlus }
    ]
  }
];