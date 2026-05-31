import { useState } from 'react';
import { useSystemStore } from '../store/useSystemStore';
import { User, Ruler, Weight, ShieldAlert, Moon, Zap, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { OnboardingData } from '../types';

export const LandingPage = () => {
  const { completeOnboarding } = useSystemStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    height: 170,
    weight: 70,
    build: 'Average',
    exerciseFrequency: '1–2 days',
    conditions: [],
    sleepHours: 7,
    stressLevel: 3,
  });

  const calculatePhysicalIndex = () => {
    // BMI Formula: kg / m^2
    const heightInMeters = (formData.height || 170) / 100;
    const bmi = (formData.weight || 70) / (heightInMeters * heightInMeters);
    
    let index = 1.0;

    // BMI Scaling
    if (bmi < 18.5) index *= 0.7; // Underweight: Lower difficulty
    if (bmi > 25 && bmi < 30) index *= 1.2; // Overweight: Slightly higher
    if (bmi >= 30) index *= 1.5; // Obese: Higher difficulty for movement

    // Build Scaling
    if (formData.build === 'High Body Fat') index *= 0.8;
    if (formData.build === 'Athletic & High Muscle') index *= 1.3;

    // Frequency Scaling
    if (formData.exerciseFrequency === '0 days') index *= 0.6;
    if (formData.exerciseFrequency === '3–4 days') index *= 1.2;
    if (formData.exerciseFrequency === '5+ days') index *= 1.5;

    // Conditions: Lower difficulty if chronic pain exists
    if (formData.conditions && formData.conditions.length > 0) {
      index *= 0.7;
    }

    return { bmi: parseFloat(bmi.toFixed(1)), physicalIndex: parseFloat(index.toFixed(2)) };
  };

  const handleNext = () => {
    if (step === 0 && !name.trim()) return;
    setStep(step + 1);
  };

  const handleFinish = async () => {
    const { bmi, physicalIndex } = calculatePhysicalIndex();
    const finalData: OnboardingData = {
      ...formData as any,
      bmi,
      physicalIndex,
    };
    await completeOnboarding(finalData, name);
  };

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCondition = (condition: string) => {
    const current = formData.conditions || [];
    if (current.includes(condition)) {
      updateField('conditions', current.filter(c => c !== condition));
    } else {
      updateField('conditions', [...current, condition]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Initialize Core Sync</h2>
              <p className="text-gray-500 text-sm font-mono tracking-widest">[SYSTEM ACCESS: REQUIRES IDENTIFICATION]</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-ethereal-blue group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                placeholder="ENTER USERNAME..."
                className="w-full bg-monolith border-2 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-black tracking-[0.2em] focus:border-ethereal-blue focus:shadow-[0_0_20px_rgba(0,210,255,0.2)] transition-all outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">1. Height & Weight (The Core Formula)</h2>
              <p className="text-xs text-gray-500 font-mono tracking-tighter">CALIBRATING MASS-VOLUME MATRICES...</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center">
                  <Ruler size={12} className="mr-2 text-ethereal-blue" /> Height (cm)
                </label>
                <input
                  type="number"
                  className="w-full bg-monolith border border-white/5 rounded-lg p-3 text-white focus:border-ethereal-blue outline-none"
                  value={formData.height}
                  onChange={(e) => updateField('height', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center">
                  <Weight size={12} className="mr-2 text-ethereal-blue" /> Weight (kg)
                </label>
                <input
                  type="number"
                  className="w-full bg-monolith border border-white/5 rounded-lg p-3 text-white focus:border-ethereal-blue outline-none"
                  value={formData.weight}
                  onChange={(e) => updateField('weight', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">2. Body Composition (The Muscularity Filter)</h2>
              <p className="text-xs text-gray-500 font-mono tracking-tighter">ANALYZING STRUCTURAL DENSITY...</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select your physical build:</p>
              {['High Body Fat', 'Average', 'Athletic & High Muscle'].map((b) => (
                <button
                  key={b}
                  onClick={() => updateField('build', b)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-black text-xs tracking-widest uppercase ${
                    formData.build === b 
                      ? 'border-ethereal-blue bg-ethereal-blue/10 text-white' 
                      : 'border-white/5 bg-monolith text-gray-500 hover:border-white/20'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">3. Baseline Conditioning (The Difficulty Anchor)</h2>
              <p className="text-xs text-gray-500 font-mono tracking-tighter">DETERMINING CURRENT LOAD TOLERANCE...</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase">Training Frequency (Days/Week):</p>
                <div className="grid grid-cols-2 gap-2">
                  {['0 days', '1–2 days', '3–4 days', '5+ days'].map((f) => (
                    <button
                      key={f}
                      onClick={() => updateField('exerciseFrequency', f)}
                      className={`p-3 rounded-lg border transition-all font-black text-[10px] uppercase ${
                        formData.exerciseFrequency === f 
                          ? 'border-ethereal-blue bg-ethereal-blue/10 text-white' 
                          : 'border-white/5 bg-monolith text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase flex items-center">
                  <ShieldAlert size={12} className="mr-2 text-system-alert" /> Structural Discomfort / Conditions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['Knee sensitivity', 'Lower back pain', 'Cardiovascular restrictions', 'None'].map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCondition(c)}
                      className={`p-3 rounded-lg border transition-all font-black text-[10px] uppercase ${
                        formData.conditions?.includes(c) 
                          ? 'border-system-alert bg-system-alert/10 text-white' 
                          : 'border-white/5 bg-monolith text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">4. Lifestyle Recovery (The Holistic Baseline)</h2>
              <p className="text-xs text-gray-500 font-mono tracking-tighter">CALCULATING RECOVERY VELOCITY...</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center">
                  <Moon size={12} className="mr-2 text-ethereal-blue" /> Average Sleep (Hours)
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  className="w-full accent-ethereal-blue"
                  value={formData.sleepHours}
                  onChange={(e) => updateField('sleepHours', parseFloat(e.target.value))}
                />
                <div className="flex justify-between font-mono text-[10px] text-gray-500">
                  <span>4H</span>
                  <span className="text-ethereal-blue font-black">{formData.sleepHours}H</span>
                  <span>12H</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center">
                  <Zap size={12} className="mr-2 text-necrotic-purple" /> Daily Stress / Fatigue Level
                </label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateField('stressLevel', s)}
                      className={`flex-1 p-3 rounded-lg border transition-all font-black ${
                        formData.stressLevel === s 
                          ? 'border-necrotic-purple bg-necrotic-purple/10 text-white' 
                          : 'border-white/5 bg-monolith text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const { bmi, physicalIndex } = calculatePhysicalIndex();
        return (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700 text-center">
            <div className="w-20 h-20 bg-ethereal-blue/10 border-2 border-ethereal-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
               <CheckCircle2 size={40} className="text-ethereal-blue" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">Calibration Complete</h2>
              <p className="text-sm text-gray-500 font-mono tracking-widest">PREPARING USER SECTOR: {name.toUpperCase()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 bg-white/5">
                <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Body Mass Index</p>
                <p className="text-2xl font-black text-ethereal-blue font-mono">{bmi}</p>
              </div>
              <div className="glass-panel p-4 bg-white/5">
                <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Difficulty Scalar</p>
                <p className="text-2xl font-black text-necrotic-purple font-mono">x{physicalIndex}</p>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-mono leading-relaxed italic">
              "System directives scaled based on structural integrity. Welcome to the Awakening, Hunter."
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-monolith flex items-center justify-center p-6">
      <div className="scanline absolute inset-0 opacity-20 pointer-events-none" />
      
      <div className="max-w-md w-full glass-panel p-10 relative overflow-hidden border-2 border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ethereal-blue to-necrotic-purple" />
        
        <div className="mb-10 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1 transition-all duration-500 rounded-full ${
                  s <= step ? (s === 5 ? 'w-4 bg-green-500' : 'w-4 bg-ethereal-blue') : 'w-2 bg-white/10'
                }`} 
              />
            ))}
          </div>
        </div>

        {renderStep()}

        <div className="mt-10 flex justify-between gap-4">
          {step > 0 && step < 5 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-4 rounded-xl font-black text-[10px] text-gray-500 hover:text-white transition-colors flex items-center uppercase tracking-widest"
            >
              <ChevronLeft size={16} className="mr-2" /> Back
            </button>
          )}
          
          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={step === 0 && !name.trim()}
              className="flex-1 bg-white text-monolith px-6 py-4 rounded-xl font-black text-[10px] hover:bg-ethereal-blue hover:text-white transition-all duration-300 flex items-center justify-center uppercase tracking-[0.2em] disabled:opacity-20"
            >
              Next Directive <ChevronRight size={16} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-ethereal-blue to-necrotic-purple text-white px-6 py-8 rounded-xl font-black text-xs hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] transition-all duration-500 flex items-center justify-center uppercase tracking-[0.3em] animate-pulse"
            >
              Enter System Grid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
