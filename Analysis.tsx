import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon, Droplets, MoonStar, Activity, ArrowRight } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/LanguageContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [routine, setRoutine] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const q = query(collection(db, "skinPhotos"), where("userId", "==", user?.uid), orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setLatestAnalysis(snap.docs[0].data());
      }
      
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user?.uid)));
      if (!userDoc.empty) {
        const u = userDoc.docs[0].data();
        if (u.routine) {
          setRoutine(u.routine);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-[#7d7d7d]">
          <Sparkles className="animate-pulse mr-2" /> {t("home.loading")}
        </div>
      </AppLayout>
    );
  }

  if (!latestAnalysis) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 bg-[#f0eee6] rounded-full flex items-center justify-center mb-4">
            <Sparkles size={40} className="text-[#79836a]" />
          </div>
          <h1 className="text-4xl font-serif text-[#3c3c3c]">{t("home.welcome_first")}</h1>
          <p className="text-[#7d7d7d] text-lg max-w-md mx-auto leading-relaxed">
            {t("home.welcome_text")}
          </p>
          <Link to="/analyze" className="mt-8">
            <Button className="rounded-full px-8 py-6 text-lg bg-[#79836a] text-white hover:bg-[#79836a]/90 font-sans tracking-wide">
              {t("home.start_analysis")}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2 text-[#3c3c3c]">
              <span className="text-[#a0a096] font-sans font-normal text-xl block mb-1">{t("home.hello")}</span>
              {t("home.ready")}
            </h1>
          </div>
          <Link to="/analyze">
            <Button variant="outline" className="rounded-full border-[#e5e2d9] text-[#79836a] hover:bg-[#fbfaf7]">
              {t("home.reanalyze")}
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-[#3c3c3c] text-white border-0 rounded-[32px] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Activity size={100} />
            </div>
            <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-[#a0a096] uppercase tracking-widest text-xs font-bold font-sans mb-1">{t("home.skin_score")}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-serif">{latestAnalysis?.analysis?.overallScore || '-'}</span>
                  <span className="text-xl text-[#a0a096]">/10</span>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm text-balance text-[#e5e2d9] italic">{latestAnalysis?.analysis?.feedback}</p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <Card className="bg-[#fbfaf7] border border-[#f0eee6] shadow-sm rounded-3xl">
               <CardContent className="p-6">
                 <h3 className="flex items-center text-[#79836a] font-bold mb-4 border-b border-[#f0eee6] pb-2 font-sans"><Sun size={18} className="mr-2" /> {t("home.routine_am")}</h3>
                 {routine?.am ? (
                   <ul className="space-y-3">
                     {routine.am.map((step: any, idx: number) => (
                       <li key={idx} className="text-sm">
                         <span className="font-semibold text-[#4a5043] block">{step.stepName}</span>
                         <span className="text-[#7d7d7d]">{step.recommendedProduct}</span>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <div className="text-sm text-[#a0a096] pb-4">
                     <p className="mb-4">{t("home.no_routine")}</p>
                     <Button variant="outline" size="sm" onClick={() => navigate('/products')} className="w-full">
                       {t("home.generate_routine")} <ArrowRight size={14} className="ml-2" />
                     </Button>
                   </div>
                 )}
               </CardContent>
            </Card>

            <Card className="bg-white border border-[#e5e2d9] shadow-sm rounded-3xl">
               <CardContent className="p-6">
                 <h3 className="flex items-center text-[#4a5043] font-bold mb-4 border-b border-[#e5e2d9] pb-2 font-sans"><Moon size={18} className="mr-2" /> {t("home.routine_pm")}</h3>
                 {routine?.pm ? (
                   <ul className="space-y-3">
                     {routine.pm.map((step: any, idx: number) => (
                       <li key={idx} className="text-sm">
                         <span className="font-semibold text-[#4a5043] block">{step.stepName}</span>
                         <span className="text-[#7d7d7d]">{step.recommendedProduct}</span>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <div className="text-sm text-[#a0a096] pb-4">
                     <p className="mb-4">{t("home.no_routine")}</p>
                     <Button variant="outline" size="sm" onClick={() => navigate('/products')} className="w-full">
                       {t("home.generate_routine")} <ArrowRight size={14} className="ml-2" />
                     </Button>
                   </div>
                 )}
               </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-[#f0eee6]/50 rounded-[32px] p-6 md:p-8 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-[#3c3c3c] text-xl mb-1">{t("home.daily_log")}</h3>
            <p className="text-sm text-[#7d7d7d]">{t("home.daily_log_text")}</p>
          </div>
          <Link to="/tracker">
            <Button className="bg-white text-[#4a5043] border border-[#e5e2d9] hover:bg-[#fbfaf7] rounded-full px-6">
              {t("home.log_today")}
            </Button>
          </Link>
        </div>

      </div>
    </AppLayout>
  );
}
