import { create } from 'zustand';
import api from '../api/client';

const useVigilNetStore = create((set, get) => ({
    campaigns: [],
    selectedCampaign: null,
    graphData: null,
    intelPackage: null,
    isSimulating: false,
    metrics: null,
    demoResult: null,

    fetchCampaigns: async () => {
        const response = await api.get('/api/campaigns');
        const campaignsWithLatLng = response.data.data.map(c => ({
            ...c,
            lat: c.lat ?? c.center_lat,
            lng: c.lng ?? c.center_lng
        }));
        set({ campaigns: campaignsWithLatLng });
        if (campaignsWithLatLng.length > 0 && !get().selectedCampaign) {
            set({ selectedCampaign: campaignsWithLatLng[0] });
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
        const { fetchCampaigns, fetchMetrics } = get();
        set({ isSimulating: true, demoResult: null });
        try {
            const res = await api.post('/api/simulation/run');
            const newCampaign = res.data.data;
            set({ demoResult: newCampaign });
            await fetchCampaigns();
            await fetchMetrics();
            return newCampaign;
        } finally {
            set({ isSimulating: false });
        }
    },

    fetchMetrics: async () => {
        const response = await api.get('/api/simulation/metrics');
        set({ metrics: response.data.data });
    },
}));

export default useVigilNetStore;
