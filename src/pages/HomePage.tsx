import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Heart, Users, GitBranch, ChevronDown, Zap, Sparkles } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

export default function HomePage() {
  const { isConnected, connectWallet } = useWallet();
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
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

  const handleConnectWallet = async () => {
    if (!isConnected) {
      await connectWallet();
    }
  };

  const scrollToGraveyard = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse-slow"></div>
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-primary glow-text animate-fade-in">
            DeadTime
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light tracking-wide text-zinc-300 animate-fade-in-delayed">
            "Reviving Abandoned Projects. One Line of Code at a Time."
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center animate-fade-in-delayed-2">
            <button
              onClick={scrollToGraveyard}
              className="btn-primary"
            >
              Explore the Graveyard
            </button>
            <button
              onClick={handleConnectWallet}
              className="btn-secondary group"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              {isConnected ? 'Connected' : 'Connect to the Source'}
            </button>
          </div>
        </div>

        <button
          onClick={scrollToGraveyard}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-primary animate-bounce"
        >
          <ChevronDown className="w-10 h-10" />
        </button>
      </section>

      {/* Description Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="glass-card p-8 border border-primary/30 rounded-xl">
          <p className="text-lg md:text-xl leading-relaxed text-center text-zinc-300">
            DeadTime is a platform for developers to breathe new life into forgotten projects.
            Track revivals, share progress, and connect through blessings — where effort meets resurrection.
          </p>
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

      {/* Network Visualization Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="grid-pattern w-full h-full"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="glass-card p-8 border border-primary/30 rounded-xl">
            <h2 className="text-4xl font-bold mb-6 text-primary glow-text">
              Project Lineage Network
            </h2>
            <p className="text-lg mb-8 text-zinc-300">
              Our advanced visualization system maps relationships between abandoned projects and their revived counterparts,
              showing the flow of code and ideas through the developer ecosystem.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Code DNA Analysis
                </h3>
                <p className="text-zinc-400">
                  We analyze commit patterns, code structure, and architectural decisions to establish lineage relationships.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Revival Impact Scoring
                </h3>
                <p className="text-zinc-400">
                  Each revival is scored based on community engagement, code quality improvements, and adoption metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary glow-text">
            Ready to Resurrect?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-zinc-300">
            Join the movement to bring abandoned projects back to life. Connect your wallet to get started.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/projects" className="btn-primary">
              Browse Graveyard
            </Link>
            <button onClick={handleConnectWallet} className="btn-secondary group">
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              {isConnected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
