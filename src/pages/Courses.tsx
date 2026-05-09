import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Award, Clock, Star, Zap, ChevronRight, 
  Search, Filter, AlertCircle, Check, ArrowRight, 
  Loader2, ShieldAlert, Plus, Play, X, ShieldCheck 
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
      alert('Insufficient Balance: Please top up your main wallet to enroll.');
      return;
    }

    setIsEnrolling(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(doc(db, 'users', user.uid));
        if (!userDoc.exists()) throw new Error("User profile not found");

        const userBalances = userDoc.data().balances || {};
        const activeCourses = userDoc.data().activeCourses || [];

        if (activeCourses.includes(course.id)) throw new Error("Already enrolled in this course");

        transaction.update(doc(db, 'users', user.uid), {
          'balances.main': userBalances.main - course.price,
          activeCourses: [...activeCourses, course.id]
        });

        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          userId: user.uid,
          userName: userData.displayName,
          type: 'course_purchase',
          title: `Enrolled: ${course.title}`,
          amount: -course.price,
          status: 'settled',
          createdAt: serverTimestamp()
        });
      });

      await refreshUserData();
      setSelectedCourse(course);
      alert('Successfully enrolled!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans">
      {/* Header */}
      <header className="p-10 bg-slate-900 text-white rounded-b-[3.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter">ACADEMY <span className="text-cyan-400">PRO</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Neural Asset Education Portal</p>
          </div>

          <div className="relative group max-w-xl">
             <div className="absolute inset-0 bg-cyan-500/10 blur-xl group-focus-within:bg-cyan-500/20 transition-all rounded-[2rem]" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter Curriculum Modules..."
              className="w-full bg-white/5 border border-white/10 p-6 pl-16 rounded-[2rem] font-bold text-sm focus:outline-none focus:ring-1 ring-cyan-500/30 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, i) => {
            const isActive = userData?.activeCourses?.includes(course.id);
            const isCompleted = userData?.completedCourses?.includes(course.id);

            return (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 overflow-hidden flex flex-col shadow-2xl shadow-slate-950/5 group hover:border-cyan-500/30 transition-all"
              >
                <div className="h-56 relative overflow-hidden">
                  <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
                  <div className="absolute top-6 right-6 bg-slate-950/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
                    <p className="text-xl font-black italic tracking-tight text-white line-through decoration-cyan-400/50 text-opacity-40 text-xs mb-0.5">₦{(course.price * 1.5).toLocaleString()}</p>
                    <p className="text-2xl font-black italic tracking-tight text-white">₦{course.price.toLocaleString()}</p>
                  </div>
                  {isCompleted && (
                    <div className="absolute inset-0 bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                       <div className="space-y-2">
                          <ShieldCheck size={48} className="mx-auto text-white" />
                          <div className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-xs tracking-widest">VERIFIED COMPLETED</div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 flex flex-col gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] px-3 py-1 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full border border-cyan-500/20">{course.category || 'General'}</span>
                      <div className="flex items-center gap-1.5 p-1 px-2 border border-slate-100 dark:border-slate-800 rounded-lg">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-black">{course.rating || '4.9'}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black leading-tight italic tracking-tighter group-hover:text-cyan-400 transition-colors uppercase">{course.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                  </div>

                  <div className="mt-auto space-y-8">
                    <div className="grid grid-cols-2 gap-6 pb-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Terminal Yield</p>
                        <p className="text-xl font-black italic tracking-tight text-emerald-500">₦{(course.price * 3.5).toLocaleString()}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Network Load</p>
                        <p className="text-xl font-black italic tracking-tight">{(course.members || 1240).toLocaleString()}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => isCompleted ? setSelectedCourse(course) : (isActive ? setSelectedCourse(course) : enrollInCourse(course))}
                      disabled={isEnrolling}
                      className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                        isActive 
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl' 
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent active:scale-[0.98]'
                      }`}
                    >
                      {isEnrolling ? <Loader2 className="animate-spin" size={20} /> : (isActive ? (<><Play size={18} fill="currentColor" /> Access Module</>) : 'Initialize Enrollment')}
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md"
          >
             <motion.div 
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-t-[3rem] md:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedCourse.category}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCourse(null); setIsQuizzing(false); }} 
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                  {!isQuizzing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <section className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Module Content</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCourse.description}</p>
                        </section>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(selectedCourse.articles || []).map((art: any, i: number) => (
                            <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center font-black">{i+1}</div>
                              <h5 className="font-bold text-sm leading-tight group-hover:text-indigo-600 transition-colors uppercase">{art.title}</h5>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-8 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-600/20 space-y-6">
                            <div className="flex items-center gap-3">
                              <Award size={24} />
                              <h4 className="font-bold">Final Assessment</h4>
                            </div>
                            <p className="text-xs text-indigo-100 leading-relaxed">
                              Pass the certification quiz with at least 80% to unlock your reward of ₦{(selectedCourse.price * 3.5).toLocaleString()}.
                            </p>
                            <button 
                              onClick={() => setIsQuizzing(true)}
                              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
                            >
                              Take Quiz
                            </button>
                         </div>

                         <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center gap-3">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Enrollment Status</p>
                            <div className="flex gap-1 w-full px-4">
                               {[...Array(6)].map((_, i) => (
                                 <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 4 ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-900/50'}`} />
                               ))}
                            </div>
                            <p className="text-[10px] font-bold text-emerald-600">4 of 6 Lessons Completed</p>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto w-full pb-12">
                      <Quiz 
                        courseId={selectedCourse.id} 
                        courseTitle={selectedCourse.title}
                        rewardGoal={selectedCourse.price ? selectedCourse.price * 0.1 : 500}
                        questions={selectedCourse.questions || []}
                        onCancel={() => setSelectedCourse(null)}
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
                                  title: `Certification Reward: ${selectedCourse.title}`,
                                  amount: selectedCourse.price * 3.5,
                                  status: 'settled',
                                  createdAt: serverTimestamp()
                                });
                              });
                              await refreshUserData();
                              alert(`Congratulations! You passed. Reward of ₦${(selectedCourse.price * 3.5).toLocaleString()} has been added to your referral vault.`);
                            } catch(e) {
                              console.error(e);
                            }
                          } else if(!pass) {
                             alert('Failed: You need at least 80% to pass. Please review the course and try again.');
                          }
                          setIsQuizzing(false);
                        }} 
                      />
                    </div>
                  )}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

