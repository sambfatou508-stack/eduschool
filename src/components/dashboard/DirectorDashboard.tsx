import React from 'react';
import { DirectorCalendarWidget } from './DirectorCalendarWidget';
import { 
  Users, 
  GraduationCap, 
  School, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  AlertCircle, 
  UserPlus, 
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Send,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { formatFCFA } from '../../utils/formatters';

interface DirectorDashboardProps {
  onNavigate: (tabId: string) => void;
  onOpenQuickAction: (actionName: string) => void;
}

const enrollmentData = [
  { month: 'Juil', inscriptions: 110 },
  { month: 'Août', inscriptions: 245 },
  { month: 'Sept', inscriptions: 680 },
  { month: 'Oct', inscriptions: 810 },
  { month: 'Nov', inscriptions: 842 },
];

const revenueData = [
  { month: 'Sept', encaisse: 4200000, impaye: 950000 },
  { month: 'Oct', encaisse: 3850000, impaye: 1250000 },
  { month: 'Nov', encaisse: 3600000, impaye: 1400000 },
  { month: 'Déc', encaisse: 2900000, impaye: 1800000 },
];

const levelDistribution = [
  { name: 'Élémentaire', count: 320, color: '#3B82F6' },
  { name: 'Collège', count: 342, color: '#10B981' },
  { name: 'Lycée', count: 180, color: '#8B5CF6' },
];

const attendanceWeekly = [
  { day: 'Lun', taux: 96 },
  { day: 'Mar', taux: 94 },
  { day: 'Mer', taux: 95 },
  { day: 'Jeu', taux: 92 },
  { day: 'Ven', taux: 94 },
];

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  onNavigate,
  onOpenQuickAction
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Année Scolaire 2026-2027
            </span>
            <span className="text-xs text-slate-400">Dernière mise à jour: Aujourd'hui 08h30</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight text-white">
            Tableau de Bord de Direction Générale
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Vue consolidée en temps réel des effectifs, de la trésorerie scolaire en FCFA et de l'assiduité.
          </p>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="action-inscrire-eleve"
            onClick={() => onNavigate('inscriptions')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Inscrire Élève</span>
          </button>
          <button
            id="action-nouveau-paiement"
            onClick={() => onNavigate('paiements')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>+ Encaisser (Wave/OM)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Directeur Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Élèves */}
        <div 
          onClick={() => onNavigate('eleves')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Élèves</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">842</p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +32 nouvelles inscriptions ce mois
          </p>
        </div>

        {/* Enseignants & Classes */}
        <div 
          onClick={() => onNavigate('enseignants')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Enseignants & Pédagogie</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">47</p>
            <span className="text-xs text-slate-500">profs</span>
            <span className="text-slate-300">|</span>
            <span className="text-base font-bold text-slate-800">28 classes</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">100% emplois du temps assignés</p>
        </div>

        {/* Présence du jour */}
        <div 
          onClick={() => onNavigate('presences')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Présence du Jour</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">94 %</p>
          <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
            <span className="text-rose-600 font-semibold">27 absents</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">12 retards</span>
          </p>
        </div>

        {/* Trésorerie Encaissée */}
        <div 
          onClick={() => onNavigate('paiements')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Encaissé (Mois)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-blue-700">
            {formatFCFA(3850000)}
          </p>
          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Impayé en cours: {formatFCFA(1250000)}
          </p>
        </div>
      </div>

      {/* Alertes Section & Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Alerts (Section Alertes) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Alertes & Situations Urgentes
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              4 actions requises
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Alerte 1 */}
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">12 élèves ont des impayés majeurs (&gt; 2 mois)</p>
                  <p className="text-xs text-slate-500">Montant total estimé en retard : 680 000 FCFA</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('impayes')}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Relancer les parents
              </button>
            </div>

            {/* Alerte 2 */}
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">8 élèves ont dépassé le seuil de 5 absences</p>
                  <p className="text-xs text-slate-500">Risque de décrochage scolaire en 6ème A et Terminale S2</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('presences')}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                Vérifier les fiches
              </button>
            </div>

            {/* Alerte 3 */}
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">3 classes n'ont pas encore publié leurs notes</p>
                  <p className="text-xs text-slate-500">Français 5ème A, SVT 4ème A, Philosophie Terminale</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Rappeler aux profs
              </button>
            </div>

            {/* Alerte 4 */}
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">5 enseignants n'ont pas encore rempli l'appel ce matin</p>
                  <p className="text-xs text-slate-500">Créneau de 08h00 : Bâtiment Collège</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('communication')}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                Envoyer notification
              </button>
            </div>
          </div>
        </div>

        {/* Actions Rapides Menu */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-3 border-b border-slate-100">
              Actions Rapides Directeur
            </h2>
            <div className="grid grid-cols-1 gap-2.5 mt-3">
              <button
                onClick={() => onNavigate('eleves')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Ajouter un élève</span>
              </button>

              <button
                onClick={() => onNavigate('inscriptions')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <span>Inscrire un nouvel élève</span>
              </button>

              <button
                onClick={() => onNavigate('paiements')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <span>Enregistrer un paiement (Wave / OM)</span>
              </button>

              <button
                onClick={() => onNavigate('notes')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <span>Saisir ou valider les notes</span>
              </button>

              <button
                onClick={() => onNavigate('bulletins')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Générer un bulletin officiel</span>
              </button>

              <button
                onClick={() => onNavigate('communication')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span>Diffuser une notification SMS/App</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier Scolaire & Échéances Officielles (Sénégal) */}
      <DirectorCalendarWidget onNavigateToCalendar={() => onNavigate('calendrier')} />

      {/* Visual Analytics Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des Inscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Évolution des Inscriptions</h3>
              <p className="text-xs text-slate-500">Progression continue vers l'objectif de 850 élèves</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              842 / 850 (99%)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInscr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} élèves`, 'Inscrits']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="inscriptions" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorInscr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution des Paiements & Impayés en FCFA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Paiements Encaissés vs Impayés</h3>
              <p className="text-xs text-slate-500">Flux financiers mensuels en FCFA</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Encaissé
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Impayé
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatFCFA(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="encaisse" name="Encaissé" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="impaye" name="Impayé" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par Niveau */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Répartition des Élèves par Niveau</h3>
          <p className="text-xs text-slate-500 mb-4">Cycles Élémentaire, Collège et Lycée</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val} élèves`, 'Effectif']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 w-full sm:w-auto flex-1">
              {levelDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{item.count} élèves</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assiduité Hebdomadaire */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Taux de Présence Hebdomadaire</h3>
              <p className="text-xs text-slate-500">Moyenne établissement : 94%</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
              Objectif &gt; 90%
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} %`, 'Taux de présence']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="taux" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
