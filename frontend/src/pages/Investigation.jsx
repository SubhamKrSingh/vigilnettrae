import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useVigilNetStore from '../store/useVigilNetStore';
import EntityGraph from '../components/EntityGraph';
import CampaignTimeline from '../components/CampaignTimeline';
import ConfidenceGauge from '../components/ConfidenceGauge';
import toast from 'react-hot-toast';

const Investigation = () => {
  const { selectedCampaign, graphData, fetchGraphData, generateIntelPackage } = useVigilNetStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCampaign) {
      fetchGraphData(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  const handleGeneratePackage = async () => {
    if (!selectedCampaign) return;
    toast.loading('Generating intelligence package...', { id: 'pkg' });
    const pkg = await generateIntelPackage(selectedCampaign.id);
    toast.success('Package generated!', { id: 'pkg' });
    navigate('/packages');
  };

  if (!selectedCampaign) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <p>Select a campaign from the dashboard to investigate</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedCampaign.campaign_type}</h2>
          <p className="text-muted">{selectedCampaign.location}</p>
        </div>
        <button
          onClick={handleGeneratePackage}
          className="bg-blue hover:bg-blue/90 text-white px-6 py-3 rounded-xl font-medium"
        >
          Generate Intelligence Package
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="col-span-2">
          <h3 className="font-bold mb-4">Entity Relationship Graph</h3>
          <div className="h-[500px]">
            <EntityGraph graphData={graphData} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex justify-center mb-4">
              <ConfidenceGauge value={selectedCampaign.confidence} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-muted text-xs">SIM Count</p>
                <p className="font-bold text-teal">{selectedCampaign.sim_count}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Account Count</p>
                <p className="font-bold text-amber">{selectedCampaign.account_count}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Domain Count</p>
                <p className="font-bold text-coral">{selectedCampaign.domain_count}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Lead Time</p>
                <p className="font-bold text-purple">{selectedCampaign.lead_time_hours}h</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted">Evidence</h4>
              {graphData?.features && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Geo Concentration</span>
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-teal" style={{ width: `${graphData.features.geo_concentration * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Graph Density</span>
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-purple" style={{ width: `${graphData.features.graph_density * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clustering Coeff</span>
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-amber" style={{ width: `${(graphData.features.clustering_coefficient || 0) * 100}%` }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <CampaignTimeline timeline={selectedCampaign.timeline} />
        </div>
      </div>
    </div>
  );
};

export default Investigation;
