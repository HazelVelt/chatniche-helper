
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Sparkles, ArrowRight, Users, Zap, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Parallax effect for hero section with clean-up
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroElements = document.querySelectorAll('.parallax-element');
      
      heroElements.forEach((el, index) => {
        const speed = 0.1 + (index * 0.05);
        (el as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const features = [
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: 'AI-Generated Profiles',
      description: 'Our app uses local machine learning to create unique, realistic profiles that match your preferences.'
    },
    {
      icon: <Heart className="h-10 w-10 text-primary" />,
      title: 'Smart Matching',
      description: 'Our algorithm learns your preferences over time to suggest better matches.'
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: 'Intelligent Conversations',
      description: 'Chat with AI-powered profiles that respond naturally to your messages.'
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Privacy Focused',
      description: 'All data stays on your device - we never store your conversations or preferences on remote servers.'
    }
  ];
  
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Texture overlay */}
      <div className="texture-overlay"></div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="container mx-auto text-center z-10 mt-[-80px] md:mt-0 max-w-5xl">
          <div className="mb-6 inline-block">
            <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium handdrawn-border">
              Meet Your AI Companion
            </span>
          </div>
          
          <h1 className="parallax-element text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/70 animate-slide-up">
            Find Your Perfect <span className="handdrawn-underline">
              AI Match
            </span>
          </h1>
          
          <p className="parallax-element text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up animation-delay-100">
            Experience dating reimagined with AI-generated profiles that feel real. 
            Chat, connect, and discover matches powered by your local machine learning.
          </p>
          
          <div className="parallax-element flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up animation-delay-200">
            <Button
              size="lg"
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto group relative overflow-hidden handdrawn-border"
            >
              <span className="relative z-10 flex items-center">
                Start Discovering
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
              className="w-full sm:w-auto handdrawn-border"
            >
              Learn More
            </Button>
          </div>
          
          {/* Hero graphic */}
          <div className="relative mx-auto w-full max-w-2xl mt-12 animate-slide-up animation-delay-300">
            <div className="relative z-10 grid grid-cols-3 gap-2 md:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "rounded-xl overflow-hidden relative group transition-all duration-500 transform",
                    i === 2 ? "col-span-2 row-span-2" : "",
                    "hover:scale-[1.02] hover:shadow-xl handdrawn-box"
                  )}
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    transform: `translateY(${i % 2 === 0 ? '5px' : '0px'}) rotate(${i % 2 === 0 ? '0.5deg' : '-0.5deg'})`,
                    transition: 'all 0.5s ease-out'
                  }}
                >
                  <div className={cn("glass h-full aspect-square md:aspect-auto", 
                    theme === 'dark' ? 'neo-blur' : '')}>
                    <div className="p-2 md:p-4 h-full flex flex-col justify-between">
                      <div className="w-full h-3/4 bg-secondary/30 dark:bg-white/5 rounded-md mb-2"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-secondary/50 dark:bg-white/10"></div>
                        <div className="h-3 w-16 bg-secondary/50 dark:bg-white/10 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 text-primary/20 dark:text-primary/10 animate-pulse">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,30 30,10 50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 Z" 
                  stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 10" />
              </svg>
            </div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 text-primary/20 dark:text-primary/10 animate-pulse animation-delay-200">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="4" 
                  strokeLinecap="round" strokeDasharray="10 10" />
              </svg>
            </div>
          </div>
          
          <div className="animate-bounce mt-12 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" onClick={scrollToFeatures}>
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Wave divider */}
      <div className="wave-divider w-full"></div>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block">
              <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block handdrawn-border">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 handdrawn-underline inline-block">A New Way to Connect</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto mt-4">Discover how AI Match creates meaningful connections by leveraging the power of local machine learning.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-background rounded-2xl p-8 transition-all duration-500 border border-border handdrawn-box card-shadow hover:shadow-lg",
                  "animate-slide-up"
                )}
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  transform: `rotate(${Math.random() * 0.5 - 0.25}deg)`
                }}
              >
                <div className="bg-primary/10 rounded-xl p-3 w-fit mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How it works Section */}
      <section className="py-20 px-4 bg-secondary/30 dark:bg-secondary/10 relative">
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block handdrawn-border">The Process</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 handdrawn-underline inline-block">Built With Privacy In Mind</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto mt-4">AI Match runs completely on your device, keeping your data private and secure.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line between steps */}
              <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-border z-0" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='2' viewBox='0 0 6 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,1 L6,1' stroke='%23e5e7eb' stroke-width='2' stroke-linecap='round' stroke-dasharray='1 3'/%3E%3C/svg%3E\")",
                backgroundRepeat: "repeat-x",
                height: "2px"
              }}></div>
              
              {[
                {
                  step: "01",
                  title: "Create Profile",
                  description: "Set up your preferences and let our AI understand what you're looking for",
                  icon: <Palette className="h-6 w-6 text-primary" />
                },
                {
                  step: "02",
                  title: "Discover Matches",
                  description: "Browse through AI-generated profiles tailored to your preferences",
                  icon: <Sparkles className="h-6 w-6 text-primary" />
                },
                {
                  step: "03",
                  title: "Connect & Chat",
                  description: "Start conversations with your matches and get to know them better",
                  icon: <Zap className="h-6 w-6 text-primary" />
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="relative z-10 bg-background rounded-xl p-8 border border-border card-shadow handdrawn-box"
                  style={{ transform: `rotate(${Math.random() * 0.6 - 0.3}deg)` }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      {item.icon}
                    </div>
                    <div className="text-4xl font-bold text-primary/20">{item.step}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Wave divider */}
      <div className="wave-divider w-full transform rotate-180"></div>
      
      {/* Call to Action */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-2xl mx-auto bg-background rounded-3xl p-10 border border-border card-shadow handdrawn-box">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 handdrawn-underline inline-block">Ready to meet your AI match?</h2>
            <p className="text-lg text-muted-foreground mb-10 mt-4">
              Join thousands of users who are already experiencing the future of dating with AI Match.
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate('/discover')}
              className="group handdrawn-border"
            >
              <span className="flex items-center">
                Get Started Now
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-primary flex items-center">
                <span className="text-2xl">AI</span>
                <span className="ml-1 font-light">Match</span>
              </span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors handdrawn-underline">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors handdrawn-underline">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors handdrawn-underline">Contact</a>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Match. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
