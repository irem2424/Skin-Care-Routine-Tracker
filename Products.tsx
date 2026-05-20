import React, { useRef, useState, useCallback } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Button } from "../components/ui/button";
import Webcam from "react-webcam";
import { analyzeSkinPhoto } from "../lib/gemini";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/LanguageContext";
import { collection, doc, setDoc } from "firebase/firestore";
import { Camera, Upload, RefreshCcw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalysisPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  
  // States for Image
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  
  // States for Form
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [skinType, setSkinType] = useState("");
  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [menstrualCycle, setMenstrualCycle] = useState(false);
  const [knownProblems, setKnownProblems] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedImage(imageSrc);
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setResult(null);
    setFormError("");
  };

  const handleProblemChange = (problem: string) => {
    setKnownProblems(prev => 
      prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem]
    );
    setFormError("");
  };

  const saveAndAnalyze = async () => {
    if (knownProblems.length === 0) {
      setFormError("Select at least one skin problem or 'None'.");
      return;
    }
    
    if (!capturedImage || !user) return;
    setAnalyzing(true);
    try {
      const profileInfo = {
        age, gender, skinType, smoking, alcohol, 
        menstrualCycle: gender === "kadın" || gender === "female" ? menstrualCycle : null,
        knownProblems,
        language
      };

      const analysisResult = await analyzeSkinPhoto(capturedImage, profileInfo, language || 'en');
      setResult(analysisResult);

      const photoRef = doc(collection(db, "skinPhotos"));
      await setDoc(photoRef, {
        userId: user.uid,
        imageUrl: capturedImage,
        date: new Date().toISOString(),
        analysis: analysisResult,
        profileInfo,
        createdAt: Date.now()
      });

    } catch (err) {
      console.error(err);
      alert("Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const skinProblemsList = [
    { id: "acne", label: t("analysis.problems_acne") },
    { id: "redness", label: t("analysis.problems_redness") },
    { id: "wrinkles", label: t("analysis.problems_wrinkles") },
    { id: "darkspots", label: t("analysis.problems_darkspots") },
    { id: "dryness", label: t("analysis.problems_dryness") },
    { id: "pores", label: t("analysis.problems_pores") },
    { id: "blackheads", label: t("analysis.problems_blackheads") },
    { id: "none", label: t("analysis.problems_none") }
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-[#3c3c3c]">{t("analysis.title")}</h1>
          <p className="text-[#a0a096]">{t("analysis.subtitle")}</p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#f0eee6] overflow-hidden space-y-6">
          {!result && (
            <div className="space-y-4">
              <h2 className="text-xl font-serif text-[#3c3c3c]">{t("analysis.profile_info")}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-semibold text-[#4a5043] mb-1">{t("analysis.age")}</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-[#fbfaf7] border border-[#e5e2d9] rounded-xl h-12 px-3 text-[#3c3c3c] focus:ring-[#79836a]" />
                </div>
                <div>
                  <label className="block text-sm font-sans font-semibold text-[#4a5043] mb-1">{t("analysis.gender")}</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[#fbfaf7] border border-[#e5e2d9] rounded-xl h-12 px-3 text-[#3c3c3c] focus:ring-[#79836a]">
                    <option value="">{t("analysis.select")}</option>
                    <option value="female">{t("analysis.female")}</option>
                    <option value="male">{t("analysis.male")}</option>
                    <option value="other">{t("analysis.other")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-sans font-semibold text-[#4a5043] mb-1">{t("analysis.skin_type")}</label>
                  <select value={skinType} onChange={e => setSkinType(e.target.value)} className="w-full bg-[#fbfaf7] border border-[#e5e2d9] rounded-xl h-12 px-3 text-[#3c3c3c] focus:ring-[#79836a]">
                    <option value="">{t("analysis.select")}</option>
                    <option value="normal">{t("analysis.normal")}</option>
                    <option value="dry">{t("analysis.dry")}</option>
                    <option value="oily">{t("analysis.oily")}</option>
                    <option value="combination">{t("analysis.combination")}</option>
                    <option value="sensitive">{t("analysis.sensitive")}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={smoking} onChange={e => setSmoking(e.target.checked)} className="w-5 h-5 rounded text-[#79836a] focus:ring-[#79836a] border-[#e5e2d9]" />
                  <span className="text-sm font-sans text-[#4a5043]">{t("analysis.smoker")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={alcohol} onChange={e => setAlcohol(e.target.checked)} className="w-5 h-5 rounded text-[#79836a] focus:ring-[#79836a] border-[#e5e2d9]" />
                  <span className="text-sm font-sans text-[#4a5043]">{t("analysis.alcohol")}</span>
                </label>
                {(gender === "female" || gender === "kadın") && (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={menstrualCycle} onChange={e => setMenstrualCycle(e.target.checked)} className="w-5 h-5 rounded text-[#79836a] focus:ring-[#79836a] border-[#e5e2d9]" />
                    <span className="text-sm font-sans text-[#4a5043]">{t("analysis.menstruating")}</span>
                  </label>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-sm font-sans font-semibold text-[#4a5043] mb-2">{t("analysis.known_problems")} <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skinProblemsList.map((problem) => (
                    <label key={problem.id} className="flex items-center gap-2 p-2 rounded-xl border border-[#e5e2d9] bg-[#fbfaf7] hover:bg-[#f0eee6] cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={knownProblems.includes(problem.label)} 
                        onChange={() => handleProblemChange(problem.label)} 
                        className="w-5 h-5 rounded text-[#79836a] focus:ring-[#79836a] border-[#e5e2d9]" 
                      />
                      <span className="text-sm font-sans text-[#4a5043]">{problem.label}</span>
                    </label>
                  ))}
                </div>
                {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}
              </div>
            </div>
          )}

          {!capturedImage ? (
            <div className="space-y-4 pt-4 border-t border-[#f0eee6]">
              <h2 className="text-xl font-serif text-[#3c3c3c]">{t("analysis.photo")}</h2>
              {useWebcam ? (
                <div className="relative rounded-[24px] overflow-hidden bg-[#e5e2d9] border border-[#f0eee6] aspect-[3/4] md:aspect-video flex flex-col items-center justify-center">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                    <button 
                      onClick={capture}
                      className="w-16 h-16 rounded-full bg-white/20 border-4 border-white backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all active:scale-95"
                    >
                      <Camera className="text-white" size={24} />
                    </button>
                    <button 
                      onClick={() => setUseWebcam(false)}
                      className="w-16 h-16 rounded-full bg-black/20 border-4 border-white backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-all active:scale-95"
                    >
                      <Upload className="text-white" size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-[24px] overflow-hidden bg-[#fbfaf7] border-2 border-dashed border-[#e5e2d9] aspect-[3/4] md:aspect-video flex flex-col items-center justify-center hover:bg-[#f5f5f0] transition-colors cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#e5e2d9] mx-auto flex items-center justify-center mb-3">
                      <Upload className="text-[#79836a]" size={28} />
                    </div>
                    <p className="font-sans font-semibold text-[#4a5043]">{t("analysis.upload_click")}</p>
                    <p className="text-sm text-[#a0a096] mt-1">{t("analysis.upload_drag")}</p>
                  </div>
                  
                  <div className="absolute bottom-6 z-20">
                     <Button 
                        variant="outline" 
                        onClick={(e) => { e.stopPropagation(); setUseWebcam(true); }}
                        className="rounded-full h-10 border-[#e5e2d9] text-[#79836a] bg-white shadow-sm"
                     >
                       <Camera size={16} className="mr-2" /> {t("analysis.use_camera")}
                     </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-[#f0eee6]">
              <h2 className="text-xl font-serif text-[#3c3c3c]">{t("analysis.photo")}</h2>
              <img src={capturedImage} alt="Captured" className="w-full rounded-[24px] object-cover aspect-[3/4] md:aspect-video" />
              
               {!result ? (
                 <div className="flex gap-4">
                  <Button variant="outline" onClick={retake} className="flex-1 h-12 rounded-xl border-[#e5e2d9] text-[#7d7d7d]">
                    <RefreshCcw className="mr-2" size={18} /> {t("analysis.reselect")}
                  </Button>
                  <Button onClick={saveAndAnalyze} disabled={analyzing} className="flex-1 h-12 rounded-xl bg-[#79836a] text-white hover:bg-[#79836a]/90 relative overflow-hidden font-sans">
                    {analyzing ? (
                      <span className="flex items-center animate-pulse"><Sparkles className="mr-2" size={18} /> {t("analysis.analyzing")}</span>
                    ) : (
                      t("analysis.start_analysis")
                    )}
                  </Button>
                 </div>
               ) : (
                 <div className="space-y-6 animate-fade-in">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <ScoreCard label={t("analysis.overall_score")} value={`${result.overallScore}/10`} />
                     <ScoreCard label={t("analysis.acne")} value={result.acneCount} />
                     <ScoreCard label={t("analysis.redness")} value={`${result.redness}/10`} />
                     <ScoreCard label={t("analysis.oiliness")} value={`${result.oiliness}/10`} />
                   </div>
                   
                   <div className="bg-[#fbfaf7] border border-[#e5e2d9] p-6 rounded-[24px]">
                     <h3 className="font-sans font-bold text-sm text-[#4a5043] mb-2 flex items-center"><Sparkles size={20} className="mr-2 text-[#79836a]" /> {t("analysis.ai_insights")}</h3>
                     <p className="text-[#7d7d7d] leading-relaxed font-serif italic text-base whitespace-pre-wrap">{result.feedback}</p>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#f0eee6]">
                     <Button 
                       onClick={() => navigate('/products')} 
                       className="flex-1 h-12 rounded-xl bg-[#79836a] text-white hover:bg-[#79836a]/90 font-sans"
                     >
                       {t("analysis.recommend_products_btn")}
                     </Button>
                     <Button 
                       variant="outline" 
                       onClick={() => navigate('/products')} 
                       className="flex-1 h-12 rounded-xl border-[#79836a] text-[#79836a] hover:bg-[#79836a]/10 font-sans"
                     >
                       {t("analysis.add_own_products_btn")}
                     </Button>
                   </div>
                   
                   <Button onClick={retake} variant="ghost" className="w-full text-sm text-[#a0a096] hover:text-[#7d7d7d]">{t("home.new_analysis")}</Button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ScoreCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-[#f5f5f0] border border-[#f0eee6] p-4 rounded-2xl text-center">
      <p className="text-xs font-sans uppercase font-bold text-[#a0a096] tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-serif text-[#3c3c3c]">{value}</p>
    </div>
  )
}
