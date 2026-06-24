import React from 'react';

const MetricCards = ({ metrics }) => {
  const cards = [
    { label: 'Campaigns Detected', value: metrics?.campaigns_detected || 0, color: 'blue' },
    { label: 'Entities Mapped', value: metrics?.entities_mapped || 0, color: 'teal' },
    { label: 'Avg Confidence', value: `${((metrics?.avg_confidence || 0) * 100).toFixed(0)}%`, color: 'purple' },
    { label: 'Avg Lead Time', value: `${metrics?.lead_time_avg || 0}h`, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-sm mb-1">{card.label}</p>
          <p className={`text-3xl font-bold text-${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
