import { useAuth } from "@workspace/replit-auth-web";
import { useLanguage } from "@/lib/language-context";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { login } = useAuth();
  const { language } = useLanguage();
  
  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center overflow-hidden bg-[#0B0E13]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: "url('/cattle-hero.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B0E13] via-[#0B0E13]/80 to-transparent" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(61,237,151,0.15)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-black/50 backdrop-blur-xl border border-primary/50 shadow-[0_0_30px_rgba(61,237,151,0.4)] flex items-center justify-center mb-8"
        >
          <Activity className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-lg"
        >
          <span className="block mb-2">Domestic Cattle AI</span>
          <span className="block text-4xl md:text-5xl text-white/80 font-arabic" dir="rtl">
            الذكاء الاصطناعي للماشية المحلية
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl text-balance"
        >
          A precision AI platform for livestock professionals and researchers.
          <br/>
          منصة ذكاء اصطناعي دقيقة لمتخصصي الثروة الحيوانية والباحثين.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            size="lg" 
            onClick={() => login()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(61,237,151,0.3)] hover:shadow-[0_0_30px_rgba(61,237,151,0.5)] transition-all"
          >
            Log in / تسجيل الدخول
          </Button>
        </motion.div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}
