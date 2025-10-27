import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black" />

      {/* Radial Glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated Lines */}
      <svg className="absolute inset-0 w-full h-full">
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={i}
            x1="0"
            y1={`${(i + 1) * 20}%`}
            x2="100%"
            y2={`${(i + 1) * 20}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 255, 144, 0)" />
            <stop offset="50%" stopColor="rgba(0, 255, 144, 0.8)" />
            <stop offset="100%" stopColor="rgba(0, 255, 144, 0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Orbiting Circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: `${(i + 1) * 200}px`,
              height: `${(i + 1) * 200}px`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: {
                duration: 20 + i * 10,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </div>

      {/* Code Rain Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary text-xs font-mono opacity-30"
            style={{
              left: `${i * 5}%`,
              top: '-20px',
            }}
            animate={{
              y: ['0vh', '120vh'],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            {Array.from({ length: 10 }, () =>
              Math.random() > 0.5 ? '1' : '0'
            ).join('\n')}
          </motion.div>
        ))}
      </div>

      {/* Glowing Orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-primary blur-3xl"
          style={{
            width: '300px',
            height: '300px',
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.5, 0.8, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Neural Network Effect */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={`${15 + i * 12}%`}
            cy={`${30 + (i % 3) * 20}%`}
            r="3"
            fill="currentColor"
            className="text-primary"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 1],
              opacity: [0, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Connecting Lines */}
        {[...Array(10)].map((_, i) => (
          <motion.line
            key={`connection-${i}`}
            x1={`${15 + (i % 8) * 12}%`}
            y1={`${30 + (i % 3) * 20}%`}
            x2={`${15 + ((i + 1) % 8) * 12}%`}
            y2={`${30 + ((i + 1) % 3) * 20}%`}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
