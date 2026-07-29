import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function NotSavedBoard({
  setOpenBoardNotSavedInterface,
}: {
  setOpenBoardNotSavedInterface: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
      </div>

      {/* Header */}
      <h2 className="text-lg font-semibold text-[#101820] text-center mb-2">
        Board Not Saved
      </h2>

      {/* Message */}
      <p className="text-sm text-zinc-500 text-center mb-6">
        Your board needs to be saved before going live. Please save your
        changes and try again.
      </p>

      {/* Action */}
      <button
        onClick={() => setOpenBoardNotSavedInterface(false)}
        className="w-full py-2.5 rounded-full font-medium bg-[#7C6FF0] text-white hover:bg-[#6a5de0] transition-colors"
      >
        Got it
      </button>
    </div>
  )
}