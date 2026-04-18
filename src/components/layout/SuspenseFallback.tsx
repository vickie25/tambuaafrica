import React from "react";

const SuspenseFallback = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Invisible, instant loader - no visual delay */}
      <div className="w-0 h-0 overflow-hidden" />
    </div>
  );
};

export default SuspenseFallback;
