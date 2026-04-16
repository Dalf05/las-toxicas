import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle } from './lib/firebase';
import TripCalendar from './components/TripCalendar';
import { Button } from './components/ui/button';
import { motion } from 'motion/react';
import { Calendar, Users, MapPin, Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error("Auth is not initialized");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FF6321]">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <TripCalendar />;
}

function LoginView() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/90 backdrop-blur-sm border-3 border-primary p-8 md:p-12 rounded-[40px] shadow-2xl shadow-primary/10 relative z-10 text-center"
      >
        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-primary uppercase tracking-tighter leading-none mb-2">
            Las Tóxicas
          </h1>
          <p className="text-secondary font-bold uppercase tracking-widest text-sm">
            ¿Cuándo no podemos ir? ✈️✨
          </p>
        </header>
        
        <div className="space-y-6 mb-10">
          <FeatureItem icon={<Users className="w-5 h-5 text-primary" />} text="Coordina con tus amigas" />
          <FeatureItem icon={<MapPin className="w-5 h-5 text-secondary" />} text="Vota tus días de viaje" />
          <FeatureItem icon={<Heart className="w-5 h-5 text-accent" />} text="Evita el drama grupal" />
        </div>

        <Button 
          onClick={loginWithGoogle}
          className="w-full h-14 bg-primary text-white hover:bg-primary/90 text-lg font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          Entrar con Google
        </Button>

        <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-text/40 font-bold">
          Solo para miembros oficiales
        </p>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 font-bold uppercase tracking-wide text-xs text-text/70">
      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}
