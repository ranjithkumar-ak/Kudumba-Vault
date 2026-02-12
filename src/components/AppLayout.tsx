import { NavLink, useLocation } from "react-router-dom";
import { useVault } from "@/context/VaultContext";
import { LayoutDashboard, Upload, FileText, Share2, Users, RefreshCw, ShieldAlert, LogOut, Shield } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/sharing", label: "Sharing", icon: Share2 },
  { to: "/members", label: "Members", icon: Users },
  { to: "/recovery", label: "Recovery", icon: RefreshCw },
  { to: "/alerts", label: "Alerts", icon: ShieldAlert },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout, familyName, userRole } = useVault();
  const location = useLocation();

  const visibleNav = userRole === "member"
    ? NAV_ITEMS.filter(i => ["/dashboard", "/documents"].includes(i.to))
    : NAV_ITEMS;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
            <Shield className="h-5 w-5 text-[hsl(var(--sidebar-primary-foreground))]" />
          </div>
          <div>
            <p className="text-sm font-bold">Family Vault</p>
            <p className="text-[11px] text-[hsl(var(--sidebar-foreground))]/60">{familyName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {visibleNav.map(item => {
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]" : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"}`}>
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
          <div className="mb-2 rounded-lg bg-[hsl(var(--sidebar-accent))] px-3 py-2">
            <p className="text-xs font-medium">Logged in as</p>
            <p className="text-[11px] text-[hsl(var(--sidebar-foreground))]/60">{userRole === "owner" ? "John Johnson (Owner)" : "Family Member"}</p>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))]/60 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default AppLayout;
