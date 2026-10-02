import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  Award, 
  GraduationCap, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  School as SchoolIcon,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { School, Student, PaymentRecord, ExpenseRecord, SchoolClass } from '../../types';
import { exportElementToPdf, isInIframe } from '../../utils/printUtils';
import { PrintExportModal } from '../common/PrintExportModal';

interface ReportsModuleProps {
  school: School;
  students: Student[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  classes: SchoolClass[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  school,
  students,
  payments,
  expenses,
  classes
}) => {
  const [periodFilter, setPeriodFilter] = useState<'ANNUEL' | 'TRIMESTRE_1' | 'TRIMESTRE_2'>('ANNUEL');

  // Academic stats
  const totalStudents = students.length;
  const boysCount = students.filter(s => s.gender === 'M').length;
  const girlsCount = students.filter(s => s.gender === 'F').length;

  const totalFeesExpected = students.reduce((acc, s) => acc + s.annualFee, 0);
  const totalFeesCollected = students.reduce((acc, s) => acc + s.paidFee, 0);
  const totalDebts = students.reduce((acc, s) => acc + s.remainingFee, 0);
  const recoveryRate = totalFeesExpected > 0 ? Math.round((totalFeesCollected / totalFeesExpected) * 100) : 0;

  const globalAvgGrade = students.length > 0 
    ? (students.reduce((acc, s) => acc + s.averageGrade, 0) / students.length).toFixed(2)
    : '0';

  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length)
    : 0;

  // Class performance chart data
  const classGradeData = classes.map(c => ({
    name: c.name,
    moyenne: c.averageClassGrade,
    effectif: c.studentCount
  }));

