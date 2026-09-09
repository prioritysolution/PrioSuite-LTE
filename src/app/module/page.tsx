"use client";

import { ModuleContainer } from "@/container/module";

export default function ModulePage() {
  return (
    <div className="min-h-full bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Module Route Page
        </h1>
        <ModuleContainer />
      </div>
    </div>
  );
}
