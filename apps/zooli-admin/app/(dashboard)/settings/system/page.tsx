import { Monitor } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center mb-4 shadow-sm">
        <Monitor size={28} className="text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">System Management</h2>
      <p className="text-gray-400 text-sm max-w-xs">Monitor system health, API status, logs, and background job queues.</p>
      <div className="mt-6 inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold px-4 py-2 rounded-full">
        🚧 Coming in next sprint
      </div>
    </div>
  );
}
