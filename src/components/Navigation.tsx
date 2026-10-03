import React from 'react';
import { ScreenType } from '../types';
import { sounds } from '../utils/soundEffects';
import { ASSETS } from '../data/mockData';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  pendingTasksCount?: number;
}

const tabs: { screen: ScreenType; label: string; left: string; width: string }[] = [
  { screen: 'garden', label: 'สวน', left: '0%', width: '20%' },
  { screen: 'missions', label: 'ภารกิจ', left: '20%', width: '18%' },
  { screen: 'scanner', label: 'สแกนพืช', left: '38%', width: '24%' },
  { screen: 'timeline', label: 'ไทม์ไลน์', left: '62%', width: '18%' },
  { screen: 'profile', label: 'โปรไฟล์', left: '80%', width: '20%' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => (
  <nav aria-label="แถบการนำทางหลัก" className="garden-navigation absolute bottom-0 left-0 right-0 z-30 select-none">
    <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[150%] overflow-hidden pointer-events-none">
      <img src={ASSETS.gardenPixelArt} alt="" className="absolute bottom-0 w-full h-[476.1905%] object-fill pixelated" />
    </div>
    {tabs.map(tab => {
      const active = currentScreen === tab.screen;
      const scanner = tab.screen === 'scanner';
      return <button key={tab.screen} type="button" aria-label={tab.label} aria-current={active ? 'page' : undefined}
        onClick={() => { sounds.playTap(); onNavigate(tab.screen); }}
        style={{left:tab.left,width:tab.width,top:scanner?'-50%':'0%',height:scanner?'135.7143%':'100%'}}
        className={`absolute cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-[-4px] ${scanner?'rounded-full hover:bg-white/5 active:bg-white/10':'hover:bg-white/10 active:bg-white/20'}`}>
        <span className="sr-only">{tab.label}</span>
        {active && !scanner && <span aria-hidden="true" className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300" />}
      </button>;
    })}
  </nav>
);
