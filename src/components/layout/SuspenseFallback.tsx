import React from "react";

const SuspenseFallback = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center">
        <img 
          src="/tambua-logo.png" 
          alt="Tambua Africa" 
          className="w-24 h-24 object-contain animate-pulse opacity-20"
        />
        <div className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-accent w-1/3 animate-[shimmer_2s_infinite_ease-in-out]" />
        </div>
      </div>
    </div>
  );
};

export default SuspenseFallback;
