import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function NetworkVisualization() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="mb-4 text-[#39FF14]"
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              textShadow: '0 0 20px rgba(57, 255, 20, 0.5)'
            }}
          >
            PROJECT LINEAGE NETWORK
          </h2>
          <div className="w-24 h-1 bg-[#39FF14] mx-auto mb-6" style={{ boxShadow: '0 0 10px #39FF14' }} />
          <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Visualize how revival projects connect to their origins. Each node represents a project, and glowing connections show the resurrection lineage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-[500px] rounded-2xl border border-[#39FF14] border-opacity-30 bg-black overflow-hidden"
        >
          {/* Network SVG */}
          <svg className="w-full h-full" viewBox="0 0 800 500">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <radialGradient id="nodeGradient">
                <stop offset="0%" stopColor="#39FF14" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#39FF14" stopOpacity="0.2"/>
              </radialGradient>
            </defs>

            {/* Connection Lines */}
            <motion.line
              x1="400" y1="250" x2="250" y2="150"
              stroke="#39FF14"
              strokeWidth="2"
              opacity="0.4"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={mounted ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.line
              x1="400" y1="250" x2="550" y2="150"
              stroke="#39FF14"
              strokeWidth="2"
              opacity="0.4"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={mounted ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.7 }}
            />
            <motion.line
              x1="400" y1="250" x2="250" y2="350"
              stroke="#39FF14"
              strokeWidth="2"
              opacity="0.4"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={mounted ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.9 }}
            />
            <motion.line
              x1="400" y1="250" x2="550" y2="350"
              stroke="#39FF14"
              strokeWidth="2"
              opacity="0.4"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={mounted ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 1.1 }}
            />
            <motion.line
              x1="250" y1="150" x2="150" y2="100"
              stroke="#39FF14"
              strokeWidth="2"
              opacity="0.3"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={mounted ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 1.3 }}
            />
            <motion.line
              x1="550" y1="150" x2="650" y2="100"
              stroke="#39FF14"
              strokeWidth="2"
              opacity="0.3"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={mounted ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 1.5 }}
            />

            {/* Animated Particles */}
            {mounted && (
              <>
                <motion.circle
                  r="3"
                  fill="#39FF14"
                  filter="url(#glow)"
                  animate={{
                    cx: [400, 250],
                    cy: [250, 150],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.circle
                  r="3"
                  fill="#39FF14"
                  filter="url(#glow)"
                  animate={{
                    cx: [400, 550],
                    cy: [250, 150],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1
                  }}
                />
              </>
            )}

            {/* Nodes */}
            <motion.circle
              cx="400" cy="250" r="20"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="3"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.circle
              cx="250" cy="150" r="15"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            />
            <motion.circle
              cx="550" cy="150" r="15"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            />
            <motion.circle
              cx="250" cy="350" r="15"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
            />
            <motion.circle
              cx="550" cy="350" r="15"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.2 }}
            />
            <motion.circle
              cx="150" cy="100" r="12"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.4 }}
            />
            <motion.circle
              cx="650" cy="100" r="12"
              fill="url(#nodeGradient)"
              stroke="#39FF14"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={mounted ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.6 }}
            />

            {/* Labels */}
            <text x="400" y="290" textAnchor="middle" fill="#39FF14" fontSize="12" fontFamily="Orbitron, sans-serif">
              Origin
            </text>
            <text x="250" y="185" textAnchor="middle" fill="#39FF14" fontSize="10" fontFamily="Orbitron, sans-serif">
              Revival 1
            </text>
            <text x="550" y="185" textAnchor="middle" fill="#39FF14" fontSize="10" fontFamily="Orbitron, sans-serif">
              Revival 2
            </text>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}