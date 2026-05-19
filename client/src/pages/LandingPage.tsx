import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(1); // Default to middle

  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position from -1 to 1 based on screen center for parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Determine active feature based on horizontal cursor position
      const width = window.innerWidth;
      let newFeature = 1;
      if (e.clientX < width / 3) {
        newFeature = 0;
      } else if (e.clientX > (width * 2) / 3) {
        newFeature = 2;
      }

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({ x, y });
        setActiveFeature(newFeature);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-[#050505] text-white selection:bg-white/20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Parallax Headphone Background */}
        <div 
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60 transition-transform duration-700 ease-out"
          style={{ 
            transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px) scale(1.1)`,
          }}
        >
          <img 
            src="/headphones.png" 
            alt="3D Headphones" 
            className="w-full max-w-[800px] object-contain mix-blend-screen"
          />
        </div>

        {/* Foreground Content */}
        <div 
          className="relative z-10 w-full max-w-5xl text-center space-y-10 transition-transform duration-500 ease-out"
          style={{ 
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-md text-sm text-neutral-300 shadow-xl">
            <Sparkles size={18} className="text-white" />
            <span className="font-medium tracking-wide">The Future of Emotional Therapy</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter drop-shadow-2xl leading-[1.1]">
            Tune into your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600">Emotions</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto font-light leading-relaxed">
            AI Moodify uses advanced facial recognition to detect how you feel and curates the perfect playlist to harmonize your mood.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link 
              to="/signup" 
              className="px-10 py-5 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-3 text-lg hover:scale-105"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link 
              to="/login" 
              className="px-10 py-5 bg-[#0a0a0a] border border-neutral-800 hover:bg-neutral-900 rounded-full font-bold text-white transition-all flex items-center gap-3 text-lg hover:scale-105"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
          <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-white">Scroll to Explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Interactive Mouse Features Section */}
      <section className="relative h-screen bg-[#050505] overflow-hidden flex items-center border-t border-neutral-900/50">
        
        {/* Dynamic Zone Indicators (Subtle UI hints) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-12 z-20 opacity-30 pointer-events-none">
           <span className={`text-xs font-bold tracking-widest uppercase transition-colors duration-500 ${activeFeature === 0 ? 'text-white' : 'text-neutral-600'}`}>Left</span>
           <span className={`text-xs font-bold tracking-widest uppercase transition-colors duration-500 ${activeFeature === 1 ? 'text-white' : 'text-neutral-600'}`}>Center</span>
           <span className={`text-xs font-bold tracking-widest uppercase transition-colors duration-500 ${activeFeature === 2 ? 'text-white' : 'text-neutral-600'}`}>Right</span>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-[500px]">
          
          {/* Feature 0 (Cursor Left): Text Left, Image Right */}
          <div className={`absolute inset-0 flex items-center justify-between transition-all duration-700 ease-out ${activeFeature === 0 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-20 scale-95 pointer-events-none'}`}>
             <div className="w-1/2 pr-12 flex flex-col justify-center">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                  Experience Live <br/><span className="text-purple-500">Facial Analysis</span>
                </h2>
                <p className="text-xl text-neutral-300 leading-relaxed font-light mb-6">
                  Our locally-hosted AI pipeline scans 48 facial landmarks instantly.
                </p>
                <p className="text-lg text-neutral-400 leading-relaxed font-light">
                  We securely and privately gauge your current emotional state in real-time, decoding your exact mood so we can match it perfectly with therapeutic audio.
                </p>
             </div>
             <div className="w-1/2 flex justify-center">
                <img src="/feature_face.png" className="max-w-[500px] w-full object-contain mix-blend-screen drop-shadow-2xl animate-pulse-slow" alt="Facial Analysis" />
             </div>
          </div>

          {/* Feature 1 (Cursor Middle): Image Top, Text Bottom Centered */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out ${activeFeature === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95 pointer-events-none'}`}>
             <img src="/feature_music.png" className="max-w-[400px] w-full object-contain mix-blend-screen mb-10 drop-shadow-2xl animate-pulse-slow" alt="Dynamic Curation" />
             <div className="max-w-3xl text-center flex flex-col justify-center">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                  Intelligent <br/><span className="text-pink-500">Dynamic Curation</span>
                </h2>
                <p className="text-xl text-neutral-300 leading-relaxed font-light mb-4">
                  Playlists are generated on-the-fly using live YouTube Data integration.
                </p>
                <p className="text-lg text-neutral-400 leading-relaxed font-light">
                  Ensure you never listen to the exact same repetitive mix twice. Our system dynamically searches for the hottest Bollywood tracks tailored exclusively to how you feel right now.
                </p>
             </div>
          </div>

          {/* Feature 2 (Cursor Right): Image Left, Text Right */}
          <div className={`absolute inset-0 flex items-center justify-between transition-all duration-700 ease-out ${activeFeature === 2 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-20 scale-95 pointer-events-none'}`}>
             <div className="w-1/2 flex justify-center">
                <img src="/feature_history.png" className="max-w-[500px] w-full object-contain mix-blend-screen drop-shadow-2xl animate-pulse-slow" alt="Emotional Tracking" />
             </div>
             <div className="w-1/2 pl-12 flex flex-col justify-center text-right">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                  Seamless <br/><span className="text-blue-500">Emotional Tracking</span>
                </h2>
                <p className="text-xl text-neutral-300 leading-relaxed font-light mb-6">
                  Review your emotional journey and discover what moves you over time.
                </p>
                <p className="text-lg text-neutral-400 leading-relaxed font-light">
                  Access your personal history to replay the tracks that helped you navigate through your day. Reflect on your emotional patterns in a beautiful, unified dashboard.
                </p>
             </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
