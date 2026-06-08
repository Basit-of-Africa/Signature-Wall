import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function AnniversaryCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  useEffect(() => {
    // Target date: October 25, 2026 18:00:00 (Gala day)
    const targetDate = new Date("2026-10-25T18:00:00Z").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isCompleted: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#FCFAF7] border border-stone-200 rounded-sm p-6 md:p-8 max-w-4xl mx-auto my-8 shadow-sm text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-brown text-xs px-2.5 py-1 rounded-sm font-mono uppercase tracking-widest mb-4">
        <AlertTriangle className="w-3.5 h-3.5" />
        Limited-Time Commemorative Event
      </div>

      <h3 className="font-serif text-lg md:text-xl text-primary-green font-bold mb-2">
        The Signature Wall Closes After the FUO@20 Celebration
      </h3>
      <p className="text-stone-600 text-xs md:text-sm max-w-2xl mx-auto mb-6">
        Don&apos;t miss your chance to be preserved forever in Fountain University&apos;s digital time capsule. Leave your sign-off before the countdown expires!
      </p>

      {timeLeft.isCompleted ? (
        <div className="text-accent-brown font-serif font-bold text-lg md:text-xl px-4 py-2.5 bg-accent-gold/10 border border-accent-gold/25 rounded-md max-w-md mx-auto">
          🎉 The FUO @20 Celebration peak has begun! Wall is now being compiled into the university archive.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto" id="countdown-grid">
          <div className="bg-white border border-stone-200 rounded-sm p-3 sm:p-4">
            <span className="block font-serif text-2xl sm:text-4xl font-bold text-primary-green ml-1">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest font-mono">Days</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-sm p-3 sm:p-4">
            <span className="block font-serif text-2xl sm:text-4xl font-bold text-primary-green ml-1">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest font-mono">Hours</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-sm p-3 sm:p-4">
            <span className="block font-serif text-2xl sm:text-4xl font-bold text-primary-green ml-1">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest font-mono">Mins</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-sm p-3 sm:p-4">
            <span className="block font-serif text-2xl sm:text-4xl font-bold text-primary-green ml-1">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest font-mono">Secs</span>
          </div>
        </div>
      )}

      <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
        <Clock className="w-3.5 h-3.5" />
        Target Date: October 25, 2026 (FUO Convocation & Anniversary Gala)
      </div>
    </div>
  );
}
