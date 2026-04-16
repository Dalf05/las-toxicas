import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  startOfWeek, 
  endOfWeek,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Info } from 'lucide-react';

interface Unavailability {
  id: string;
  userId: string;
  userName: string;
  date: string;
}

export default function TripCalendar() {
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  // Months to show: June, July, August 2026
  const months = [
    new Date(2026, 5, 1), // June
    new Date(2026, 6, 1), // July
    new Date(2026, 7, 1), // August
  ];

  useEffect(() => {
    const q = query(collection(db, 'unavailability'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Unavailability[];
      setUnavailabilities(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching unavailability:", error);
    });

    return () => unsubscribe();
  }, []);

  const toggleUnavailability = async (date: Date) => {
    if (!user) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const docId = `${user.uid}_${dateStr}`;
    const existing = unavailabilities.find(u => u.id === docId);

    try {
      if (existing) {
        await deleteDoc(doc(db, 'unavailability', docId));
      } else {
        await setDoc(doc(db, 'unavailability', docId), {
          userId: user.uid,
          userName: user.displayName || 'Anónimo',
          date: dateStr
        });
      }
    } catch (error) {
      console.error("Error toggling unavailability:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-black text-primary uppercase tracking-tighter leading-none mb-2">
          Las Tóxicas 2026
        </h1>
        <p className="text-secondary font-bold uppercase tracking-[0.2em] text-sm md:text-base">
          ¿Cuándo no podemos ir? ✈️✨
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-10">
        <div className="bg-white px-8 py-4 rounded-full border-3 border-primary shadow-xl shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-primary w-10 h-10">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-primary text-white font-bold">
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-text">¡Hola, {user?.displayName}!</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-text/60">
              <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary" />
              <span>Día no disponible</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => auth.signOut()}
              className="text-xs uppercase font-bold tracking-widest text-secondary hover:text-secondary/80 hover:bg-secondary/5"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {months.map((monthDate) => (
            <MonthCalendar 
              key={monthDate.toISOString()} 
              monthDate={monthDate} 
              unavailabilities={unavailabilities}
              onToggle={toggleUnavailability}
              currentUserId={user?.uid || ''}
            />
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-text/10 text-center opacity-40 text-[10px] font-bold uppercase tracking-[0.3em]">
        &copy; 2026 Las Tóxicas • Hecho con amor y toxicidad
      </footer>
    </div>
  );
}

function MonthCalendar({ 
  monthDate, 
  unavailabilities, 
  onToggle,
  currentUserId
}: { 
  monthDate: Date, 
  unavailabilities: Unavailability[],
  onToggle: (date: Date) => void,
  currentUserId: string,
  key?: string
}) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <Card className="rounded-[32px] border-none shadow-xl shadow-black/5 overflow-hidden bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-center uppercase tracking-widest text-xl font-black text-secondary">
          {format(monthDate, 'MMMM yyyy', { locale: es })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-black text-text/20 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = day.getMonth() === monthDate.getMonth();
            const dayUnavailabilities = unavailabilities.filter(u => u.date === dateStr);
            const isUserUnavailable = dayUnavailabilities.some(u => u.userId === currentUserId);

            if (!isCurrentMonth) return <div key={day.toISOString()} className="aspect-square" />;

            return (
              <motion.div 
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggle(day)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-start p-1.5 relative cursor-pointer transition-all border-2
                  ${isUserUnavailable 
                    ? 'bg-[#FFE0E9] border-primary shadow-sm' 
                    : 'bg-gray-50 border-transparent hover:border-primary/20'}
                `}
              >
                <span className={`text-[10px] font-black ${isUserUnavailable ? 'text-primary' : 'text-text/40'}`}>
                  {format(day, 'd')}
                </span>
                
                <div className="mt-1 flex flex-wrap gap-0.5 justify-center">
                  {dayUnavailabilities.map(u => (
                    <div 
                      key={u.id}
                      title={u.userName}
                      className="w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center text-[7px] font-black shadow-sm"
                    >
                      {u.userName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
