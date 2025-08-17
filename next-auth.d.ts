import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      userType: 'borrower' | 'lender' | 'admin'
      entityType: 'company' | 'individual'
      company?: string
      isApproved: boolean
      isActive: boolean
      isSuperAdmin?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    userType: 'borrower' | 'lender' | 'admin'
    entityType: 'company' | 'individual'
    company?: string
    isApproved: boolean
    isActive: boolean
    isSuperAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userType: 'borrower' | 'lender' | 'admin'
    entityType: 'company' | 'individual'
    company?: string
    isApproved: boolean
    isActive: boolean
    isSuperAdmin?: boolean
  }
}
