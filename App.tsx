
import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Target,
  CircleDot,
  Settings2
} from 'lucide-react';
import Visualizer from './components/Visualizer';
import { CoordinateState, Axis } from './types';
import { evaluateEquation, validateEquation } from './services/mathSolver';

const App: React.FC = () => {
  const [equation, setEquation] = useState<string>('x^2 + y^2 + z^2 - 1');
  const [coords, setCoords] = useState<CoordinateState>({ x: 1, y: 0, z: 0 });
  const [fValue, setFValue] = useState<number>(0);
  const [activeAxis, setActiveAxis] = useState<Axis | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    const valid = validateEquation(equation);
    setIsValid(valid);
    if (valid) {
      const val = evaluateEquation(equation, coords.x, coords.y, coords.z);
      setFValue(val);
    }
  }, [coords, equation]);

  const handleAxisChange = useCallback((axis: Axis, value: number) => {
    const k = Math.max(-1, Math.min(1, isNaN(value) ? 0 : value));

    setCoords(prev => {
      if (Math.abs(prev[axis] - k) < 0.000001 && !isNaN(value)) return prev;

      const isSphere = equation.replace(/\s+/g, '') === 'x^2+y^2+z^2-1';
      
      if (isSphere) {
        const otherAxes = (['x', 'y', 'z'] as Axis[]).filter(a => a !== axis);
        const a1 = otherAxes[0];
        const a2 = otherAxes[1];
        const currentOtherLenSq = prev[a1] ** 2 + prev[a2] ** 2;
        const targetOtherLenSq = Math.max(0, 1 - k ** 2);
        const targetOtherLen = Math.sqrt(targetOtherLenSq);

        let nextA1, nextA2;
        if (currentOtherLenSq > 0.000001) {
          const ratio = targetOtherLen / Math.sqrt(currentOtherLenSq);
          nextA1 = prev[a1] * ratio;
          nextA2 = prev[a2] * ratio;
        } else {
          nextA1 = targetOtherLen;
          nextA2 = 0;
        }
        return { ...prev, [axis]: k, [a1]: nextA1, [a2]: nextA2 };
      }

      return { ...prev, [axis]: k };
    });
  }, [equation]);

  const resetCoords = () => {
    setActiveAxis(null);
    setCoords({ x: 1, y: 0, z: 0 });
  };

  const renderAxisControl = (axis: Axis, label: string, colorClass: string, activeColor: string) => (
    <div className="group space-y-3 p-3 rounded-2xl transition-all duration-300 hover:bg-white/[0.02]">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className={`px-2 py-0.5 rounded font-bold transition-all ${activeAxis === axis ? activeColor + ' text-white shadow-lg' : colorClass + ' bg-opacity-10'}`}>
          {label} Axis
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="-1"
            max="1"
            step="0.0001"
            value={Number(coords[axis].toFixed(4))}
            onFocus={() => setActiveAxis(axis)}
            onBlur={() => setActiveAxis(null)}
            onChange={(e) => handleAxisChange(axis, parseFloat(e.target.value))}
            className="w-24 bg-slate-900/50 px-3 py-1.5 rounded-lg text-slate-300 border border-white/10 focus:border-cyan-500/50 outline-none text-right appearance-none font-mono transition-all"
          />
        </div>
      </div>
      <input
        type="range"
        min="-1"
        max="1"
        step="0.0001"
        value={coords[axis]}
        onMouseDown={() => setActiveAxis(axis)}
        onMouseUp={() => setActiveAxis(null)}
        onChange={(e) => handleAxisChange(axis, parseFloat(e.target.value))}
        className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer transition-opacity opacity-70 group-hover:opacity-100 accent-${axis === 'x' ? 'red' : axis === 'y' ? 'green' : 'blue'}-500`}
      />
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#020617] text-slate-200">
      <aside className="w-full md:w-80 glass h-full flex flex-col z-20 border-r border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-slate-900/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Equa<span className="text-cyan-400">Viz</span></h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">3D Space Explorer</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> 方程式 f(x,y,z) = 0
            </label>
            <input 
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              className={`w-full bg-slate-800/60 p-3 rounded-xl border font-mono text-sm outline-none transition-all ${isValid ? 'border-white/10 text-cyan-300' : 'border-red-500/50 text-red-400'}`}
              placeholder="e.g. x^2 + y^2 + z^2 - 1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section className="space-y-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
              <Target className="w-3.5 h-3.5" /> 控制中心
            </label>
            <div className="space-y-2">
              {renderAxisControl('x', 'X', 'text-red-400', 'bg-red-500')}
              {renderAxisControl('y', 'Y', 'text-green-400', 'bg-green-500')}
              {renderAxisControl('z', 'Z', 'text-blue-400', 'bg-blue-500')}
            </div>
          </section>

          <div className="px-3 pt-4 border-t border-white/5">
            <button
              onClick={resetCoords}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600/10 to-blue-600/10 hover:from-cyan-600/20 hover:to-blue-600/20 border border-cyan-500/30 text-cyan-500 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Reset View
            </button>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-black tracking-[0.1em]">PRECISION ERROR</span>
            <span className={`font-mono text-[10px] ${Math.abs(fValue) < 0.01 ? 'text-cyan-400' : 'text-red-500'}`}>
              {Math.abs(fValue).toExponential(3)}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,1)]" 
              style={{ width: `${Math.max(0, Math.min(100, (1 - Math.abs(fValue)) * 100))}%` }}
            />
          </div>
        </div>
      </aside>

      <main className="flex-1 relative bg-gradient-to-b from-slate-950 to-black">
        <Visualizer 
          coords={coords} 
          equation={equation} 
          onPointMove={handleAxisChange}
          activeAxis={activeAxis}
        />
      </main>
    </div>
  );
};

export default App;
