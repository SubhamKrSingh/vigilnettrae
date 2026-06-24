import React, { useEffect } from 'react';
import useVigilNetStore from '../store/useVigilNetStore';
import MetricCards from '../components/MetricCards';
import CampaignMap from '../components/CampaignMap';
import CampaignAlertCard from '../components/CampaignAlertCard';

const Dashboard = () => {
  const { campaigns, selectedCampaign, fetchCampaigns, fetchMetrics, metrics } = useVigilNetStore();

  useEffect(() => {
    fetchCampaigns();
    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <MetricCards metrics={metrics} />

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-[500px]">
        <div className="col-span-2">
          <div className="h-full">
            <h3 className="font-bold text-lg mb-4">Campaign Map</h3>
            <CampaignMap />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Active Campaigns</h3>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {campaigns.map((campaign) => (
              <CampaignAlertCard
                key={campaign.id}
                campaign={campaign}
                selected={selectedCampaign?.id === campaign.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
