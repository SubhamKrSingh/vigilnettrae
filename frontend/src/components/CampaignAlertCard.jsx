import React from 'react';
import { useNavigate } from 'react-router-dom';
import useVigilNetStore from '../store/useVigilNetStore';
import ConfidenceGauge from './ConfidenceGauge';

const CampaignAlertCard = ({ campaign, selected }) => {
    const navigate = useNavigate();
    const { selectCampaign } = useVigilNetStore();

    // Get the full type string safely
    const typeLabel = campaign.campaign_type
        || campaign.type_name
        || campaign.campaign_type_name
        || `Type ${campaign.type_code}`
        || 'Unknown type';

    const typeCode = campaign.type_code
        || campaign.campaign_type_code
        || campaign.id?.match(/\d+/)?.[0]
        || '?';

    const isType7 = typeCode === 7 || typeLabel.includes('Type 7');
    const isLive = campaign.is_demo || campaign.status === 'live';

    const handleInvestigate = () => {
        selectCampaign(campaign);
        navigate('/investigation');
    };

    return (
        <div
            className={`bg-card border rounded-xl p-4 flex flex-col gap-3 relative transition-all ${selected ? 'border-blue shadow-lg' : 'border-border'} ${isLive ? 'campaign-card-live' : ''}`}
            style={{
                borderColor: isLive ? '#D85A30' : (selected ? '#2B7FE8' : '#252830'),
                boxShadow: isLive ? '0 0 20px rgba(216, 90, 48, 0.15)' : (selected ? '0 4px 12px rgba(43, 127, 232, 0.15)' : 'none')
            }}
            onClick={() => selectCampaign(campaign)}
        >
            {isLive && (
                <div style={{
                    position: 'absolute',
                    top: 12, right: 12,
                    background: '#D85A30',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    letterSpacing: '0.08em',
                    animation: 'livePulse 1.5s ease-in-out infinite'
                }}>
                    LIVE
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isType7 ? 'bg-blue/20 text-blue' : 'bg-purple/20 text-purple'}`}>
                    TYPE {typeCode}
                </span>
            </div>

            <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                    {typeLabel}
                </h3>
                <p className="text-muted text-xs mt-0.5">{campaign.location}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="grid grid-cols-3 gap-x-4">
                    <div>
                        <p className="text-muted text-xs">SIMs</p>
                        <p className="text-teal font-semibold text-sm">{campaign.sim_count}</p>
                    </div>
                    <div>
                        <p className="text-muted text-xs">Accounts</p>
                        <p className="text-amber font-semibold text-sm">{campaign.account_count}</p>
                    </div>
                    <div>
                        <p className="text-muted text-xs">Lead Time</p>
                        <p className="text-purple font-semibold text-sm">{campaign.lead_time_hours}h</p>
                    </div>
                </div>
                <ConfidenceGauge value={campaign.confidence ?? 0} size={60} />
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleInvestigate();
                }}
                className="w-full bg-blue hover:bg-blue/90 text-white py-2.5 rounded-xl font-medium transition-all mt-1"
            >
                Investigate →
            </button>
        </div>
    );
};

export default CampaignAlertCard;
