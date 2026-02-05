'use client';

import { useState, useEffect } from 'react';

interface LandingProps {
  onStart: () => void;
}

export function Landing({ onStart }: LandingProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 overflow-hidden">
      {/* Subtle gradient orb that follows mouse */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-1000 ease-out opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-[10%] w-4 h-4 bg-sky-200 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-[15%] w-3 h-3 bg-amber-200 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-[20%] w-5 h-5 bg-emerald-200 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-[25%] w-3 h-3 bg-rose-200 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-sky-700 font-medium">AI companion for neurodivergent children</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-6 animate-fade-in-up">
            A friend who{' '}
            <span className="relative">
              <span className="relative z-10">never</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8 Q50 2 100 8 T198 8" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" className="animate-draw" />
              </svg>
            </span>{' '}
            gets tired of your questions
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-200">
            NeuroBuddy helps children with Down syndrome navigate daily routines through patient, voice-guided support.
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up animation-delay-400">
            <button
              onClick={onStart}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-sky-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Meet your buddy</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4">
            Built for patience
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-16">
            Not gamification. Not engagement metrics. Just patient, adaptive support that celebrates real progress.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎙️',
                title: 'Voice-first',
                description: 'Talk naturally. NeuroBuddy listens and responds with warmth and clarity.',
              },
              {
                icon: '🎯',
                title: 'Routine support',
                description: 'Step-by-step guidance for brushing teeth, getting dressed, and daily tasks.',
              },
              {
                icon: '📈',
                title: 'Skill acquisition',
                description: 'We measure what matters: can they do it independently this week?',
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl bg-slate-50 hover:bg-sky-50 transition-colors duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-sky-50">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl font-medium text-slate-800 leading-relaxed mb-8">
            "The AI isn't replacing his relationships. It's training wheels. He's learning to ride."
          </blockquote>
          <p className="text-slate-600">
            — Parent of a 12-year-old with autism
          </p>
        </div>
      </section>

      {/* Research backing */}
      <section className="py-24 px-6 bg-sky-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Research-driven design
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                NeuroBuddy was built on 83 interviews with parents, special education teachers, principals, and therapists. Six months of field work at schools specializing in neurodivergent learners.
              </p>
              <ul className="space-y-4">
                {[
                  '80+ stakeholder interviews',
                  'Partnership with Drewry Secondary School',
                  '50+ papers synthesized on learning science',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl flex items-center justify-center">
                <div className="text-8xl">🐕</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to meet your buddy?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Free to try. No account required. Works on any device.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold text-lg rounded-2xl hover:bg-sky-100 transition-colors duration-300"
          >
            <span>Start now</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Built by Ahsan Eslami</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/snakezilla/neurobuddy-web" target="_blank" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://www.byahsan.com" target="_blank" className="hover:text-white transition-colors">
              About
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        @keyframes draw {
          from { stroke-dasharray: 200; stroke-dashoffset: 200; }
          to { stroke-dasharray: 200; stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: draw 1s ease-out 0.5s forwards;
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
        }
      `}</style>
    </div>
  );
}
