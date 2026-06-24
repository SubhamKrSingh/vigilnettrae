import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart } from 'recharts';

const CampaignTimeline = ({ timeline }) => {
  const data = timeline?.map(item => ({
    time: item.time,
    label: item.event,
  })) || [];

  return (
    <div className="bg-card rounded-2xl border border-border p-5 h-48">
      <h4 className="font-bold mb-3">Campaign Timeline</h4>
      <ResponsiveContainer width="100%" height="80%">
        <ScatterChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252830" />
          <XAxis
            dataKey="time"
            type="number"
            domain={[-100, 10]}
            tickCount={6}
            stroke="#888780"
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{ backgroundColor: '#191C24', border: '1px solid #252830', borderRadius: '8px' }}
            itemStyle={{ color: '#E8E6E0' }}
            labelStyle={{ color: '#888780' }}
          />
          <ReferenceLine x={0} stroke="#D85A30" strokeWidth={2} label={{ position: 'top', value: 'Victim Contact', fill: '#D85A30', fontSize: 12 }} />
          <Scatter data={data} fill="#1DB87A">
            {data.map((entry, index) => (
              <circle key={`dot-${index}`} cx={0} cy={0} r={6} fill="#1DB87A" />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CampaignTimeline;
