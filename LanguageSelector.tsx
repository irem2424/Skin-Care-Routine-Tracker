import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, TrendingUp, Settings, LogOut, Package } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { useLanguage } from "../../lib/LanguageContext";
import { Button } from "../ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const navigation = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.analysis"), href: "/analyze", icon: Sparkles },
    { name: t("nav.products"), href: "/products", icon: Package },
    { name: t("nav.tracker"), href: "/tracker", icon: Settings },
    { name: t("nav.progress"), href: "/progress", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#3c3c3c] font-serif flex flex-col md:flex-row">
      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-[#fcfcf9] border-t border-[#e5e2d9] flex justify-around p-3 pb-8">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? "text-[#79836a] bg-[#79836a]/10 font-semibold" : "text-[#a0a096] hover:text-[#79836a]"
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] uppercase font-semibold mt-1 tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[#fcfcf9] border-r border-[#e5e2d9]">
        <div className="p-6">
          <h1 className="text-xl font-serif text-[#4a5043] italic">Skin<span className="font-sans font-bold not-italic text-[#4a5043]">Sync</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all ${
                  isActive ? "text-[#79836a] font-semibold bg-[#79836a]/10" : "text-[#a0a096] hover:bg-[#f5f5f0] hover:text-[#79836a]"
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#f0eee6] pb-8">
          <div className="mb-4">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "tr")}
              className="w-full bg-[#fbfaf7] border border-[#e5e2d9] rounded-xl h-10 px-3 text-sm text-[#4a5043] focus:ring-[#79836a]"
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-[#fbfaf7]">
            <img src={user?.photoURL || "https://picsum.photos/seed/avatar/100"} alt="User" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-[#4a5043]">{user?.displayName}</p>
              <p className="text-xs text-[#a0a096] truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start rounded-xl" onClick={logout}>
            <LogOut size={16} className="mr-2" />
            {t("logout")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-32 md:pb-0 px-4 py-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <div className="md:hidden mt-12 pt-8 border-t border-[#e5e2d9] flex flex-col gap-4 mb-8">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "tr")}
            className="w-full bg-white border border-[#e5e2d9] rounded-xl h-12 px-4 shadow-sm text-sm text-[#4a5043] focus:ring-[#79836a]"
          >
            <option value="en">Language: English</option>
            <option value="tr">Dil: Türkçe</option>
          </select>
          <Button variant="outline" className="w-full justify-center rounded-xl h-12 border-[#e5e2d9] text-[#4a5043]" onClick={logout}>
            <LogOut size={16} className="mr-2" />
            {t("logout")}
          </Button>
        </div>
      </main>
    </div>
  );
}
