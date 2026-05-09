import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Award, Clock, Star, Zap, ChevronRight, 
  Search, Filter, AlertCircle, Check, ArrowRight, 
  Loader2, ShieldAlert, Plus, Play 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, getDocs, doc, getDoc, 
  serverTimestamp, runTransaction 
} from 'firebase/firestore';
import Quiz from '../components/Quiz';

export default function Courses() {
  const { user, userData, refreshUserData } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const courseData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(courseData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (course: any) => {
    if (!user || !userData) return;
    if ((userData.balances?.main || 0) < course.price) {
      alert('INSUFFICIENT_LIQUIDITY: Top up main wallet to join protocol.');
      return;
    }

    setIsEnrolling(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(doc(db, 'users', user.uid));
        if (!userDoc.exists()) throw new Error("User node not found");

        const userBalances = userDoc.data().balances || {};
        const activeCourses = userDoc.data().activeCourses || [];

        if (activeCourses.includes(course.id)) throw new Error("Node already synchronized with this module");

        transaction.update(doc(db, 'users', user.uid), {
          'balances.main': userBalances.main - course.price,
          activeCourses: [...activeCourses, course.id]
        });

        // Add transaction record
        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          userId: user.uid,
          userName: userData.displayName,
          type: 'course_purchase',
          title: `SYNC: ${course.title}`,
          amount: -course.price,
          status: 'settled',
          createdAt: serverTimestamp()
        });
      });

      await refreshUserData();
      setSelectedCourse(course);
      alert('PROTOCOL_SYNCHRONIZED');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-ink dark:text-white" size={48} />
      </div>
    );
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-ink dark:text-white pb-24">
      {/* Brutalist Hero Header */}
      <div className="bg-ink text-yellow-400 border-b-4 border-ink p-10 md:p-16 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] opacity-40">KNOWLEDGE_EXTRACTION_PROTOCOLS</span>
          <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">INTEL<br />MODULES.</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <p className="max-w-xl text-xs md:text-sm font-mono font-bold leading-relaxed opacity-80">
              Synchronize your neural network with high-tier technical curriculum. Complete modules, verify knowledge via protocols, and extract rewards from the distributed ledger.
            </p>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-400/40" size={20} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH_INTEL_INDEX..."
                className="w-full bg-white/5 border-4 border-yellow-400 p-5 pl-16 font-black text-xs uppercase focus:outline-none focus:bg-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCourses.map((course, i) => {
            const isActive = userData?.activeCourses?.includes(course.id);
            const isCompleted = userData?.completedCourses?.includes(course.id);

            return (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-4 border-ink dark:border-white bg-white dark:bg-slate-900 group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all flex flex-col"
              >
                <div className="h-56 overflow-hidden border-b-4 border-ink dark:border-white relative grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute top-4 right-4 bg-yellow-400 text-ink border-4 border-ink p-3 scale-110 group-hover:scale-125 transition-transform">
                    <p className="text-[10px] font-black uppercase leading-none opacity-40">FEE</p>
                    <p className="text-xl font-display font-black leading-none">₦{course.price.toLocaleString()}</p>
                  </div>
                  {isCompleted && (
                    <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                      <div className="bg-emerald-500 text-white border-4 border-white p-4 rotate-[-10deg] font-display font-black uppercase text-2xl">COMPLETED</div>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">/{course.category || 'GENERAL'}</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-black">{course.rating || '4.9'}</span>
                      </div>
                    </div>
                    <h3 className="text-4xl font-display font-black uppercase italic tracking-tighter leading-none">{course.title}</h3>
                    <p className="text-xs font-mono font-bold opacity-60 line-clamp-2">{course.description || 'Module details restricted to registered operators.'}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 py-6 border-y-2 border-ink/5 dark:border-white/5">
                      <div>
                        <p className="text-[8px] font-black opacity-40 uppercase mb-1">MODULE_REWARD</p>
                        <p className="text-xl font-display font-black text-emerald-600">₦{(course.price * 3.5).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black opacity-40 uppercase mb-1">STAKED_NODES</p>
                        <p className="text-xl font-display font-black">{(course.members || 1240).toLocaleString()}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => isCompleted ? setSelectedCourse(course) : (isActive ? setSelectedCourse(course) : enrollInCourse(course))}
                      disabled={isEnrolling}
                      className={`w-full py-5 font-black text-xs uppercase tracking-widest transition-all skew-x-[-10deg] group/btn ${
                        isActive ? 'bg-ink text-white' : 'bg-yellow-400 text-ink border-4 border-ink'
                      }`}
                    >
                      <span className="skew-x-[10deg] flex items-center justify-center gap-3">
                        {isEnrolling ? <Loader2 className="animate-spin" /> : (isActive ? (<><Play size={18} fill="currentColor" /> RESUME_SYNC</>) : 'SYNCHRONIZE_NODE')}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/95 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-5xl bg-white border-[8px] border-ink p-8 md:p-16 flex flex-col gap-12 overflow-y-auto max-h-[90vh]"
             >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest">PROTOCOL_ACTIVE: {selectedCourse.id}</span>
                    <h3 className="text-5xl font-display font-black uppercase italic tracking-tighter leading-none mt-2">{selectedCourse.title}</h3>
                  </div>
                  <button onClick={() => { setSelectedCourse(null); setIsQuizzing(false); }} className="p-4 border-4 border-ink hover:bg-ink hover:text-white transition-all"><Plus className="rotate-45" size={48} /></button>
                </div>

                {!isQuizzing ? (
                  <div className="grid md:grid-cols-[1fr_300px] gap-12">
                    <div className="space-y-12">
                      <div className="prose prose-slate max-w-none">
                         <div className="p-10 bg-slate-50 border-l-[12px] border-ink space-y-6">
                            <h4 className="text-xl font-display font-black uppercase tracking-tight italic border-b-2 border-ink/5 pb-2">CURRICULUM_INTEL</h4>
                            <p className="font-mono text-sm leading-relaxed">{selectedCourse.description}</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {(selectedCourse.articles || []).map((art: any, i: number) => (
                          <div key={i} className="p-8 border-4 border-ink bg-slate-50 relative group">
                            <span className="absolute -top-4 -left-4 w-12 h-12 bg-ink text-white flex items-center justify-center font-black">{i+1}</span>
                            <h5 className="font-display font-black uppercase text-xl leading-tight mb-4">{art.title}</h5>
                            <p className="text-[10px] font-mono font-bold opacity-40 uppercase">DATA_PACKET_{i+1}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="p-10 border-4 border-ink bg-yellow-400 space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-ink text-ink pb-4">TERMINAL_ACTIONS</h4>
                          <p className="text-[10px] font-mono font-bold leading-relaxed">
                            Verify completion of module by initiating the verification protocol. Success results in instant reward distribution.
                          </p>
                          <button 
                            onClick={() => setIsQuizzing(true)}
                            className="w-full py-5 bg-ink text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)]"
                          >
                            INITIATE_QUIZ
                          </button>
                       </div>

                       <div className="p-8 border-4 border-ink space-y-4">
                          <p className="text-[10px] font-black uppercase opacity-40">NODE_HEALTH</p>
                          <div className="flex gap-2">
                             {[...Array(6)].map((_, i) => (
                               <div key={i} className={`h-2 flex-1 border-2 border-ink ${i < 4 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                             ))}
                          </div>
                          <p className="text-[8px] font-mono font-black italic">INTEGRITY: HIGH</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto w-full">
                    <Quiz 
                      course={selectedCourse} 
                      onComplete={async (score) => {
                        const pass = score >= 80;
                        if(pass && !userData?.completedCourses?.includes(selectedCourse.id)) {
                          try {
                            await runTransaction(db, async (transaction) => {
                              const userRef = doc(db, 'users', user.uid);
                              const userSnap = await transaction.get(userRef);
                              const uData = userSnap.data();
                              const currentReferral = uData?.balances?.referral || 0;
                              const completed = uData?.completedCourses || [];

                              transaction.update(userRef, {
                                'balances.referral': currentReferral + (selectedCourse.price * 3.5),
                                completedCourses: [...completed, selectedCourse.id]
                              });

                              const transRef = doc(collection(db, 'transactions'));
                              transaction.set(transRef, {
                                userId: user.uid,
                                type: 'course_yield',
                                title: `YIELD: ${selectedCourse.title}`,
                                amount: selectedCourse.price * 3.5,
                                status: 'settled',
                                createdAt: serverTimestamp()
                              });
                            });
                            await refreshUserData();
                            alert(`PROTOCOLSUCCESS: Yield of ₦${(selectedCourse.price * 3.5).toLocaleString()} processed to referral vault.`);
                          } catch(e) {
                            console.error(e);
                          }
                        } else if(!pass) {
                           alert('PROTOCOL_FAILED: Knowledge threshold below 80%. Re-sync required.');
                        }
                        setIsQuizzing(false);
                      }} 
                    />
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
