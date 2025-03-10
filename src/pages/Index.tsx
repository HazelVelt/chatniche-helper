
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroTitle = document.querySelector('.hero-title');
      const heroSubtitle = document.querySelector('.hero-subtitle');
      
      if (heroTitle && heroSubtitle) {
        // Move elements at different speeds during scroll
        (heroTitle as HTMLElement).style.transform = `translateY(${scrollY * 0.2}px)`;
        (heroSubtitle as HTMLElement).style.transform = `translateY(${scrollY * 0.1}px)`;
      }
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
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        </div>
        
        <div className="container mx-auto text-center z-10 mt-[-80px] md:mt-0">
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 animate-slide-up">
            AI Match
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up animation-delay-100">
            Experience dating reimagined with AI-generated profiles that feel real. Chat, connect, and discover matches powered by local machine learning.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-slide-up animation-delay-200">
            <Button
              size="lg"
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto"
            >
              Start Discovering
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
          
          <div className="animate-bounce mt-12 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" onClick={scrollToFeatures}>
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-white rounded-2xl p-8 transition-all duration-500 border border-border card-shadow hover:shadow-md",
                  "animate-slide-up"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-b from-white via-secondary to-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to meet your AI match?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already experiencing the future of dating with AI Match.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate('/discover')}
          >
            Get Started Now
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-primary">AI Match</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
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
