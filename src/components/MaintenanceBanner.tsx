/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Globe2, Eye, Lock, Check } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';

interface MaintenanceBannerProps {
  onOpenAdmin: () => void;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ onOpenAdmin }) => {
  const [justTurnedLive, setJustTurnedLive] = useState(false);

  const handleTurnLive = () => {
    maintenanceService.setMaintenanceMode(false);
    setJustTurnedLive(true);
    setTimeout(() => setJustTurnedLive(false), 4000);
  };

  return (
    <div className="bg-[#B45309] text-white px-4 py-2 text-xs font-medium sticky top-0 z-50 shadow-md flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-200"></span>
        </span>
        <span className="font-semibold tracking-wide uppercase">
          Maintenance / Test Mode Active:
        </span>
        <span className="text-amber-100 hidden sm:inline">
          Public visitors see the Maintenance screen. You are in authorized preview mode.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAdmin}
          className="bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded transition flex items-center gap-1.5"
        >
          <Lock className="w-3 h-3 text-amber-200" />
          <span>Admin Controls</span>
        </button>

        <button
          onClick={handleTurnLive}
          className="bg-white hover:bg-amber-50 text-[#B45309] font-bold px-3 py-1 rounded transition shadow-sm flex items-center gap-1"
        >
          {justTurnedLive ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live!</span>
            </>
          ) : (
            <>
              <Globe2 className="w-3.5 h-3.5" />
              <span>Make Site Live</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
