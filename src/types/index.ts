export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_picture?: string
  date_joined?: string
}

export interface Task {
  id: number
  title: string
  description: string
  category: 'Cleaning' | 'Delivery' | 'Moving' | 'Repair' | 'Tutoring' | 'Other'
  budget: number
  location: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  creator: User
  applications?: Application[]
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: number
  title: string
  description: string
  category: 'personal' | 'business' | 'charity' | 'community' | 'other'
  target_amount: number
  raised_amount: number
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  creator: User
  end_date: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: number
  task: number
  applicant: User
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Transaction {
  id: number
  amount: number
  type: 'credit' | 'debit'
  status: 'pending' | 'completed' | 'failed'
  description: string
  reference: string
  created_at: string
}

export interface Wallet {
  balance: number
  currency: string
}

export interface Payment {
  id: number
  amount: number
  status: 'pending' | 'success' | 'failed'
  reference: string
  campaign?: number
  created_at: string
}

export interface Contribution {
  id: number
  campaign: number
  contributor: User
  amount: number
  created_at: string
}