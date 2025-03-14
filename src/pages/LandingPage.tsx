import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Zap, Trophy, ArrowRight, Star } from 'lucide-react';

export function LandingPage() {
  const [benefitsRef, benefitsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const benefits = [
    {
      icon: <CheckCircle className="w-12 h-12 text-[#FF0000]" />,
      title: "Critical Thinking",
      description: "Identify problem-solvers who can make sound decisions under pressure for your small business."
    },
    {
      icon: <Users className="w-12 h-12 text-[#FF0000]" />,
      title: "Independence",
      description: "Find self-starters who can work autonomously without constant micromanagement."
    },
    {
      icon: <Zap className="w-12 h-12 text-[#FF0000]" />,
      title: "Passion",
      description: "Discover candidates who bring genuine enthusiasm and dedication to their roles."
    },
    {
      icon: <Trophy className="w-12 h-12 text-[#FF0000]" />,
      title: "Role Clarity",
      description: "Match the right talent to the right positions with precise role-fit analysis."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Bakery Owner, Sweet Success",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
      quote: "CoreTrack Assessment helped me find a manager who thinks on their feet when our morning rush hits. My turnover is down 50% this year."
    },
    {
      name: "Marcus Rodriguez",
      role: "Founder, Rodriguez Plumbing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
      quote: "After three bad hires, CoreTrack showed me which candidates could handle independent service calls without constant check-ins."
    },
    {
      name: "Emily Watson",
      role: "Principal, Watson Accounting",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
      quote: "The role mapping feature saved us during tax season. We knew exactly who could handle which clients based on their core traits."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-black py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,0,0,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <span className="text-[#FF0000] font-semibold tracking-wider uppercase">SMB Hiring Tool</span>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl font-montserrat font-bold mb-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-[#FF0000]">CoreTrack Assessment:</span>
              <br />
              Map Talent to Your SMB Success
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Stop guessing—track critical thinkers, self-starters, and passionate hires who fit your small business.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link 
                to="/signup"
                className="bg-[#FF0000] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#FF0000]/90 transition-colors flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/assessment"
                className="text-white bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-colors"
              >
                Demo Assessment
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-8 text-center">The SMB Hiring Challenge</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-gray-600 mb-6">
                Hiring for your SMB is tough—turnover, misfits, and micromanagement kill momentum. CoreTrack Assessment tracks what matters: problem-solvers, independent workers, and team fits.
              </p>
              <p className="text-gray-600 mb-6">
                With a 36-question assessment, you get a Fit Dashboard—pie charts, stoplight signals, and role-ready insights. Onboard with our org chart builder, then invite your team. It's SMB hiring, tracked and cracked.
              </p>
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold mb-4 text-[#FF0000]">What Makes Us Different:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-[#FF0000] flex-shrink-0 mt-1" />
                    <span>Built specifically for small and medium businesses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-[#FF0000] flex-shrink-0 mt-1" />
                    <span>Visual insights that anyone can understand at a glance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-[#FF0000] flex-shrink-0 mt-1" />
                    <span>Clear role mapping to place the right people in the right positions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-[#FF0000] flex-shrink-0 mt-1" />
                    <span>Simple setup with guided org chart creation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-[#FF0000] font-semibold tracking-wider uppercase">Benefits</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mt-2">Core Traits That Matter</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              CoreTrack Assessment focuses on the critical traits that determine success in SMB environments.
            </p>
          </div>

          <div 
            ref={benefitsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-black/5 px-4 py-2 rounded-full text-sm font-medium">
              <span>SMB-Built</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]"></span>
              <span>Visual Insights</span> 
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]"></span>
              <span>Role Clarity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-[#FF0000] font-semibold tracking-wider uppercase">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mt-2">SMB Owners Trust CoreTrack</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.quote}</p>
                <div className="mt-4 flex text-[#FF0000]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-[#FF0000] font-semibold tracking-wider uppercase">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mt-2">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              Everything you need to build a stronger, more effective team
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">CoreTrack Assessment</h3>
              <div className="flex items-center justify-center gap-1 mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-gray-600 mb-6">14-day free trial, no credit card required</p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                  <span>Unlimited assessments for your team</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                  <span>Org chart builder for custom roles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                  <span>Visual fit dashboard with role mapping</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                  <span>AI-powered manager reports via Claude</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                  <span>Email support 7 days a week</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full bg-[#FF0000] text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-[#FF0000]/90 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">Ready to Transform Your SMB Hiring?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of small businesses who've found their perfect team fit with CoreTrack Assessment.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-[#FF0000] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#FF0000]/90 transition-colors"
            >
              Start Your Free 14-Day Trial
            </Link>
            <p className="text-sm text-gray-400 mt-4">No credit card required</p>
          </div>
        </div>
      </section>
    </div>
  );
}