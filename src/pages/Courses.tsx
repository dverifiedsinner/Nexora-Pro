import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Award, Clock, Star, Zap, ChevronRight, Search, Filter, AlertCircle, Check, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Quiz from '../components/Quiz';

export default function Courses() {
  const { userData } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeArticle, setActiveArticle] = useState<any>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('*');
        if (data && data.length > 0) {
          const merged = data.map((c: any) => {
            const defaultCourse = defaultCourses.find(dc => dc.title === c.title);
            return {
              ...defaultCourse,
              ...c,
              reward: c.reward || (c.price * 3.5)
            };
          });
          setCourses(merged);
        } else {
          setCourses(defaultCourses);
        }
      } catch (err) {
        setCourses(defaultCourses);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const defaultCourses = [
    { 
      id: 'c1', 
      title: 'Digital Marketing Mastery', 
      price: 2500, 
      reward: 8750, 
      category: 'Marketing', 
      lessons: 12, 
      duration: '4h 30m',
      rating: 4.8,
      members: 1240,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
      questions: [
        { id: 1, text: "What is the primary goal of SEO?", options: ["Visibility", "Offline Sales", "Color Theory", "Server Speed"], correctAnswer: 0 },
        { id: 2, text: "Which platform is best for B2B marketing?", options: ["TikTok", "LinkedIn", "Instagram", "Snapchat"], correctAnswer: 1 },
        { id: 3, text: "What does CTR stand for?", options: ["Click Through Rate", "Cost To Run", "Client Trust Ratio", "Core Task Result"], correctAnswer: 0 },
        { id: 4, text: "A high bounce rate usually indicates?", options: ["Success", "Good content", "Poor user experience", "High load speed"], correctAnswer: 2 },
        { id: 5, text: "Which is a 'Social Proof' element?", options: ["Testimonials", "Product Price", "Logo Color", "Font size"], correctAnswer: 0 },
      ]
    },
    { 
      id: 'c2', 
      title: 'Crypto Trading Alpha', 
      price: 5000, 
      reward: 17500, 
      category: 'Finance', 
      lessons: 18, 
      duration: '6h 15m',
      rating: 4.9,
      members: 850,
      image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=400',
      questions: [
        { id: 1, text: "What's an 'ATH'?", options: ["All Time High", "All Time Honor", "Asset Trade Hour", "Active Time Hold"], correctAnswer: 0 },
        { id: 2, text: "Which wallet is most secure?", options: ["Exchange", "Hot Wallet", "Cold Wallet", "Web Extension"], correctAnswer: 2 },
        { id: 3, text: "What is 'FOMO'?", options: ["Fear Of Missing Out", "Fast Open Market Order", "Fixed Only Margin Option", "Future Option Market Offer"], correctAnswer: 0 },
        { id: 4, text: "Who founded Bitcoin?", options: ["Vitalik", "Satoshi", "Elon", "Zuck"], correctAnswer: 1 },
        { id: 5, text: "Ethereum's consensus is?", options: ["PoW", "PoS", "PBFT", "DPoS"], correctAnswer: 1 },
      ]
    },
    { 
      id: 'c3', 
      title: 'UI Design Lab', 
      price: 3000, 
      reward: 10500, 
      category: 'Design', 
      lessons: 10, 
      duration: '3h 45m',
      rating: 4.7,
      members: 520,
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=400',
      questions: [
        { id: 1, text: "What is white space?", options: ["Empty area", "White colored font", "Error space", "Header area"], correctAnswer: 0 },
        { id: 2, text: "Which is a primary color?", options: ["Green", "Purple", "Blue", "Orange"], correctAnswer: 2 },
        { id: 3, text: "What does UI stand for?", options: ["User Interface", "User Interaction", "Unit Internal", "Unique Idea"], correctAnswer: 0 },
        { id: 4, text: "Contrast helps with?", options: ["Legibility", "Speed", "Price", "Coding"], correctAnswer: 0 },
        { id: 5, text: "What is a 'Mockup'?", options: ["Final code", "Sketch", "Static design", "Idea"], correctAnswer: 2 },
      ]
    }
  ];

  const [enrollConfirmation, setEnrollConfirmation] = useState<{ course: any, walletType: 'main' | 'bonus' } | null>(null);

  const handleEnroll = async () => {
    if (!userData || !enrollConfirmation) return;
    
    const { course, walletType } = enrollConfirmation;

    if (Number((userData.balances as any)[walletType]) < course.price) {
      alert(`Insufficient funds in ${walletType} Wallet. Please fund your node.`);
      setEnrollConfirmation(null);
      return;
    }

    setIsEnrolling(true);
    setEnrollConfirmation(null);
    try {
      const newBalances = {
        ...userData.balances,
        [walletType]: Number((userData.balances as any)[walletType]) - course.price
      };
      
      const enrolledCourses = Array.isArray((userData as any).enrolledCourses) 
        ? [...(userData as any).enrolledCourses, course.id]
        : [course.id];

      const { error } = await supabase
        .from('profiles')
        .update({
          balances: newBalances,
          enrolledCourses: enrolledCourses
        })
        .eq('uid', userData.uid);

      if (error) throw error;
      
      // Log transaction
      const newTransaction = {
        type: 'course_purchase',
        title: `COURSE ACCESS: ${course.title}`,
        amount: -course.price,
        time: new Date().toISOString(),
        status: 'SETTLED',
        wallet: walletType
      };

      await supabase.from('profiles').update({
        transactions: [...(userData.transactions || []), newTransaction]
      }).eq('uid', userData.uid);

      // Handle Referral Commission (25%)
      if (userData.referredBy) {
        const { data: referrer, error: refError } = await supabase
          .from('profiles')
          .select('balances')
          .eq('uid', userData.referredBy)
          .single();

        if (referrer && !refError) {
          const commission = course.price * 0.25;
          const newRefBalances = {
            ...referrer.balances,
            referral: Number(referrer.balances.referral || 0) + commission
          };
          await supabase
            .from('profiles')
            .update({ balances: newRefBalances })
            .eq('uid', userData.referredBy);
        }
      }

      // Automatically start the quiz after successful enrollment
      setSelectedCourse(course);
      setIsQuizzing(true);
      
    } catch (err) {
      console.error(err);
      alert('Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStartAudit = (course: any) => {
    setSelectedCourse(course);
    if (course.article) {
      setActiveArticle(course);
    } else {
      setIsQuizzing(true);
    }
  };

  const handleQuizComplete = async (finalEarning: number) => {
    if (!userData || !selectedCourse) return;

    try {
      const newBalances = {
        ...userData.balances,
        investment: Number(userData.balances.investment || 0) + finalEarning
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ balances: newBalances })
        .eq('uid', userData.uid);

      if (error) throw error;
      // Optionally remove from enrolled or mark as completed
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuizzing(false);
      setSelectedCourse(null);
    }
  };

  const isEnrolled = (courseId: string) => {
    return (userData as any)?.enrolledCourses?.includes(courseId);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={48} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-gradient uppercase tracking-tight italic">Knowledge Streams.</h1>
          <p className="text-white/40 text-sm font-light italic">Audit high-tier curriculum to unlock investment yields.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter nodes..." 
              className="bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all w-full md:w-64 text-[10px] font-black uppercase tracking-widest"
            />
          </div>
        </div>
      </header>

      {/* Course Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Nodes', value: (userData as any)?.enrolledCourses?.length || '0', icon: BookOpen, color: 'text-cyan-400' },
          { label: 'Yield Gained', value: `₦${userData?.balances.investment.toLocaleString()}`, icon: Award, color: 'text-pink-400' },
          { label: 'Bonus Reserve', value: `₦${userData?.balances.bonus.toLocaleString()}`, icon: Zap, color: 'text-blue-400' },
          { label: 'Network Size', value: '1.2k+', icon: Star, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-5 border-white/5 shadow-xl animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
            <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 ${stat.color} shadow-2xl`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xl font-display font-black tracking-tight">{stat.value}</p>
              <p className="text-[9px] uppercase font-black text-white/20 tracking-widest leading-none">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map((course, i) => (
          <motion.div 
            key={course.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card group flex flex-col border-white/5 hover:border-cyan-500/30 overflow-hidden relative"
          >
            <div className="aspect-video relative overflow-hidden">
               <img 
                 src={course.image} 
                 alt={course.title} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[50%] group-hover:grayscale-0" 
               />
               <div className="absolute top-4 left-4 flex gap-2 z-10">
                 <span className="px-4 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-500/30">
                    {course.category}
                 </span>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/20 to-transparent"></div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col relative z-10">
              <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic leading-[1.1] mb-4 group-hover:text-cyan-400 transition-colors">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] font-black text-white/20 mb-8">
                <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-cyan-400" /> {course.lessons} Audits</span>
                <span className="flex items-center gap-1.5"><Clock size={12} className="text-cyan-400" /> {course.duration}</span>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <p className="text-[9px] uppercase font-black text-white/20 tracking-widest mb-1 italic">Vesting Amount</p>
                    <p className="text-2xl font-display font-black italic tracking-tighter">₦{course.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black text-cyan-400 tracking-widest mb-1 italic">Max Potential</p>
                    <p className="text-2xl font-display font-black text-cyan-400 italic tracking-tighter">₦{course.reward.toLocaleString()}</p>
                  </div>
                </div>

                {isEnrolled(course.id) ? (
                  <button 
                    onClick={() => handleStartAudit(course)}
                    className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em] text-xs shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-cyan-500"
                  >
                    Initiate Audit <ArrowRight size={18} />
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button 
                      disabled={isEnrolling}
                      onClick={() => setEnrollConfirmation({ course, walletType: 'main' })}
                      className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em] text-xs shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isEnrolling ? 'Configuring Node...' : 'Secure Access (Main)'}
                    </button>
                    <button 
                      disabled={isEnrolling}
                      onClick={() => setEnrollConfirmation({ course, walletType: 'bonus' })}
                      className="w-full btn-outline py-5 uppercase font-black tracking-[0.2em] text-xs active:scale-95 transition-all text-white/40 border-white/5 hover:border-cyan-500/30 hover:text-white"
                    >
                      Redeem Bonus Yield
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {enrollConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnrollConfirmation(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8 md:p-12 border-white/10 bg-[#0d1117] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <ShieldAlert className="text-cyan-400" size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Secure Node?</h3>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Protocol Authorization Required</p>
                  </div>
                </div>

                <div className="glass-card p-6 border-white/5 bg-white/[0.02] space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Resource</span>
                    <span className="font-bold text-white uppercase">{enrollConfirmation.course.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Vesting Amount</span>
                    <span className="font-bold text-white">₦{enrollConfirmation.course.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Authorized Wallet</span>
                    <span className="font-bold text-cyan-400 uppercase">{enrollConfirmation.walletType} Wallet</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => setEnrollConfirmation(null)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleEnroll}
                    className="flex-1 btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20"
                  >
                    Secure Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeArticle && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[85vh] glass-card flex flex-col border-white/10 bg-[#0d1117] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="text-xl font-display font-black uppercase italic tracking-tight text-cyan-400">{activeArticle.title}</h3>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">Audit Session Protocol</p>
                </div>
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
                >
                  <AlertCircle size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6">
                <style dangerouslySetInnerHTML={{ __html: `
                  .article-content p { margin-bottom: 1.5rem; line-height: 1.8; color: rgba(255,255,255,0.6); font-style: italic; font-weight: 300; }
                  .article-content h2 { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; margin: 2rem 0 1rem; color: #fff; letter-spacing: -0.05em; font-style: italic; }
                `}} />
                <div className="article-content text-sm md:text-base whitespace-pre-wrap">
                  {activeArticle.article}
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Back to Hub
                </button>
                <button 
                  onClick={() => {
                    setActiveArticle(null);
                    setIsQuizzing(true);
                  }}
                  className="flex-1 btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20"
                >
                  Take Verification Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isQuizzing && selectedCourse && (
          <Quiz 
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
            rewardGoal={selectedCourse.reward}
            questions={selectedCourse.questions}
            onComplete={handleQuizComplete}
            onCancel={() => {
              setIsQuizzing(false);
              setSelectedCourse(null);
            }}
          />
        )}
      </AnimatePresence>
      {/* Featured Section */}
      <section className="glass-card p-1 bg-gradient-to-r from-cyan-600/10 via-blue-600/5 to-transparent border-white/5 overflow-hidden relative mt-12 shadow-2xl">
        <div className="p-10 md:p-16 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-black leading-[0.9] tracking-tighter italic uppercase text-gradient">Elite <br /> Partner Program.</h2>
            <p className="text-lg text-white/40 leading-relaxed max-w-md font-light italic">
              Monetize your expertise. Apply to become a NEXORA content creator and earn lifelong commissions on every enrollment.
            </p>
            <button className="btn-outline flex items-center gap-3 group border-white/10 uppercase tracking-widest font-black text-xs py-4 px-10">
              Apply to Teach <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="aspect-square w-full bg-white/5 rounded-full border border-white/5 flex items-center justify-center relative scale-90 translate-x-10">
               <Award size={160} strokeWidth={0.5} className="text-white/10" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px]"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
