import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Heart, Users, GitBranch, ChevronDown, Zap, Search, Code, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import AnimatedBackground from '../components/AnimatedBackground';
import Toast from '../components/Toast';
import { NetworkVisualization } from '../components/NetworkVisualization';
import { TimelineSection } from '../components/TimelineSection';

export default function HomePage() {
  console.log('HomePage component rendering...');
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWallet();
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [prevConnected, setPrevConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);

  console.log('HomePage state:', { isConnected, featuresVisible, showToast });

  useEffect(() => {
    console.log('HomePage: Setting up IntersectionObserver');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => observer.disconnect();
  }, []);
  const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Discover Dead Projects',
    description: 'Browse the graveyard of abandoned projects waiting for revival. Filter by technology, complexity, and potential impact.'
  },
  {
    icon: Code,
    number: '02',
    title: 'Fork & Revive',
    description: 'Select a project that resonates with you and claim it for revival. Set your goals and timeline for resurrection.'
  },
  {
    icon: Users,
    number: '03',
    title: 'Act on the project',
    description: 'Fork, refactor, and breathe new life into the codebase. Track your progress and share updates with the community.'
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Launch Revival',
    description: 'Deploy your revived project and receive blessings from the community. Your success inspires others to revive more projects.Users with a specific number of blessings get nft badges to show their dedication in contributing to evolve technology.'
  }
];

  useEffect(() => {
    console.log('HomePage: Connection state changed:', { isConnected, prevConnected });
    if (isConnected && !prevConnected) {
      console.log('HomePage: Showing connection toast');
      setShowToast(true);
    }
    setPrevConnected(isConnected);
  }, [isConnected, prevConnected]);

  const handleConnectWallet = async () => {
    if (!isConnected) {
      await connectWallet();
    }
  };

  const goToProjects = () => {
    console.log('HomePage: Navigating to projects page');
    navigate('/projects');
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Toast
        message="Wallet Connected Successfully!"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            className="text-6xl md:text-8xl font-black mb-6 text-primary glow-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            DeadTime
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-12 font-light tracking-wide text-zinc-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            "Reviving Abandoned Projects. One Line of Code at a Time."
          </motion.p>
          <motion.div
            className="flex flex-col md:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              {!isConnected ? (
                <motion.div
                  key="two-buttons"
                  className="flex flex-col md:flex-row gap-6 justify-center"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={goToProjects}
                    className="btn-primary"
                  >
                    Explore the Graveyard
                  </button>
                  <button
                    onClick={handleConnectWallet}
                    className="btn-secondary group"
                  >
                    <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Connect Wallet
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="one-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <button
                    onClick={goToProjects}
                    className="btn-primary"
                  >
                    Explore the Graveyard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.button
          onClick={scrollToFeatures}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-primary"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-10 h-10" />
        </motion.button>
      </section>

      {/* Description Section */}
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#39FF14] opacity-5 blur-3xl rounded-full" />
          
          <div className="relative bg-black border border-[#39FF14] border-opacity-30 rounded-2xl p-12 backdrop-blur-sm">
            <div className="w-16 h-1 bg-[#39FF14] mb-8 mx-auto" style={{ boxShadow: '0 0 10px #39FF14' }} />
            
            <p 
              className="text-center text-gray-300 leading-relaxed mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              DeadTime is a resurrection hub for abandoned ideas - a place where developers can breathe new life into forgotten codebases. Every project revival tells a story of persistence and creativity. Share your rebuild journey, track your progress, and earn blessings from the community as a sign of support and recognition.
            </p>
            
            <p 
              className="text-center text-gray-400 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
             Each blessing pushes your project closer to greatness - and once you’ve gathered enough, you’ll unlock exclusive NFT badges that showcase your dedication and impact. Beyond the code, DeadTime thrives on collaboration. Through community comments and feedback, you’ll get real-time motivation, ideas, and guidance from fellow builders walking the same path.
            </p>
          

            <div className="w-16 h-1 bg-[#39FF14] mt-8 mx-auto" style={{ boxShadow: '0 0 10px #39FF14' }} />
          </div>
        </motion.div>
      </div>
    </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-primary glow-text">
          Core Systems
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Feature 1 */}
          <div
            className={`feature-card ${featuresVisible ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0ms' }}
          >
            <div className="feature-icon">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Project Revival System</h3>
            <p className="text-zinc-400">
              Track project revivals with our specialized workflow tools and version lineage visualization.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className={`feature-card ${featuresVisible ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '100ms' }}
          >
            <div className="feature-icon">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Blessing Mechanism</h3>
            <p className="text-zinc-400">
              Support projects you believe in through our unique token-based endorsement system.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className={`feature-card ${featuresVisible ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '200ms' }}
          >
            <div className="feature-icon">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Developer Community</h3>
            <p className="text-zinc-400">
              Connect with like-minded developers passionate about breathing life into abandoned code.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            className={`feature-card ${featuresVisible ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '300ms' }}
          >
            <div className="feature-icon">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Lineage Tracker</h3>
            <p className="text-zinc-400">
              Visualize how revived projects connect to their original ancestors through code DNA mapping.
            </p>
          </div>
        </div>
      </section>

       <section className="py-24 px-4 relative">
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
            HOW IT WORKS
          </h2>
          <div className="w-24 h-1 bg-[#39FF14] mx-auto mb-6" style={{ boxShadow: '0 0 10px #39FF14' }} />
          <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Browse abandoned projects, revive projects and recieve nft badges.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#39FF14] to-transparent opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  {/* Number Badge */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="relative inline-block mb-6"
                  >
                    <div 
                      className="w-20 h-20 rounded-full bg-black border-2 border-[#39FF14] flex items-center justify-center mx-auto"
                      style={{ boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)' }}
                    >
                      <step.icon className="w-10 h-10 text-[#39FF14]" />
                    </div>
                    <div 
                      className="absolute -top-2 -right-2 w-8 h-8 bg-[#39FF14] rounded-full flex items-center justify-center text-black text-xs"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {step.number}
                    </div>
                  </motion.div>

                  <h3 
                    className="mb-4 text-white"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {step.title}
                  </h3>

                  <p 
                    className="text-gray-400 leading-relaxed"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
      <NetworkVisualization />
      <TimelineSection />
      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
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
            JOIN THE COMMUNITY
          </h2>
          <div className="w-24 h-1 bg-[#39FF14] mx-auto mb-6" style={{ boxShadow: '0 0 10px #39FF14' }} />
          <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </motion.div>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/projects" className="btn-primary">
              Explore the Graveyard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
