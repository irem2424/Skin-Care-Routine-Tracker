import React from "react";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/LanguageContext";
import { Button } from "../components/ui/button";
import { Sparkles, ScanFace, FileText } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { login, user } = useAuth();
  const { t } = useLanguage();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center p-4 font-serif">
      <div className="max-w-md w-full bg-[#fcfcf9] rounded-[32px] border border-[#e5e2d9] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="aspect-[4/3] bg-[#f5f5f0] relative">
          <img src="https://picsum.photos/seed/skincare/800/600?blur=2" alt="Skincare" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcf9]/90 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="font-serif text-4xl text-[#3c3c3c] mb-2">Skin<span className="font-sans font-bold">Sync</span></h1>
            <p className="text-[#a0a096] font-sans font-medium tracking-tight">{t("login.title")}</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <Feature icon={ScanFace} text={t("login.feature1")} />
            <Feature icon={Sparkles} text={t("login.feature2")} />
            <Feature icon={FileText} text={t("login.feature3")} />
          </div>

          <Button 
            onClick={login} 
            className="w-full h-14 rounded-full text-lg shadow-sm bg-[#79836a] text-white hover:bg-[#79836a]/90 font-sans transition-all font-medium"
          >
            {t("login.button")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#79836a]">
        <Icon size={24} />
      </div>
      <p className="text-[#4a5043] font-sans font-medium tracking-tight flex-1">{text}</p>
    </div>
  );
}
