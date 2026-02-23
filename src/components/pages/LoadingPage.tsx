'use client';

import { useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const logoImg = '/logo.svg';

export default function LoadingPage() {
  const navigate = useNavigate();
  const { currentUser, finishLoading } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      finishLoading();
      if (currentUser) {
        navigate(currentUser.isAdmin ? '/admin' : '/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentUser, navigate, finishLoading]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D1B3E 0%, #1B2A5C 50%, #253671 100%)' }}
    >
      {/* Star background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 17 + 5) % 95}%`,
              top: `${(i * 23 + 8) % 90}%`,
            }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
        {/* Nebula circles */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={`nebula-${i}`}
            className="absolute rounded-full"
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              left: `${10 + i * 25}%`,
              top: `${15 + i * 20}%`,
              background: i === 0
                ? 'radial-gradient(circle, rgba(75,163,227,0.08) 0%, transparent 70%)'
                : i === 1
                  ? 'radial-gradient(circle, rgba(125,196,67,0.06) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(245,197,24,0.05) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* UFO Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={logoImg}
              alt="SPACE logo"
              style={{ width: 110, height: 110, borderRadius: '50%' }}
            />
          </motion.div>

          {/* Orbit sparkles */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                top: '50%', left: '50%',
                transform: `rotate(${i * 90}deg) translate(60px)`,
              }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, delay: 0.5 + i * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-white" style={{ fontSize: 32, fontWeight: 900, letterSpacing: '2px' }}>
            SPACE
          </h1>
          <p className="text-white/70 mt-1" style={{ fontSize: 13 }}>
            서울과학기술대학교 학생복지위원회
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-2 mt-4"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 text-white/50"
        style={{ fontSize: 12 }}
      >
        In your space, with our SPACE 🛸
      </motion.p>
    </div>
  );
}
