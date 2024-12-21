import React, { useState } from 'react';
import NavBar from './navigation/NavBar';
import MainArea from './MainArea';
import MatrixChat from './MatrixChat';
import ProfileSettings from './settings/ProfileSettings';
import { MainAreaState } from '../types/navigation';

export default function FrameLayout() {
  const [activeView, setActiveView] = useState<'chat' | 'tools' | 'settings'>('chat');
  const [mainAreaState] = useState<MainAreaState>({
    type: 'welcome'
  });
  const [showContacts, setShowContacts] = useState(true);
  const [showChatArea, setShowChatArea] = useState(true);
  const [showFrame, setShowFrame] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50">
      <NavBar 
        activeView={activeView}
        onViewChange={setActiveView}
        showContacts={showContacts}
        showChatArea={showChatArea}
        showFrame={showFrame}
        onToggleContacts={() => setShowContacts(!showContacts)}
        onToggleChatArea={() => setShowChatArea(!showChatArea)}
        onToggleFrame={() => setShowFrame(!showFrame)}
      />

      <div className="flex-1 ml-16">
        <div className="h-full">
          <div className={activeView === 'chat' ? 'block h-full' : 'hidden h-full'}>
            <MatrixChat 
              showContacts={showContacts}
              showChatArea={showChatArea}
              showFrame={showFrame}
            />
          </div>
          <div className={activeView === 'tools' ? 'block h-full' : 'hidden h-full'}>
            <MainArea state={mainAreaState} />
          </div>
          <div className={activeView === 'settings' ? 'block h-full' : 'hidden h-full'}>
            <ProfileSettings />
          </div>
        </div>
      </div>
    </div>
  );
}