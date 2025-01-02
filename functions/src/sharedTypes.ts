import type { DocumentReference } from 'firebase/firestore'

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  avatar?: string
  phoneNumber?: string
  location?: string
  workShifts?: DocumentReference[]
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export type CreateUserDTO = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'
>

export type UpdateUserDTO = Partial<
  Omit<User, 'id' | 'createdAt' | 'updatedAt'>
>
