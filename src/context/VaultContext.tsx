import React, { createContext, useContext, useState, useCallback } from "react";
import { VaultDocument, FamilyMember, SecurityAlert, UserRole, DocumentCategory, PrivacyLevel, SharedAccess, AccessLogEntry } from "@/types/vault";

function generateHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

const SEED_MEMBERS: FamilyMember[] = [
  { id: "m1", name: "Sarah Johnson", email: "sarah@family.com", relationship: "Spouse", role: "member", avatarInitials: "SJ", addedAt: "2025-11-15T10:00:00Z" },
  { id: "m2", name: "Alex Johnson", email: "alex@family.com", relationship: "Son", role: "member", avatarInitials: "AJ", addedAt: "2025-12-01T14:30:00Z" },
  { id: "m3", name: "Emily Johnson", email: "emily@family.com", relationship: "Daughter", role: "member", avatarInitials: "EJ", addedAt: "2026-01-10T09:15:00Z" },
];

const SEED_DOCS: VaultDocument[] = [
  { id: "d1", name: "Passport - John", category: "ids", privacy: "private", hash: generateHash(), timestamp: "2025-12-01T08:30:00Z", fileType: "PDF", size: "2.4 MB", sharedWith: [], accessLog: [{ id: "a1", userId: "owner", userName: "John Johnson", action: "Uploaded document", timestamp: "2025-12-01T08:30:00Z" }] },
  { id: "d2", name: "Home Insurance Policy", category: "insurance", privacy: "shared", hash: generateHash(), timestamp: "2025-12-15T11:00:00Z", fileType: "PDF", size: "1.8 MB", sharedWith: [{ memberId: "m1", permission: "view-only", grantedAt: "2025-12-16T09:00:00Z", revoked: false }], accessLog: [{ id: "a2", userId: "owner", userName: "John Johnson", action: "Uploaded document", timestamp: "2025-12-15T11:00:00Z" }, { id: "a3", userId: "m1", userName: "Sarah Johnson", action: "Viewed document", timestamp: "2025-12-17T14:20:00Z" }] },
  { id: "d3", name: "Bank Account Details", category: "banking", privacy: "private", hash: generateHash(), timestamp: "2026-01-05T16:45:00Z", fileType: "PDF", size: "0.5 MB", sharedWith: [], accessLog: [{ id: "a4", userId: "owner", userName: "John Johnson", action: "Uploaded document", timestamp: "2026-01-05T16:45:00Z" }] },
  { id: "d4", name: "Property Deed", category: "property", privacy: "shared", hash: generateHash(), timestamp: "2026-01-20T10:00:00Z", fileType: "PDF", size: "5.2 MB", sharedWith: [{ memberId: "m1", permission: "view-only", grantedAt: "2026-01-21T08:00:00Z", revoked: false }, { memberId: "m2", permission: "time-limited", grantedAt: "2026-01-22T12:00:00Z", expiresAt: "2026-04-22T12:00:00Z", revoked: false }], accessLog: [{ id: "a5", userId: "owner", userName: "John Johnson", action: "Uploaded document", timestamp: "2026-01-20T10:00:00Z" }] },
  { id: "d5", name: "Netflix Login", category: "passwords", privacy: "shared", hash: generateHash(), timestamp: "2026-02-01T09:30:00Z", fileType: "Text", size: "0.1 KB", sharedWith: [{ memberId: "m1", permission: "view-only", grantedAt: "2026-02-01T09:35:00Z", revoked: false }, { memberId: "m2", permission: "view-only", grantedAt: "2026-02-01T09:35:00Z", revoked: false }, { memberId: "m3", permission: "view-only", grantedAt: "2026-02-01T09:35:00Z", revoked: false }], accessLog: [{ id: "a6", userId: "owner", userName: "John Johnson", action: "Uploaded credential", timestamp: "2026-02-01T09:30:00Z" }] },
  { id: "d6", name: "Driver's License - Sarah", category: "ids", privacy: "private", hash: generateHash(), timestamp: "2026-02-05T13:00:00Z", fileType: "Image", size: "3.1 MB", sharedWith: [], accessLog: [{ id: "a7", userId: "owner", userName: "John Johnson", action: "Uploaded document", timestamp: "2026-02-05T13:00:00Z" }] },
];

