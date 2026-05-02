import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Award, Info, ArrowRight, Zap, Trophy } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  courseId: string;
  courseTitle: string;
  rewardGoal: number;
  questions: Question[];
  onComplete: (finalEarning: number) => void;
  onCancel: () => void;
}

export default function Quiz({ courseId, courseTitle, rewardGoal, questions, onComplete, onCancel }: QuizProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'learning' | 'quiz' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealingResult, setIsRevealingResult] = useState(false);

  const earningsPerQuestion = rewardGoal / questions.length;
  const penaltyPerWrong = 0; // Removed penalty to ensure 3.5x ROI as requested

  const handleNextStep = () => {
    if (currentStep === 'intro') setCurrentStep('learning');
    else if (currentStep === 'learning') setCurrentStep('quiz');
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === questions[currentQuestionIdx].correctAnswer;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = selectedOption;
    setAnswers(newAnswers);

    if (isCorrect) {
      setCurrentEarnings(prev => Math.min(rewardGoal, prev + earningsPerQuestion));
    } else {
      setCurrentEarnings(prev => Math.max(0, prev - penaltyPerWrong));
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setCurrentStep('result');
      setIsRevealingResult(true);
      // Ensure full 3.5x reward is granted on completion
      setCurrentEarnings(rewardGoal);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onCancel}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-2xl glass-card overflow-hidden bg-[#0a0f1d] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      >
        {/* Progress Bar */}
        {currentStep === 'quiz' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
               className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
               initial={{ width: 0 }}
               animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {currentStep === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400/10 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    <Zap size={12} className="fill-cyan-400" /> Assessment Active
                  </div>
                  <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-none">
                    {courseTitle} Module.
                  </h2>
                  <p className="text-white/40 font-light italic leading-relaxed">
                    You are about to initiate the learning-to-earn sequence. Study the curriculum provided in the next step carefully. Your earnings strictly correlate with your accuracy in the final audit.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Max Yield</p>
                      <p className="text-2xl font-display font-black text-cyan-400 italic">₦{rewardGoal.toLocaleString()}</p>
                   </div>
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Risk Dynamic</p>
                      <p className="text-2xl font-display font-black text-pink-500 italic">VARIABLE</p>
                   </div>
                </div>

                <button onClick={handleNextStep} className="w-full btn-primary py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">
                  Access Curriculum
                </button>
              </motion.div>
            )}

            {currentStep === 'learning' && (
              <motion.div 
                key="learning"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                   <h3 className="text-2xl font-display font-black italic uppercase tracking-tight text-white/90">Curriculum Content</h3>
                   <div className="glass-card p-6 bg-white/[0.02] border-white/5 max-h-64 overflow-y-auto custom-scrollbar">
                      <div className="prose prose-invert prose-sm">
                         <p className="text-white/60 leading-relaxed font-light italic">
                            Digital ecosystems thrive on architectural distribution. In this module, we analyze the core mechanics of decentralized liquidity and how information flow dictates asset valuation.
                            <br /><br />
                            <b>Core Principle 1:</b> Information asymmetry is the primary driver of arbitrage. By reducing this asymmetry through standardized educational modules, users can unlock higher-tier reward pools.
                            <br /><br />
                            <b>Core Principle 2:</b> Network density directly correlates with yield sustainability. Every node (user) added to the NEXORA mesh increases the global reward baseline.
                            <br /><br />
                            <b>Audit Preparation:</b> Pay attention to the specific ratios of yield distribution mentioned in the NEXORA whitepaper (simulated). The default referral commission is anchored at 25% of any immediate investment.
                         </p>
                      </div>
                   </div>
                </div>
                
                <button onClick={handleNextStep} className="w-full btn-primary py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Initiate Audit <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {currentStep === 'quiz' && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</p>
                      <h4 className="text-xl font-display font-black tracking-tight leading-tight max-w-md">{questions[currentQuestionIdx].text}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Live Yield</p>
                      <p className="text-2xl font-display font-black text-cyan-400 italic">₦{Math.round(currentEarnings).toLocaleString()}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   {questions[currentQuestionIdx].options.map((option, idx) => (
                     <button
                       key={idx}
                       onClick={() => setSelectedOption(idx)}
                       className={`w-full p-5 rounded-2xl text-left transition-all border flex items-center justify-between group active:scale-[0.98] ${
                         selectedOption === idx 
                           ? 'bg-cyan-500/10 border-cyan-500/50 text-white' 
                           : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05] hover:border-white/10'
                       }`}
                     >
                       <span className="text-sm font-medium tracking-tight uppercase italic">{option}</span>
                       <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                         selectedOption === idx ? 'border-cyan-400 bg-cyan-400' : 'border-white/10'
                       }`}>
                         {selectedOption === idx && <Check size={14} className="text-[#0a0f1d] font-bold" />}
                       </div>
                     </button>
                   ))}
                </div>

                <button 
                  disabled={selectedOption === null}
                  onClick={handleAnswerSubmit}
                  className={`w-full py-5 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-2xl flex items-center justify-center gap-3 ${
                    selectedOption !== null 
                      ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20 active:scale-95' 
                      : 'bg-white/5 text-white/10 cursor-not-allowed'
                  }`}
                >
                  Confirm Choice <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {currentStep === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10"
              >
                <div className="relative inline-block">
                   <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] animate-pulse-glow rounded-full"></div>
                   <motion.div 
                     initial={{ rotate: -180, scale: 0 }}
                     animate={{ rotate: 0, scale: 1 }}
                     transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                     className="w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[2.5rem] border-4 border-white/10 flex items-center justify-center shadow-2xl relative z-10 mx-auto"
                   >
                      <Trophy size={80} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                   </motion.div>
                </div>

                <div className="space-y-4">
                   <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none animate-pulse">Jackpot!</h2>
                   <p className="text-white/40 font-light italic">Assessment concluded. Your computational accuracy yielded a reward of:</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 border border-white/10 p-10 rounded-[3rem] inline-block min-w-[300px]"
                >
                   <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4">Total Earning</p>
                   <p className="text-6xl font-display font-black tracking-tighter text-white">₦{Math.round(currentEarnings).toLocaleString()}</p>
                </motion.div>

                <div className="pt-6">
                   <button 
                     onClick={() => onComplete(currentEarnings)}
                     className="btn-primary py-5 px-16 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/40 active:scale-95 transition-all"
                   >
                     Claim & Exit
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
