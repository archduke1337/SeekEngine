'use client'

import { motion } from 'framer-motion'

export default function LivingIcon({ 
  color = 'bg-blue-500', 
  className = '',
  size = 'w-2 h-2'
}: { 
  color?: string
  className?: string
  size?: string 
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Core breathing layer */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-full ${color} blur-sm`}
      />
      
      {/* Secondary Pulse */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
        className={`absolute inset-0 rounded-full ${color}`}
      />

      {/* Solid Center */}
      <div className={`relative ${size} ${color} rounded-full shadow-lg`} />
    </div>
  )
}
