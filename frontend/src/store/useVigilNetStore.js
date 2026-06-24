import { create } from 'zustand';
import api from '../api/client';

const useVigilNetStore = create((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  graphData: null,
  intelPackage: null,
  isSimulating: false,
  metrics: null,

  fetchCampaigns: async () => {
    const response = await api.get('/api/campaigns');
    set({ campaigns: response.data.data });
    if (response.data.data.length > 0 && !get().selectedCampaign) {
      set({ selectedCampaign: response.data.data[0] });
    }
  },

  selectCampaign: (campaign) => set({ selectedCampaign: campaign }),

  fetchGraphData: async (campaignId) => {
    const response = await api.get(`/api/graph/${campaignId}`);
    set({ graphData: response.data.data });
  },

  generateIntelPackage: async (campaignId) => {
    const response = await api.post(`/api/intelligence/generate/${campaignId}`);
    set({ intelPackage: response.data.data });
    return response.data.data;
  },

  runSimulation: async () => {
    set({ isSimulating: true });
    const response = await api.post('/api/simulation/run');
    set({ isSimulating: false });
    return response.data.data;
  },

  fetchMetrics: async () => {
    const response = await api.get('/api/simulation/metrics');
    set({ metrics: response.data.data });
  },
}));

export default useVigilNetStore;
