import { motion } from 'framer-motion';
import { GitBranch, Code2, Heart, Rocket } from 'lucide-react';

const timelineEvents = [
  {
    icon: GitBranch,
    title: 'Project Discovery',
    description: 'A developer with a brilliant idea but limited means can post it on the platform, giving it a second chance at life. Other developers can then discover these abandoned yet promising projects, pick them up, and revive them into something great.',
    date: 'Phase 1'
  },
  {
    icon: Code2,
    title: 'Initial Revival',
    description: 'Other developers can chat directly with the original creator to gain deeper insights and fully understand the project’s vision. Once aligned, the code assessment and modernization process begins, breathing new life into what was once left behind.',
    date: 'Phase 2'
  },
  {
    icon: Heart,
    title: 'Community Support',
    description: 'he developer then dives into the revival, sharing regular progress updates as the project evolves. The community reviews, supports, and blesses each milestone - and as the revival gains momentum, blessings flow in, symbolizing encouragement and appreciation from fellow developers who believe in the comeback.',
    date: 'Phase 3'
  },
  {
    icon: Rocket,
    title: 'Project Launch',
    description: 'The revived project finally goes live, standing as proof that no idea is ever truly lost - and in doing so, it sparks new waves of inspiration, fueling the next cycle of revivals across the community.',
    date: 'Phase 4'
  }
];

export function TimelineSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">
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
            REVIVAL TIMELINE
          </h2>
          <div className="w-24 h-1 bg-[#39FF14] mx-auto" style={{ boxShadow: '0 0 10px #39FF14' }} />
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#39FF14] to-transparent opacity-30" />

          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex flex-col md:flex-row gap-8 items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:text-left`}>
                    <div 
                      className="inline-block px-4 py-1 bg-[#39FF14] bg-opacity-10 border border-[#39FF14] border-opacity-30 rounded-full mb-4"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      <span className="text-[#39FF14]">{event.date}</span>
                    </div>
                    
                    <h3 
                      className="mb-3 text-white"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {event.title}
                    </h3>
                    
                    <p 
                      className="text-gray-400 leading-relaxed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 rounded-full bg-black border-2 border-[#39FF14] flex items-center justify-center"
                    style={{ boxShadow: '0 0 30px rgba(57, 255, 20, 0.4)' }}
                  >
                    <event.icon className="w-10 h-10 text-[#39FF14]" />
                  </motion.div>
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}