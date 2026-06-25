import React from 'react';
import { useNavigate } from 'react-router-dom';
import useVigilNetStore from '../store/useVigilNetStore';
import ConfidenceGauge from './ConfidenceGauge';
import { motion } from 'framer-motion';

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

  const handleInvestigate = () => {
    selectCampaign(campaign);
    navigate('/investigation');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all ${
        selected ? 'border-blue ring-2 ring-blue/30' : 'border-border hover:border-border/80'
      } ${isType7 ? 'relative overflow-hidden' : ''}`}
      onClick={() => selectCampaign(campaign)}
    >
      {isType7 && (
        <div className="absolute -top-1 -right-1 bg-blue text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
          LIVE
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
              isType7 ? 'bg-blue/20 text-blue' : 'bg-purple/20 text-purple'
            }`}>
              TYPE {typeCode}
            </span>
            {isType7 && <span className="w-2 h-2 bg-blue rounded-full animate-pulse" />}
          </div>
          <h3 className="font-bold text-lg">{typeLabel}</h3>
          <p className="text-muted text-sm">{campaign.location}</p>
        </div>
        <ConfidenceGauge value={campaign.confidence} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-muted text-xs">SIMs</p>
          <p className="font-bold">{campaign.sim_count}</p>
        </div>
        <div>
          <p className="text-muted text-xs">Accounts</p>
          <p className="font-bold">{campaign.account_count}</p>
        </div>
        <div>
          <p className="text-muted text-xs">Lead Time</p>
          <p className="font-bold">{campaign.lead_time_hours}h</p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleInvestigate();
        }}
        className="w-full bg-blue hover:bg-blue/90 text-white py-2.5 rounded-xl font-medium transition-all"
      >
        Investigate
      </button>
    </motion.div>
  );
};

export default CampaignAlertCard;
