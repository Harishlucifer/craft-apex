import { Address } from './common';

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'employee' | 'customer';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  address?: Address;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Employee specific types
export interface EmployeeTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Partner specific types
export interface PartnerMetrics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  revenue: number;
  period: 'day' | 'week' | 'month' | 'year';
}

// Customer specific types
export interface CustomerSupport {
  id: string;
  customerId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}