import React, { useRef } from 'react';
import useVigilNetStore from '../store/useVigilNetStore';
import { Play, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMapRef } from '../context/MapContext';

const Navbar = () => {
    const { isSimulating, runSimulation } = useVigilNetStore();
    const { mapRef } = useMapRef();
    const navigate = useNavigate();
    const hasRun = useRef(false);

    const handleRunDemo = async () => {
        if (isSimulating) return;
        hasRun.current = true;

        // Phase 1: Button shows loading
        toast.loading('Scanning for emerging campaigns…', { id: 'demo' });

        // Artificial suspense: 1.8s before result
        await new Promise(r => setTimeout(r, 1800));

        try {
            const campaign = await runSimulation();

            // Phase 2: Alert toast
            toast.success(
                `🔴 NEW CAMPAIGN DETECTED\nType 7 · ${campaign.location}\nConfidence: ${Math.round(campaign.confidence * 100)}% · Lead time: ${campaign.lead_time_hours}h`,
                {
                    id: 'demo',
                    duration: 7000,
                    style: {
                        background: '#1A0D0D',
                        border: '1px solid #D85A30',
                        color: '#E8E6E0',
                        fontSize: 13,
                        maxWidth: 380,
                        whiteSpace: 'pre-line',
                    },
                    iconTheme: { primary: '#D85A30', secondary: '#1A0D0D' },
                }
            );

            // Phase 3: Navigate to dashboard if not already there
            navigate('/');

            // Phase 4: Pan map to new city after short delay
            setTimeout(() => {
                if (mapRef?.current) {
                    mapRef.current.flyTo(
                        [campaign.lat, campaign.lng],
                        8,
                        { duration: 2.0, easeLinearity: 0.3 }
                    );
                }
            }, 600);

        } catch (err) {
            toast.error('Simulation failed', { id: 'demo' });
        }
    };

    return (
        <div className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold">Predictive Fraud Intelligence</h1>
                <p className="text-muted text-sm">Detect campaigns before they strike</p>
            </div>
            <button
                onClick={handleRunDemo}
                disabled={isSimulating}
                className="flex items-center gap-2 bg-blue hover:bg-blue/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
            >
                {isSimulating
                    ? <><Loader size={15} className="animate-spin" /> Detecting…</>
                    : <><Play size={15} /> Run Demo</>
                }
            </button>
        </div>
    );
};

export default Navbar;
