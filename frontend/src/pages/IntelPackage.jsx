import React, { useState } from 'react';
import useVigilNetStore from '../store/useVigilNetStore';
import { Shield, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const IntelPackage = () => {
  const { intelPackage, selectedCampaign } = useVigilNetStore();
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatch = () => {
    setIsDispatching(true);
    toast.loading('Dispatching intervention...', { id: 'dispatch' });
    setTimeout(() => {
      setIsDispatching(false);
      toast.success('Package sent! 3 banks notified, TRAI flagged, 400 citizens protected, ₹60 crore protected!', { id: 'dispatch', duration: 5000 });
    }, 2000);
  };

  if (!intelPackage) {
    return (
      <div className="p-6 flex items-center justify-center h-full text-muted">
        <p>No intelligence package generated yet. Generate one from the investigation page!</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intelligence Package</h2>
          <p className="text-muted">{intelPackage.id}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDispatch}
            disabled={isDispatching}
            className="bg-coral hover:bg-coral/90 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Dispatch Intervention
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-sm">Confidence</p>
          <p className="text-3xl font-bold text-coral">{(selectedCampaign?.confidence ? (selectedCampaign.confidence * 100).toFixed(0) : 0)}%</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-sm">Lead Time</p>
          <p className="text-3xl font-bold text-purple">{intelPackage.lead_time_hours}h</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-sm">Est. Victims</p>
          <p className="text-3xl font-bold text-amber">{intelPackage.estimated_victims}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-sm">Financial Exposure</p>
          <p className="text-3xl font-bold text-teal">{intelPackage.financial_exposure}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue" />
            Campaign Summary
          </h3>
          <p className="text-muted">{intelPackage.campaign_summary}</p>
        </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-coral" />
            Evidence Chain
          </h3>
          <div className="space-y-3">
            {intelPackage.evidence_chain?.map((ev, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-surface rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue/20 text-blue flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <div>
                <p className="font-medium">{ev.feature}: {ev.value}</p>
                <p className="text-muted text-sm">{ev.description}</p>
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Legal Pathway</h3>
          <div className="space-y-4">
            <div>
              <p className="text-muted text-sm mb-2">Recommended FIR Sections</p>
              <div className="flex flex-wrap gap-2">
                {intelPackage.legal_pathway?.recommended_fir_sections?.map((sec, i) => (
                  <span key={i} className="px-3 py-1 bg-purple/20 text-purple rounded-lg text-sm">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-muted text-sm mb-1">CDR Scope</p>
              <p className="text-sm">{intelPackage.legal_pathway?.cdr_scope}</p>
            </div>
            <div>
              <p className="text-muted text-sm mb-1">PMLA Scope</p>
              <p className="text-sm">{intelPackage.legal_pathway?.pmla_scope}</p>
            </div>
            <div>
              <p className="text-muted text-sm mb-1">CERT-In Action</p>
              <p className="text-sm">{intelPackage.legal_pathway?.cert_in_action}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button className="bg-card border border-border rounded-2xl p-5 text-center">
          <div className="w-12 h-12 bg-blue/20 text-blue rounded-xl flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <p className="font-medium">Dispatch to I4C</p>
      </button>
        <button className="bg-card border border-border rounded-2xl p-5 text-center">
          <div className="w-12 h-12 bg-purple/20 text-purple rounded-xl flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="font-medium">Flag to TRAI</p>
      </button>
        <button className="bg-card border border-border rounded-2xl p-5 text-center">
          <div className="w-12 h-12 bg-teal/20 text-teal rounded-xl flex items-center justify-center mx-auto mb-3">
          <ArrowRight className="w-6 h-6" />
        </div>
        <p className="font-medium">Alert Banks</p>
      </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Key Entities</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-muted text-sm mb-2">Domains</p>
              <div className="space-y-2">
                {intelPackage.domains?.map((d, i) => (
                  <span key={i} className="block text-sm bg-surface p-2 rounded-lg border border-border">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-muted text-sm mb-2">SIM Ranges</p>
              <div className="space-y-2">
                {intelPackage.sim_ranges?.map((r, i) => (
                  <span key={i} className="block text-sm bg-surface p-2 rounded-lg border border-border">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-muted text-sm mb-2">Account Clusters</p>
              <div className="space-y-2">
                {intelPackage.account_clusters?.map((c, i) => (
                  <span key={i} className="block text-sm bg-surface p-2 rounded-lg border border-border">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default IntelPackage;
