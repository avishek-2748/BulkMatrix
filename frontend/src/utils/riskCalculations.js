export const calculateRiskSeverity = (riskScore) => {
  if (riskScore >= 80) return 'HIGH';
  if (riskScore >= 50) return 'MEDIUM';
  return 'LOW';
};

export const getRiskColor = (severity) => {
  switch (severity) {
    case 'HIGH':
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    case 'MEDIUM':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'LOW':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    default:
      return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
};
