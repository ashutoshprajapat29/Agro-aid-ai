import { AuthProvider, useAuth } from "./lib/AuthContext";
import { WeatherProvider } from "./lib/WeatherContext";
import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  MessageSquare, 
  Camera, 
  User as UserIcon, 
  ChevronRight,
  Loader2,
  Leaf,
  MapPin,
  BookOpen,
  Database,
  Mic,
  FlaskConical,
  Compass,
  Smartphone,
  CheckCircle2
} from "lucide-react";

// Components
import FarmingAdvisor from "./components/FarmingAdvisor";
const DiseaseScanner = lazy(() => import("./components/DiseaseScanner"));
const Profile = lazy(() => import("./components/Profile"));
const WeatherWidget = lazy(() => import("./components/WeatherWidget"));
const WeatherAdvisoryBanner = lazy(() => import("./components/WeatherAdvisoryBanner"));
const LiveVoiceAdvisor = lazy(() => import("./components/LiveVoiceAdvisor"));
const FieldManager = lazy(() => import("./components/FieldManager"));
const TaskManager = lazy(() => import("./components/TaskManager"));

function AuthenticatedApp() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'advisor' | 'disease' | 'profile' | 'voice' | 'fields' | 'tasks'>('advisor');

  return (
    <div className="h-screen h-[100dvh] bg-bento-bg text-bento-text-main flex flex-col overflow-hidden">
      {/* App Header */}
      <header className="h-[60px] md:h-[72px] px-4 md:px-8 flex justify-between items-center border-b border-bento-border bg-bento-bg sticky top-0 z-[60]">
        <div className="text-xl md:text-2xl font-serif font-bold text-bento-primary tracking-tight">AgroAid AI</div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <Suspense fallback={<div className="w-10 h-10 bg-zinc-100 rounded-full animate-pulse" />}>
            <WeatherWidget />
          </Suspense>
        </div>
      </header>

      {/* Live Climate Monitoring Message */}
      <Suspense fallback={null}>
        <WeatherAdvisoryBanner />
      </Suspense>

      {/* Main Container */}
      <div className="flex-1 relative flex flex-col-reverse md:flex-row overflow-hidden">
        {/* Navigation Rail */}
        <nav className="shrink-0 bg-bento-card border-t border-bento-border px-2 md:px-3 py-2 md:py-0 flex justify-around md:relative md:w-28 md:flex-col md:border-r md:border-t-0 md:pt-10 z-50 pb-safe md:pb-0 gap-2 md:gap-4 overflow-x-auto scrollbar-hide shadow-[0_0_20px_rgba(0,0,0,0.02)] z-50 relative">
          <NavButton active={activeTab === 'advisor'} onClick={() => setActiveTab('advisor')} icon={<MessageSquare size={20} className="md:w-6 md:h-6" />} label="Advise" colorClass="bg-bento-primary" />
          <NavButton active={activeTab === 'disease'} onClick={() => setActiveTab('disease')} icon={<Camera size={20} className="md:w-6 md:h-6" />} label="Health" colorClass="bg-rose-700" />
          <NavButton active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} icon={<Compass size={20} className="md:w-6 md:h-6" />} label="Plots" colorClass="bg-teal-700" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckCircle2 size={20} className="md:w-6 md:h-6" />} label="Tasks" colorClass="bg-amber-700" />
          <NavButton active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} icon={<Mic size={20} className="md:w-6 md:h-6" />} label="Voice" colorClass="bg-zinc-800" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} className="md:w-6 md:h-6" />} label="Profile" colorClass="bg-bento-accent" />
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden bg-bento-bg">
          <div className="max-w-7xl mx-auto h-full relative">
            <div className={`h-full transition-opacity duration-300 ${activeTab === 'advisor' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none -z-10'}`}>
              <FarmingAdvisor isActive={activeTab === 'advisor'} />
            </div>
            
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-bento-primary" size={32} />
              </div>
            }>
              {activeTab === 'disease' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-2 md:p-4"><DiseaseScanner /></motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-2 md:p-4"><Profile /></motion.div>
              )}
              {activeTab === 'fields' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-2 md:p-4"><FieldManager /></motion.div>
              )}
              {activeTab === 'tasks' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-2 md:p-4"><TaskManager /></motion.div>
              )}
              {activeTab === 'voice' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-2 md:p-4"><LiveVoiceAdvisor /></motion.div>
              )}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, colorClass }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, colorClass: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center flex-1 py-2 md:py-4 transition-all rounded-full md:rounded-3xl md:mb-2 ${active ? `bg-white md:${colorClass} md:text-white shadow-md md:shadow-lg scale-105 z-10` : 'text-bento-text-muted hover:bg-zinc-50'}`}
    >
      <div className={`p-1 transition-colors ${active ? (label === 'Health' ? 'text-rose-700 md:text-inherit' : label === 'Plots' ? 'text-teal-700 md:text-inherit' : label === 'Tasks' ? 'text-amber-700 md:text-inherit' : label === 'Voice' ? 'text-zinc-800 md:text-inherit' : label === 'Profile' ? 'text-bento-accent md:text-inherit' : 'text-bento-primary md:text-inherit') : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] md:text-[11px] mt-0.5 md:mt-1 font-semibold tracking-wide ${active ? 'text-bento-text-main md:text-white font-bold' : 'text-bento-text-muted opacity-80'}`}>{label}</span>
      {active && <motion.div layoutId="nav-glow" className="absolute -bottom-1.5 md:hidden w-1.5 h-1.5 bg-current rounded-full" />}
    </button>
  );
}

function Landing() {
  const { login, sendOTP, verifyOTP, loading } = useAuth();
  const [lang, setLang] = useState(localStorage.getItem('preferredLanguage') || "Hindi");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'method' | 'phone' | 'otp'>('method');
  const [error, setError] = useState("");

  const selectLang = (l: string) => {
    setLang(l);
    localStorage.setItem('preferredLanguage', l);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Ensure phone starts with +
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        // Simple heuristic: if length is 10, assume +91. Otherwise, warn.
        if (formattedPhone.length === 10) {
          formattedPhone = '+91' + formattedPhone;
        } else {
          setError("Please include your country code (e.g., +919998887770)");
          return;
        }
      }
      await sendOTP(formattedPhone);
      setStep('otp');
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes('auth/operation-not-allowed') || msg.includes('region enabled')) {
        setError("Phone Login is currently unavailable for your region or not enabled in Firebase. Please use 'Continue with Google' instead.");
      } else if (msg.includes('auth/billing-not-enabled')) {
        setError("The daily SMS quota for this app has been reached. Please use 'Continue with Google' for now.");
      } else if (msg.includes('too-many-requests') || msg.includes('auth/too-many-requests')) {
        setError("Too many attempts. Please wait a few minutes and try again, or use Google Login.");
      } else {
        setError(msg || "Failed to send OTP");
      }
      console.error("OTP Send Failure:", err);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await verifyOTP(otp);
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf8] flex flex-col items-center py-12 px-6 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] overflow-y-auto">
      <div className="mb-8 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-[#5d8d49] rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-[#5d8d49]/30"
        >
          <Leaf size={40} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d3436] mb-4">AgroAid AI</h1>
        <p className="text-lg text-[#636e72] max-w-md mx-auto leading-relaxed">
          {lang === 'Hindi' 
            ? "किसानों को AI-संचालित जानकारी और सीधे बाज़ार से सशक्त बनाना।" 
            : "Empowering farmers with AI-driven insights and a direct path to the dinner table."}
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => selectLang('Hindi')}
          className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${lang === 'Hindi' ? 'bg-[#5d8d49] text-white border-[#5d8d49]' : 'bg-white text-zinc-500 border-zinc-200'}`}
        >
          हिन्दी
        </button>
        <button 
          onClick={() => selectLang('English')}
          className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${lang === 'English' ? 'bg-[#5d8d49] text-white border-[#5d8d49]' : 'bg-white text-zinc-500 border-zinc-200'}`}
        >
          English
        </button>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-2xl shadow-zinc-200/50 border border-zinc-100 mb-12">
        <AnimatePresence mode="wait">
          {step === 'method' && (
            <motion.div 
              key="method"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-black text-zinc-800 mb-6 text-center">Sign in to your farm</h2>
              <button 
                onClick={() => login()}
                disabled={loading}
                className="w-full px-8 py-4 bg-[#2d3436] text-white rounded-2xl font-semibold hover:bg-[#1e272e] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt=""/>}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-zinc-100"></div>
                <span className="flex-shrink mx-4 text-zinc-300 text-xs font-black uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-zinc-100"></div>
              </div>

              <button 
                onClick={() => setStep('phone')}
                className="w-full px-8 py-4 bg-white border-2 border-zinc-100 text-zinc-800 rounded-2xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Smartphone size={20} className="text-teal-600" />
                <span>Continue with Phone</span>
              </button>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-black text-zinc-800 mb-2">Enter Mobile Number</h2>
              <p className="text-xs text-zinc-400 mb-6 font-bold uppercase tracking-widest">We'll send you a verification code</p>
              
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">+91</span>
                  <input 
                    type="tel"
                    placeholder="9998887770"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl pl-14 pr-4 py-4 focus:border-teal-500 outline-none font-bold text-lg"
                    required
                  />
                </div>
                {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Send OTP"}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep('method')}
                  className="w-full text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors"
                >
                  Back
                </button>
              </form>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-black text-zinc-800 mb-2">Verify OTP</h2>
              <p className="text-xs text-zinc-400 mb-6 font-bold uppercase tracking-widest">Enter the 6-digit code sent to your phone</p>
              
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input 
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-4 focus:border-teal-500 outline-none font-bold text-center text-2xl tracking-[0.5em]"
                  required
                />
                {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Sign In"}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors"
                >
                  Resend or Edit Number
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        <FeatureCard 
          icon={<MessageSquare className="text-blue-500" />} 
          title="Smart Advisor" 
          desc="Get crop suggestions based on your soil and location." 
        />
        <FeatureCard 
          icon={<Camera className="text-red-500" />} 
          title="Disease Scanner" 
          desc="Identify plant diseases instantly with AI vision." 
        />
        <FeatureCard 
          icon={<Compass className="text-teal-500" />} 
          title="Plot Manager" 
          desc="Map your fields and track specific plot activities." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e2e2d5] hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-[#636e72]">{desc}</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <MainWrapper />
      </WeatherProvider>
    </AuthProvider>
  );
}

function MainWrapper() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbf8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5d8d49]" size={40} />
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <Landing />;
}

