import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex items-center justify-center relative font-sans isolate overflow-hidden">
      {/* Background radial atmosphere & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2315_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2315_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Subtle ambient glows */}
      <div className="absolute top-[20%] left-[-100px] w-[500px] h-[500px] bg-violet-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Dashboard coming soon
        </h1>
      </div>
    </div>
  );
}
