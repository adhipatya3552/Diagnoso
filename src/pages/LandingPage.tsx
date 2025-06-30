import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Heart, Pill, Cross, FolderHeart as UserHeart, Shield, Clock, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { TypewriterText } from '../components/TypewriterText';
import { FloatingIcon } from '../components/FloatingIcon';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { GlassCard } from '../components/GlassCard';
import { ParticleBackground } from '../components/ParticleBackground';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { Navbar } from '../components/Navbar';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure & HIPAA Compliant',
      description: 'End-to-end encryption ensures your medical data stays private and secure.',
      stats: { number: 256, suffix: '-bit encryption' }
    },
    {
      icon: Clock,
      title: 'Quick Appointments',
      description: 'Book appointments with specialists in minutes, not weeks.',
      stats: { number: 24, suffix: '/7 availability' }
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connect with certified healthcare professionals worldwide.',
      stats: { number: 10000, suffix: '+ doctors' }
    },
    {
      icon: Award,
      title: 'Quality Care',
      description: 'All doctors are verified and maintain the highest standards.',
      stats: { number: 98, suffix: '% satisfaction' }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-teal-600 text-white font-['Inter',sans-serif] overflow-x-hidden">
      <Navbar />
      <ParticleBackground />
      
      {/* Floating Medical Icons */}
      <FloatingIcon icon={Stethoscope} className="top-20 left-[10%]" animationDelay="0s" />
      <FloatingIcon icon={Heart} className="top-40 right-[15%]" animationDelay="1s" />
      <FloatingIcon icon={Pill} className="top-60 left-[20%]" animationDelay="2s" />
      <FloatingIcon icon={Cross} className="top-80 right-[25%]" animationDelay="1.5s" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div 
          className="text-center max-w-6xl mx-auto"
          style={{ 
            transform: `translateY(${scrollY * 0.1}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.001)
          }}
        >
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-teal-200 bg-clip-text text-transparent">
              <TypewriterText text="Welcome to Diagnosa" speed={80} />
            </h1>
            <p className="text-2xl md:text-3xl text-white/80 mb-12 animate-fade-in-up">
              Connecting Doctors & Patients Seamlessly
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <GlassCard className="group cursor-pointer">
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Cross className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">For Healthcare Professionals</h3>
                <p className="text-white/70 mb-6">
                  Expand your practice and connect with patients who need your expertise
                </p>
                <button 
                  onClick={() => navigate('/doctor/signup')}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  I'm a Doctor
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>

            <GlassCard className="group cursor-pointer">
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserHeart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">For Patients</h3>
                <p className="text-white/70 mb-6">
                  Find the right doctor and get the care you deserve, when you need it
                </p>
                <button 
                  onClick={() => navigate('/patient/signup')}
                  className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  I'm a Patient
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <AnimatedCounter end={50000} suffix="+" className="text-3xl font-bold" />
              <p className="text-white/70">Active Users</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={10000} suffix="+" className="text-3xl font-bold" />
              <p className="text-white/70">Doctors</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={1000000} suffix="+" className="text-3xl font-bold" />
              <p className="text-white/70">Consultations</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={98} suffix="%" className="text-3xl font-bold" />
              <p className="text-white/70">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Why Choose Diagnosa?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience healthcare the way it should be - connected, secure, and accessible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500/30 group-hover:to-teal-500/30 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-white/70 mb-6">{feature.description}</p>
                <div className="text-2xl font-bold text-blue-300">
                  <AnimatedCounter 
                    end={feature.stats.number} 
                    suffix={feature.stats.suffix}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of satisfied doctors and patients
            </p>
          </div>

          <GlassCard hover={false} className="relative">
            <TestimonialCarousel />
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard>
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join the future of healthcare today. It only takes a few minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/doctor/signup')}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center"
              >
                Get Started as Doctor
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/patient/signup')}
                className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center"
              >
                Get Started as Patient
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Cross className="w-8 h-8 text-blue-400" />
                Diagnosa
              </h3>
              <p className="text-white/70">
                Connecting healthcare professionals with patients worldwide through secure, innovative technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-white/70">
                <li>Join Network</li>
                <li>Practice Management</li>
                <li>Telemedicine</li>
                <li>Resources</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Patients</h4>
              <ul className="space-y-2 text-white/70">
                <li>Find Doctors</li>
                <li>Book Appointments</li>
                <li>Health Records</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Compliance</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  HIPAA
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  SOC 2
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  FDA
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>© 2025 Diagnosa. All rights reserved. Secure healthcare platform for the modern world.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};