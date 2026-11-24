import { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export function SplashScreen({ onFinish, durationMs = 2600 }: SplashScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [onFinish, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#250B4E_0%,#170632_60%,#0F0322_100%)] px-6 select-none"
      role="region"
      aria-label="Pantalla de presentación de MemesWue"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        <img
          src="/assets/aistudio/descarga_b57de531.jpeg"
          alt="MemesWue, tu aplicación de memes a la mano"
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[72vh] object-contain rounded-2xl"
        />

        {/* Progress indicator */}
        <div className="mt-6 w-48 h-1 rounded-full bg-white/15 overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: durationMs / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left center' }}
            className="h-full w-full bg-gradient-to-r from-amber-300 via-fuchsia-500 to-violet-400"
          />
        </div>

        <span className="mt-3 text-[11px] font-medium tracking-widest text-white/45 select-none">
          NestLed-apk
        </span>
      </motion.div>

      <button
        type="button"
        onClick={onFinish}
        className="absolute bottom-6 right-6 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        Entrar ahora
      </button>
    </motion.div>
  );
}