const SEED_ALERTS: SecurityAlert[] = [
  { id: "s1", type: "Unauthorized Access Attempt", description: "Failed login attempt from unknown device", timestamp: "2026-02-10T03:15:00Z", status: "blocked", ip: "192.168.45.102", details: "3 failed password attempts detected from unrecognized device in Moscow, Russia." },
  { id: "s2", type: "Suspicious Activity", description: "Multiple document access requests in short period", timestamp: "2026-02-08T22:40:00Z", status: "warning", ip: "10.0.0.55", details: "15 document access requests within 2 minutes from recognized device." },
];

interface VaultContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  familyName: string;
  documents: VaultDocument[];
  members: FamilyMember[];
  alerts: SecurityAlert[];
  login: (role: UserRole) => void;
  logout: () => void;
  addDocument: (name: string, category: DocumentCategory, privacy: PrivacyLevel, fileType: string, size: string) => VaultDocument;
  shareDocument: (docId: string, memberId: string, permission: "view-only" | "time-limited", expiresAt?: string) => void;
  revokeAccess: (docId: string, memberId: string) => void;
  addMember: (name: string, email: string, relationship: string) => void;
  removeMember: (id: string) => void;
  addAlert: (alert: Omit<SecurityAlert, "id">) => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("owner");
  const [documents, setDocuments] = useState<VaultDocument[]>(SEED_DOCS);
  const [members, setMembers] = useState<FamilyMember[]>(SEED_MEMBERS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(SEED_ALERTS);

  const login = useCallback((role: UserRole) => { setUserRole(role); setIsLoggedIn(true); }, []);
  const logout = useCallback(() => { setIsLoggedIn(false); }, []);

  const addDocument = useCallback((name: string, category: DocumentCategory, privacy: PrivacyLevel, fileType: string, size: string) => {
    const doc: VaultDocument = {
      id: `d${Date.now()}`,
      name, category, privacy,
      hash: generateHash(),
      timestamp: new Date().toISOString(),
      fileType, size,
      sharedWith: [],
      accessLog: [{ id: `a${Date.now()}`, userId: "owner", userName: "John Johnson", action: "Uploaded document", timestamp: new Date().toISOString() }],
    };
    setDocuments(prev => [doc, ...prev]);
    return doc;
  }, []);

  const shareDocument = useCallback((docId: string, memberId: string, permission: "view-only" | "time-limited", expiresAt?: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== docId) return d;
      const access: SharedAccess = { memberId, permission, grantedAt: new Date().toISOString(), expiresAt, revoked: false };
      const member = members.find(m => m.id === memberId);
      const log: AccessLogEntry = { id: `a${Date.now()}`, userId: "owner", userName: "John Johnson", action: `Shared with ${member?.name}`, timestamp: new Date().toISOString() };
      return { ...d, privacy: "shared" as const, sharedWith: [...d.sharedWith.filter(s => s.memberId !== memberId), access], accessLog: [...d.accessLog, log] };
    }));
  }, [members]);

  const revokeAccess = useCallback((docId: string, memberId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== docId) return d;
      return { ...d, sharedWith: d.sharedWith.map(s => s.memberId === memberId ? { ...s, revoked: true } : s) };
    }));
  }, []);

  const addMember = useCallback((name: string, email: string, relationship: string) => {
    const m: FamilyMember = { id: `m${Date.now()}`, name, email, relationship, role: "member", avatarInitials: name.split(" ").map(n => n[0]).join("").toUpperCase(), addedAt: new Date().toISOString() };
    setMembers(prev => [...prev, m]);
  }, []);

  const removeMember = useCallback((id: string) => { setMembers(prev => prev.filter(m => m.id !== id)); }, []);

  const addAlert = useCallback((alert: Omit<SecurityAlert, "id">) => {
    setAlerts(prev => [{ ...alert, id: `s${Date.now()}` }, ...prev]);
  }, []);

  return (
    <VaultContext.Provider value={{ isLoggedIn, userRole, familyName: "Johnson Family", documents, members, alerts, login, logout, addDocument, shareDocument, revokeAccess, addMember, removeMember, addAlert }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
