import { useAuth } from "@workspace/replit-auth-web";
import { useLanguage } from "@/lib/language-context";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Activity, History, LogOut, Menu, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analyze", label: "Analyze", icon: Activity },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50
        w-64 bg-card border-${language === 'ar' ? 'l' : 'r'} border-border
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
        flex flex-col
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(61,237,151,0.3)]">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">{t("Platform Name")}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-all duration-200
                  ${active 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(61,237,151,0.1)]' 
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }
                `}>
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{t(link.label)}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="bg-card text-primary font-bold">
                {user?.firstName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("Logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full md:pl-64" style={language === 'ar' ? { paddingLeft: 0, paddingRight: '16rem' } : {}}>
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6 text-white" />
          </Button>
        </header>

        {/* Top bar (Language toggle) */}
        <div className="h-16 hidden md:flex border-b border-border/50 bg-background/50 backdrop-blur-sm items-center justify-end px-8 sticky top-0 z-40">
          <Button variant="outline" size="sm" onClick={toggleLanguage} className="bg-card border-border hover:border-primary/50 text-white">
            <Globe className="w-4 h-4 mr-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
