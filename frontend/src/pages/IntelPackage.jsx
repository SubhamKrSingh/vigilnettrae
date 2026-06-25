import React, { useState } from 'react';
import useVigilNetStore from '../store/useVigilNetStore';
import { Shield, AlertTriangle, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const IntelPackage = () => {
  const { intelPackage, selectedCampaign } = useVigilNetStore();
  const [dispatched, setDispatched] = useState({i4c: false, trai: false, banks: false});

  const handleDispatchI4C = async () => {
    toast.loading('Transmitting to I4C portal...', { id: 'i4c' });
    await new Promise(r => setTimeout(r, 2000));
    toast.success(
      `Intelligence package dispatched to I4C\nCase ref: ${intelPackage.id}`,
      { id: 'i4c', duration: 5000 }
    );
    setDispatched(d => ({...d, i4c: true}));
  };

  const handleFlagTRAI = async () => {
    toast.loading('Sending SIM range flag to TRAI...', { id: 'trai' });
    await new Promise(r => setTimeout(r, 1500));
    toast.success(
      `TRAI notified – ${intelPackage.sim_ranges?.length || 0} SIM ranges flagged for monitoring`,
      { id: 'trai', duration: 5000 }
    );
    setDispatched(d => ({...d, trai: true}));
  };

  const handleAlertBanks = async () => {
    toast.loading('Alerting partner banks...', { id: 'banks' });
    await new Promise(r => setTimeout(r, 1800));
    const banks = ['HDFC', 'ICICI', 'Axis', 'SBI', 'Kotak'];
    const relevant = banks.slice(0, Math.floor(Math.random() * 3) + 2);
    toast.success(
      `${relevant.join(', ')} notified – mule account clusters flagged`,
      { id: 'banks', duration: 5000 }
    );
    setDispatched(d => ({...d, banks: true}));
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
        <button
            onClick={handleDispatchI4C}
            disabled={dispatched.i4c}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
                dispatched.i4c
                    ? 'bg-teal/10 border-teal text-teal'
                    : 'bg-card border-border hover:border-blue cursor-pointer'
            }`}
        >
          {dispatched.i4c ? <CheckCircle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          <p className="font-medium">{dispatched.i4c ? 'Dispatched ✓' : 'Dispatch to I4C'}</p>
        </button>
        <button
            onClick={handleFlagTRAI}
            disabled={dispatched.trai}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
                dispatched.trai
                    ? 'bg-amber/10 border-amber text-amber'
                    : 'bg-card border-border hover:border-amber cursor-pointer'
            }`}
        >
          {dispatched.trai ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          <p className="font-medium">{dispatched.trai ? 'Flagged ✓' : 'Flag to TRAI'}</p>
        </button>
        <button
            onClick={handleAlertBanks}
            disabled={dispatched.banks}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
                dispatched.banks
                    ? 'bg-teal/10 border-teal text-teal'
                    : 'bg-card border-border hover:border-teal cursor-pointer'
            }`}
        >
          {dispatched.banks ? <CheckCircle className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
          <p className="font-medium">{dispatched.banks ? 'Banks Alerted ✓' : 'Alert Banks'}</p>
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