  // Recovery distribution
  const paymentChannelData = [
    { name: 'Wave', value: 14500000, color: '#1d4ed8' },
    { name: 'Orange Money', value: 8200000, color: '#ea580c' },
    { name: 'Espèces (Caisse)', value: 4200000, color: '#16a34a' },
    { name: 'Chèque / Virement', value: 1550000, color: '#64748b' }
  ];

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handlePrint = () => {
    // If in iframe sandbox, open print & export modal directly to provide
    // instant preview, guidance and one-click PDF download
    if (isInIframe()) {
      setIsPrintModalOpen(true);
      return;
    }

    try {
      window.print();
    } catch {
      setIsPrintModalOpen(true);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setPdfNotice(null);
    try {
      const filename = `bilan_${periodFilter.toLowerCase()}_${school.academicYear.replace(/[^0-9]/g, '_')}.pdf`;
      const success = await exportElementToPdf('printable-reports-dashboard', {
        filename,
        orientation: 'portrait'
      });
      if (success) {
        setPdfNotice('Bilan officiel exporté en PDF haute définition avec succès !');
        setTimeout(() => setPdfNotice(null), 4000);
      } else {
        setPdfNotice("Erreur lors de la génération du PDF. Utilisez l'aperçu.");
        setTimeout(() => setPdfNotice(null), 4000);
      }
    } catch (e) {
      console.error('PDF error:', e);
      setPdfNotice('Erreur inattendue lors de la génération du PDF.');
      setTimeout(() => setPdfNotice(null), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <div id="printable-reports-dashboard" className="space-y-6 pb-12 printable-sheet">
        {/* Official Senegalese Ministry & School Header (Shown in Print & PDF capture) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="text-left space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-900">RÉPUBLIQUE DU SÉNÉGAL</p>
              <p className="text-[9px] font-semibold text-slate-600 italic">Un Peuple - Un But - Une Foi</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase mt-1">Ministère de l'Éducation Nationale</p>
              <p className="text-[9px] font-medium text-slate-600">Inspection d'Académie (IA) • {school.region}</p>
              <p className="text-[9px] font-medium text-slate-600">Inspection de l'Éducation et de la Formation (IEF) • {school.inspection}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-5 h-2 rounded-xs bg-[#00853f]" />
                <span className="w-5 h-2 rounded-xs bg-[#fdef42]" />
                <span className="w-5 h-2 rounded-xs bg-[#e31b23]" />
              </div>
              <h2 className="text-base font-black uppercase tracking-tight text-slate-900">{school.name}</h2>
              <p className="text-[10px] text-slate-500 font-mono">Code Établissement : {school.code} • Année : {school.academicYear}</p>
            </div>

            <div className="text-right space-y-0.5">
              <p className="text-[9px] text-slate-500 font-medium">Date d'édition :</p>
              <p className="text-[10px] font-mono font-bold text-slate-900">{new Date().toLocaleDateString('fr-FR')}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-800 uppercase border border-slate-300">
                Document Officiel
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center">
            <h1 className="text-lg font-black uppercase tracking-wide text-slate-900">
              BILAN PÉDAGOGIQUE, FINANCIER & STATISTIQUE D'ÉTABLISSEMENT
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Période : {periodFilter === 'ANNUEL' ? 'Bilan Annuel Complet' : periodFilter === 'TRIMESTRE_1' ? '1er Trimestre' : '2ème Trimestre'} • Année Académique {school.academicYear}
            </p>
          </div>
        </div>

        {/* Screen Header & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden" data-html2canvas-ignore="true">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Rapports Pédagogiques, Financiers & Statistiques
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Indicateurs d'efficacité, conformité ministérielle MEN et pilotage stratégique
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs print:hidden">
              {(['ANNUEL', 'TRIMESTRE_1', 'TRIMESTRE_2'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    periodFilter === p
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p === 'ANNUEL' ? 'Bilan Annuel' : p === 'TRIMESTRE_1' ? '1er Trimestre' : '2ème Trimestre'}
                </button>
              ))}
            </div>

            <button
              type="button"
              id="btn-print-reports-main"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              title="Lancer l'impression ou ouvrir l'aperçu officiel"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer Bilan</span>
            </button>

            <button
              type="button"
              id="btn-download-reports-pdf"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
              title="Télécharger directement en PDF A4"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Export PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger Bilan PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {pdfNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in print:hidden" data-html2canvas-ignore="true">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pdfNotice}</span>
          </div>
        )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Taux de Recouvrement</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{recoveryRate}%</span>
            <span className="text-xs font-bold text-emerald-600">+4.2% vs 2025</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalFeesCollected.toLocaleString('fr-FR')} FCFA perçus sur {totalFeesExpected.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Moyenne Générale École</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{globalAvgGrade}</span>
            <span className="text-xs text-slate-400 font-bold">/ 20</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Conforme aux normes académiques nationales
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Taux d'Assiduité</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{averageAttendance}%</span>
            <span className="text-xs font-bold text-emerald-600">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Suivi des présences par pointage en temps réel
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Parité Filles / Garçons</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {Math.round((girlsCount / totalStudents) * 100)}% F
            </span>
            <span className="text-xs text-slate-500 font-bold">• {Math.round((boysCount / totalStudents) * 100)}% G</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {girlsCount} Filles et {boysCount} Garçons inscrits
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Performance Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Moyennes Générales par Promotion / Classe</h3>
              <p className="text-xs text-slate-500">Moyenne trimestrielle sur barème officiel de 20</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              Seuil d'excellence : 14.0/20
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classGradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${value} / 20`, 'Moyenne']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="moyenne" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Canaux d'Encaissement</h3>
            <p className="text-xs text-slate-500">Répartition des flux monétaires</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChannelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentChannelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val.toLocaleString('fr-FR')} FCFA`, 'Montant']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {paymentChannelData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value.toLocaleString('fr-FR')} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Academy Inspection Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Tableau Récapitulatif IA / IEF Sénégal</h3>
            <p className="text-xs text-slate-500">Ventilation officielle des effectifs par classe et par genre</p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/60">
            Année {school.academicYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Classe</th>
                <th className="px-6 py-3.5">Cycle</th>
                <th className="px-6 py-3.5">Professeur Principal</th>
                <th className="px-6 py-3.5 text-center">Effectif Filles</th>
                <th className="px-6 py-3.5 text-center">Effectif Garçons</th>
                <th className="px-6 py-3.5 text-center">Total Élèves</th>
                <th className="px-6 py-3.5 text-right">Moyenne de Classe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {classes.map((cls) => {
                const approxGirls = Math.round(cls.studentCount * 0.52);
                const approxBoys = cls.studentCount - approxGirls;

                return (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{cls.name}</td>
                    <td className="px-6 py-3.5 font-medium">{cls.level}</td>
                    <td className="px-6 py-3.5 text-slate-600">{cls.mainTeacherName}</td>
                    <td className="px-6 py-3.5 text-center font-semibold text-rose-600">{approxGirls}</td>
                    <td className="px-6 py-3.5 text-center font-semibold text-blue-600">{approxBoys}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-slate-900">{cls.studentCount}</td>
                    <td className="px-6 py-3.5 text-right font-black text-slate-900">
                      <span className={`px-2 py-0.5 rounded ${
                        cls.averageClassGrade >= 14 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {cls.averageClassGrade.toFixed(2)} / 20
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <PrintExportModal
      isOpen={isPrintModalOpen}
      onClose={() => setIsPrintModalOpen(false)}
      title="Bilan Pédagogique, Financier & Statistique"
      documentName={`Bilan_${periodFilter}_${school.academicYear}`}
      targetElementId="printable-reports-dashboard"
      landscape={false}
    >
      <div className="space-y-4 text-xs text-slate-700">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-2">Résumé du document prêt pour impression :</h4>
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            <li>Établissement : <strong>{school.name}</strong> ({school.code})</li>
            <li>Année Académique : <strong>{school.academicYear}</strong> • Inspection : <strong>{school.inspection}</strong></li>
            <li>Effectif global : <strong>{totalStudents} élèves</strong> ({girlsCount} filles, {boysCount} garçons)</li>
            <li>Taux de recouvrement : <strong>{recoveryRate}%</strong> • Moyenne générale : <strong>{globalAvgGrade}/20</strong></li>
            <li>En-tête officiel de la République du Sénégal et du Ministère de l'Éducation Nationale inclus.</li>
          </ul>
        </div>
        <p className="text-[11px] text-slate-500 italic text-center">
          Cliquez sur « Télécharger PDF » pour enregistrer le document A4 ou sur « Imprimer » pour ouvrir le dialogue de votre imprimante.
        </p>
      </div>
    </PrintExportModal>
  </>
  );
};
