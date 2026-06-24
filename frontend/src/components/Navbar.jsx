import React from 'react';
import useVigilNetStore from '../store/useVigilNetStore';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { runSimulation, fetchCampaigns } = useVigilNetStore();
  const navigate = useNavigate();

  const handleRunDemo = async () => {
    toast.loading('Running simulation...', { id: 'demo' });
    await new Promise(res => setTimeout(res, 2000));
    await runSimulation();
    toast.success('New campaign detected!', { id: 'demo' });
    fetchCampaigns();
    navigate('/');
  };

  return (
    <div className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">Predictive Fraud Intelligence</h1>
        <p className="text-muted text-sm">Detect campaigns before they strike</p>
      </div>
      <button
        onClick={handleRunDemo}
        className="flex items-center gap-2 bg-blue hover:bg-blue/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
      >
        <Play className="w-4 h-4 fill-current" />
        Run Demo
      </button>
    </div>
  );
};

export default Navbar;
