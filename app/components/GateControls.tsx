'use client';

import { GateType } from '../types';

interface GateControlsProps {
  gateStatus: Record<GateType, boolean>;
  onToggleGate: (gateType: GateType) => void;
}

export default function GateControls({ gateStatus, onToggleGate }: GateControlsProps) {
  const gates: Array<{ type: GateType; symbol: string; colorClass: string; name: string }> = [
    { type: 'gateA', symbol: '$', colorClass: 'bg-emerald-500 hover:bg-emerald-600', name: 'Gate A' },
    { type: 'gateB', symbol: '%', colorClass: 'bg-cyan-500 hover:bg-cyan-600', name: 'Gate B' },
    { type: 'gateC', symbol: '&', colorClass: 'bg-fuchsia-500 hover:bg-fuchsia-600', name: 'Gate C' },
    { type: 'gateD', symbol: '@', colorClass: 'bg-indigo-500 hover:bg-indigo-600', name: 'Gate D' },
    { type: 'gateE', symbol: '?', colorClass: 'bg-rose-500 hover:bg-rose-600', name: 'Gate E' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Gate Controls</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {gates.map(gate => (
          <button
            key={gate.type}
            onClick={() => onToggleGate(gate.type)}
            className={`
              ${gate.colorClass} 
              text-white font-bold py-2 px-3 rounded transition-colors duration-200
              border-2 ${gateStatus[gate.type] ? 'border-green-300' : 'border-gray-300'}
              flex flex-col items-center min-h-[70px] justify-center
            `}
            title={`Toggle ${gate.name} (${gate.symbol}) - Currently ${gateStatus[gate.type] ? 'OPEN' : 'CLOSED'}`}
          >
            <span className="text-xl font-mono">{gate.symbol}</span>
            <span className="text-xs mt-1">{gate.name}</span>
            <span className="text-xs font-normal">
              {gateStatus[gate.type] ? 'OPEN' : 'CLOSED'}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-600">
        <p>Click gates to toggle between OPEN (walkable) and CLOSED (blocked) states.</p>
      </div>
    </div>
  );
}