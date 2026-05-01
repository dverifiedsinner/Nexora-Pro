import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Building2, 
  Zap, 
  History, 
  AlertCircle,
  Smartphone,
  Wifi,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Wallet() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'fund' | 'withdraw' | 'conversion'>('fund');
  const [conversionType, setConversionType] = React.useState<'airtime' | 'data'>('airtime');
  const [network, setNetwork] = React.useState<string>('MTN');

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
        <div className="z-10">
          <h1 className="text-4xl font-display font-black tracking-tight text-gradient leading-none mb-2">FINANCE HUB.</h1>
          <p className="text-white/30 font-light italic text-xs uppercase tracking-[0.2em]">Asset Management & Liquidation</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md overflow-x-auto z-10">
          {[
            { id: 'fund', label: 'Fuel Node', icon: ArrowDownLeft },
            { id: 'withdraw', label: 'Cash Out', icon: ArrowUpRight },
            { id: 'conversion', label: 'Asset Swap', icon: Smartphone },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-white/20 hover:text-white/60'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-[10px] uppercase tracking-widest leading-none">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute -top-10 -right-20 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full animate-float-slow pointer-events-none"></div>
      </header>

      {/* Main Wallets Overview */}
      <div className="grid md:grid-cols-2 gap-8 perspective-1000">
        <div className="glass-card p-10 bg-gradient-to-br from-cyan-600/20 via-blue-900/40 to-black border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-2xl rotate-3d animate-float group hover:border-cyan-500/30 transition-all duration-700">
           <div className="relative z-10 flex justify-between items-start">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                 <WalletIcon size={28} className="text-cyan-400" />
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-black tracking-[0.3em] text-cyan-400 mb-1">Vault Authority</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Secured</span>
                </div>
              </div>
           </div>
           <div className="relative z-10 pt-8">
              <p className="text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em] italic">Main Liquid Assets</p>
              <h2 className="text-6xl font-display font-black text-white tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">
                ₦{userData?.balances.main.toLocaleString()}
              </h2>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <ArrowUpRight size={14} /> +4.2% Growth
                </div>
              </div>
           </div>
           
           {/* Abstract pattern */}
           <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.1),transparent)] opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { label: 'Bonus Reservoir', value: userData?.balances.bonus, icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Network Yield', value: userData?.balances.referral, icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
          ].map((wallet, i) => (
            <div key={i} className="glass-card p-8 flex items-center justify-between group hover:border-white/20 transition-all border-white/5 animate-float-slow shadow-xl" style={{ animationDelay: `${i * 0.8}s` }}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 ${wallet.bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                  <wallet.icon size={28} className={wallet.color} />
                </div>
                <div>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">{wallet.label}</p>
                  <p className="text-3xl font-display font-black leading-none tracking-tighter group-hover:text-white transition-colors">₦{wallet.value?.toLocaleString()}</p>
                </div>
              </div>
              <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <ArrowUpRight size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="glass-card p-10 md:p-12 border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
            
            {activeTab === 'fund' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-md">
                  <h3 className="text-3xl font-display font-black mb-3 italic uppercase tracking-tight">Fuel Node.</h3>
                  <p className="text-sm text-white/30 font-light leading-relaxed">Deposit capital into your Nexora account to access high-yield assets and curriculum streams.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <button className="flex flex-col items-center gap-8 p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.08] transition-all text-center group active:scale-95">
                    <div className="w-20 h-20 rounded-[2rem] bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl shadow-cyan-500/10">
                      <CreditCard size={32} className="text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">Secure Gateway</h4>
                      <p className="text-[10px] text-white/20 italic uppercase tracking-widest font-black">Instant Transfer Protocol</p>
                    </div>
                  </button>
                  <button className="flex flex-col items-center gap-8 p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.08] transition-all text-center group active:scale-95">
                    <div className="w-20 h-20 rounded-[2rem] bg-pink-500/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-2xl shadow-pink-500/10">
                      <Building2 size={32} className="text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">Direct Audit</h4>
                      <p className="text-[10px] text-white/20 italic uppercase tracking-widest font-black">Manual Node Verification</p>
                    </div>
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em]">Quantum Amount Selector</p>
                    <div className="h-px flex-1 bg-white/5 mx-4"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1000, 5000, 10000].map((amt) => (
                      <button key={amt} className="py-5 px-4 bg-white/5 border border-white/5 rounded-2xl font-display font-black hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:text-cyan-400 transition-all text-sm shadow-xl active:scale-95">
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative group">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-xl group-focus-within:animate-pulse">₦</span>
                    <input 
                      type="number" 
                      placeholder="Custom Entry Amount" 
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-7 pl-16 pr-8 focus:outline-none focus:border-cyan-500 transition-all text-4xl font-display font-black placeholder:text-white/10 placeholder:font-black placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.5em] group-focus-within:bg-white/[0.08]"
                    />
                  </div>
                  <button className="w-full btn-primary py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all">
                    Initiate Funding Chain
                  </button>
                </div>
              </div>
            )}
 
            {activeTab === 'withdraw' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[2rem] flex gap-6 items-center">
                   <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0 shadow-2xl">
                     <AlertCircle size={24} className="text-cyan-400" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Liquidation Protocol</p>
                     <p className="text-sm text-white/50 leading-relaxed font-light italic">
                        Node verification typically concludes within 24-48 standard cycles.
                     </p>
                   </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Source Terminal</label>
                    <div className="relative group">
                      <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-black text-sm uppercase tracking-widest focus:bg-white/[0.08]">
                        <option className="bg-slate-900">Main Yield Reservoir (₦{userData?.balances.main.toLocaleString()})</option>
                        <option className="bg-slate-900">Referral Growth Vault (₦{userData?.balances.referral.toLocaleString()})</option>
                        <option className="bg-slate-900">Bonus Reservoir (₦{userData?.balances.bonus.toLocaleString()})</option>
                        <option className="bg-slate-900">Investment Yields (₦{userData?.balances.investment.toLocaleString()})</option>
                      </select>
                      <ArrowUpRight size={16} className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Liquidation Volatility</label>
                    <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-pink-400 font-black text-xl">₦</span>
                      <input 
                        type="number" 
                        placeholder="MIN 2,000" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 focus:outline-none focus:border-cyan-500 transition-all font-black text-2xl placeholder:text-white/10 placeholder:text-xs placeholder:tracking-[0.2em] focus:bg-white/[0.08]"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">External Settlement Account</label>
                    <div className="grid md:grid-cols-2 gap-6">
                      <input type="text" placeholder="Account Node ID" className="bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-white/10" />
                      <select className="bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-black text-[10px] uppercase tracking-widest">
                        <option className="bg-slate-900">Choose Bank Node</option>
                        <option className="bg-slate-900">ACCESS PROTOCOL</option>
                        <option className="bg-slate-900">KUDA META</option>
                        <option className="bg-slate-900">MONIEPOINT</option>
                        <option className="bg-slate-900">UBA NETWORK</option>
                        <option className="bg-slate-900">ZENITH CORE</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full btn-primary py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all">
                    Execute Vault Outflow
                  </button>
                </div>
              </div>
            )}
 
            {activeTab === 'conversion' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-8">
                   <button 
                     onClick={() => setConversionType('airtime')}
                     className={`p-10 border rounded-[3rem] flex flex-col items-center gap-6 group transition-all active:scale-95 shadow-2xl ${conversionType === 'airtime' ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl border border-white/5 ${conversionType === 'airtime' ? 'bg-cyan-500/20 scale-110 rotate-12' : 'bg-white/5'}`}>
                        <Smartphone size={40} className={conversionType === 'airtime' ? 'text-cyan-400' : 'text-white/20'} />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/60">Airtime Swap</span>
                   </button>
                   <button 
                     onClick={() => setConversionType('data')}
                     className={`p-10 border rounded-[3rem] flex flex-col items-center gap-6 group transition-all active:scale-95 shadow-2xl ${conversionType === 'data' ? 'bg-pink-500/10 border-pink-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl border border-white/5 ${conversionType === 'data' ? 'bg-pink-500/20 scale-110 -rotate-12' : 'bg-white/5'}`}>
                        <Wifi size={40} className={conversionType === 'data' ? 'text-pink-400' : 'text-white/20'} />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/60">Data Stream</span>
                   </button>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Receiver Link</label>
                    <input type="tel" placeholder="080 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-7 px-10 focus:outline-none focus:border-cyan-500 transition-all font-display font-black text-3xl placeholder:text-white/5 tracking-tighter" />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Network Architecture</label>
                    <div className="grid grid-cols-4 gap-4">
                      {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map((n) => (
                        <button key={n} onClick={() => setNetwork(n)} className={`py-4 border rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${network === n ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/60'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {conversionType === 'data' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Data Yield Package</label>
                      <div className="relative group">
                         <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 focus:outline-none focus:border-pink-500 transition-all appearance-none cursor-pointer font-black text-xs uppercase tracking-widest focus:bg-white/[0.08]">
                           <option className="bg-slate-900">1GB - ₦350 (30 DAYS)</option>
                           <option className="bg-slate-900">2GB - ₦650 (30 DAYS)</option>
                           <option className="bg-slate-900">5GB - ₦1,500 (30 DAYS)</option>
                           <option className="bg-slate-900">10GB - ₦2,800 (30 DAYS)</option>
                           <option className="bg-slate-900">25GB - ₦5,500 (30 DAYS)</option>
                         </select>
                         <Wifi size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-pink-500 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {conversionType === 'airtime' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Credit Value</label>
                      <div className="relative group">
                         <span className="absolute left-10 top-1/2 -translate-y-1/2 text-cyan-400 font-display font-black text-xl">₦</span>
                         <input type="number" placeholder="Enter Value" className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-10 focus:outline-none focus:border-cyan-500 transition-all font-display font-black text-2xl placeholder:text-white/10" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Conversion Fuel</label>
                    <div className="relative group">
                      <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-black text-xs uppercase tracking-widest focus:bg-white/[0.08]">
                        <option className="bg-slate-900">MAIN YIELD (₦{userData?.balances.main.toLocaleString()})</option>
                        <option className="bg-slate-900">BONUS RESERVOIR (₦{userData?.balances.bonus.toLocaleString()})</option>
                        <option className="bg-slate-900">INVESTMENT WALLET (₦{userData?.balances.investment.toLocaleString()})</option>
                        <option className="bg-slate-900">REFERRAL VAULT (₦{userData?.balances.referral.toLocaleString()})</option>
                      </select>
                      <Zap size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <button className="w-full btn-primary py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all">
                    Initiate Asset Conversion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xl font-display font-black italic uppercase tracking-widest flex items-center gap-4">
                <div className="h-0.5 w-10 bg-cyan-500 rounded-full"></div> Ledger
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-400 transition-all">DEEP AUDIT</button>
            </div>
            <div className="glass-card p-3 space-y-2 border-white/5 shadow-2xl">
              {[
                { type: 'funding', title: 'NODE FUELING', amount: 2000, time: '3 CYCLES AGO', status: 'VERIFIED' },
                { type: 'withdrawal', title: 'LIQUIDATION', amount: -5000, time: '1 WEEK AGO', status: 'SETTLED' },
                { type: 'referral', title: 'NETWORK GROWTH', amount: 500, time: '2 WEEKS AGO', status: 'BONDED' },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.03] rounded-[2rem] transition-all cursor-pointer group active:scale-[0.98] border border-transparent hover:border-white/5">
                  <div className="flex gap-5 items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all ${t.amount > 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-pink-500/10 text-pink-500'}`}>
                       {t.amount > 0 ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">{t.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[9px] text-white/20 font-black uppercase italic">{t.time}</p>
                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                        <p className="text-[8px] text-cyan-400/60 font-black uppercase tracking-[0.2em]">{t.status}</p>
                      </div>
                    </div>
                  </div>
                  <p className={`text-xl font-display font-black ${t.amount > 0 ? 'text-cyan-400' : 'text-pink-500'}`}>
                    {t.amount > 0 ? '+' : '-'}₦{Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="glass-card p-10 border-white/5 bg-gradient-to-br from-cyan-900/40 via-black to-black shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.1),transparent)] group-hover:opacity-100 transition-opacity"></div>
             <div className="w-16 h-16 rounded-[2.5rem] bg-cyan-500 shadow-2xl shadow-cyan-500/40 flex items-center justify-center mb-8 relative z-10 animate-float">
               <Zap size={32} className="text-white fill-white" />
             </div>
             <h4 className="font-display font-black text-2xl mb-4 italic uppercase tracking-tight relative z-10">Maximizer <br /> Protocol.</h4>
             <p className="text-sm text-white/40 leading-relaxed font-light italic relative z-10">
               Leverage your <b>Bonus Reservoir</b> for instant Airtime Swap once you hit the ₦2,000 baseline. Network growth accelerates liquidity.
             </p>
             <div className="mt-8 relative z-10">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-4">75% to Next Unlock</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
