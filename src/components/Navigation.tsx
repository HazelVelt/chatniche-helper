
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { path: '/', label: 'Home', showInFooter: true },
    { path: '/discover', label: 'Discover', icon: <Heart size={20} />, showInMobile: true },
    { path: '/chat', label: 'Messages', icon: <MessageSquare size={20} />, showInMobile: true },
    { path: '/profile', label: 'Profile', icon: <User size={20} />, showInMobile: true },
    { path: '/about', label: 'About', showInFooter: true },
  ];
  
  // Desktop navigation
  const DesktopNav = () => (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 hidden md:block",
      scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary flex items-center">
          <span className="text-2xl">AI</span>
          <span className="ml-1 font-light">Match</span>
        </Link>
        
        <div className="flex items-center space-x-8">
          {navLinks.filter(link => !link.showInFooter || link.showInMobile).map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "nav-link",
                isActive(link.path) && "nav-link-active"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
  
  // Mobile navigation
  const MobileNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around">
        {navLinks.filter(link => link.showInMobile).map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex flex-col items-center py-3 px-5 transition-colors",
              isActive(link.path) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
  
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
};

export default Navigation;
