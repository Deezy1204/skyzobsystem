import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export type Department = 'marketing' | 'programming' | 'technical' | 'admin' | 'finance' | 'systemAdmin'

export interface AppUserProfile {
  uid: string
  displayName?: string
  email: string
  department: Department
  role: 'user' | 'admin'
  signatureRef?: string
}

interface AuthContextShape {
  fbUser: User | null
  profile: AppUserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fbUser, setFbUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFbUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists()) {
          const data = snap.data() as any
          setProfile({
            uid: u.uid,
            email: u.email || '',
            displayName: data.displayName,
            department: data.department,
            role: data.role || 'user',
            signatureRef: data.signatureRef,
          })
        } else {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }
  const logout = async () => {
    await signOut(auth)
  }

  const value = useMemo(() => ({ fbUser, profile, loading, login, logout }), [fbUser, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
