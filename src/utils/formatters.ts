export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('fr-SN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function getGradeBadgeClass(score: number): string {
  if (score >= 16) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score >= 12) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (score >= 10) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

export function getAttendanceBadgeClass(status: string): string {
  switch (status) {
    case 'PRESENT':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'ABSENT':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'RETARD':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'JUSTIFIE':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}
