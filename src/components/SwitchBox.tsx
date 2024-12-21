import React from 'react';

export default function SwitchBox() {
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex items-center p-4 border-b">
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          电器设备状态智能体诊断
        </h1>
        <span className="text-gray-600 ml-auto">
          版本: Demo
        </span>
      </div>
      <div className="flex-1 relative p-4 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/assets/switch_box.png" 
            alt="Switch Box Diagram" 
            className="max-w-full max-h-full object-contain"
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
}