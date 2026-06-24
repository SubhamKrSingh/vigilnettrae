import React from 'react';
import { motion } from 'framer-motion';

const ConfidenceGauge = ({ value }) => {
  const percentage = (value || 0) * 100;
  const color = percentage >= 80 ? 'text-coral' : percentage >= 60 ? 'text-amber' : 'text-teal';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#252830"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke={percentage >= 80 ? '#D85A30' : percentage >= 60 ? '#E09B20' : '#1DB87A'}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: value || 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-muted text-sm mt-2">Confidence</p>
    </div>
  );
};

export default ConfidenceGauge;
