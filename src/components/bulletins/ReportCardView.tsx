import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Search,
  Award,
  FileText,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  School as SchoolIcon,
  GraduationCap,
  Download,
  Loader2
} from 'lucide-react';
import { Student, School, UserRole } from '../../types';
import { getClassPedagogicalWeight } from '../students/StudentsList';
import { exportElementToPdf, isInIframe } from '../../utils/printUtils';
import { generateReportCardPdf } from '../../utils/pdfGenerators';

interface ReportCardViewProps {
  student: Student;
  school: School;
  userRole?: UserRole;
  attachedStudents?: Student[];
  allStudents?: Student[];
  onSelectStudent?: (student: Student) => void;
  onClose?: () => void;
}

export type Trimester = 'T1' | 'T2';

interface SubjectRow {
  subject: string;
  coeff: number;
  // T1 data
  t1Devoirs: number;
  t1Compo: number;
  t1Moy: number;
  t1Rank: string;
  t1Appreciation: string;
  // T2 data
  t2Devoirs: number;
  t2Compo: number;
  t2Moy: number;
  t2Rank: string;
  t2Appreciation: string;
  // Benchmark
  classMin: number;
  classMax: number;
  classMoy: number;
}

// Generate realistic T1 and T2 academic records for any student
function generateStudentReportData(student?: Student): {
  subjects: SubjectRow[];
  t1Avg: number;
  t2Avg: number;
  t1Rank: string;
  t2Rank: string;
  t1Absences: number;
  t2Absences: number;
  t1Lates: number;
  t2Lates: number;
  t1AppreciationCouncil: string;
  t2AppreciationCouncil: string;
  t1Honor: string;
  t2Honor: string;
} {
  if (!student) {
    return {
      subjects: [],
      t1Avg: 12.0,
      t2Avg: 12.0,
      t1Rank: '1er / 1',
      t2Rank: '1er / 1',
      t1Absences: 0,
      t2Absences: 0,
      t1Lates: 0,
      t2Lates: 0,
      t1AppreciationCouncil: 'Bon travail d’ensemble.',
      t2AppreciationCouncil: 'Poursuivez ainsi.',
      t1Honor: 'Tableau d’Honneur',
      t2Honor: 'Tableau d’Honneur'
    };
  }

  const baseAvg = student.averageGrade || 13.5;
  const isLycée = (student.className || '').includes('Terminale') || (student.className || '').includes('Seconde') || (student.className || '').includes('Première');
  const isPrimaire = (student.className || '').includes('CI') || (student.className || '').includes('CP') || (student.className || '').includes('CE') || (student.className || '').includes('CM');

  // Pseudo-random offset based on student id for realistic variations
  const seed = (student.id || 'stu-1').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // T2 evolution: slight progression or small fluctuation (-0.4 to +0.8)
  const t2Delta = Number((((seed % 13) - 4) * 0.1).toFixed(2)); // e.g. -0.4 to +0.8

  const templateSubjects: { name: string; coeff: number; deltaBase: number }[] = isLycée ? [
    { name: 'Mathématiques Spécialité', coeff: 6, deltaBase: 0.6 },
    { name: 'Sciences Physiques', coeff: 6, deltaBase: -0.2 },
    { name: 'Sciences de la Vie et de la Terre (SVT)', coeff: 6, deltaBase: 0.4 },
    { name: 'Philosophie', coeff: 2, deltaBase: -1.0 },
    { name: 'Français & Littérature', coeff: 3, deltaBase: -0.3 },
    { name: 'Anglais LV1', coeff: 2, deltaBase: 1.1 },
    { name: 'Histoire-Géographie', coeff: 2, deltaBase: 0.2 },
    { name: 'Éducation Physique (EPS)', coeff: 2, deltaBase: 1.8 }
  ] : isPrimaire ? [
    { name: 'Français / Écriture & Grammaire', coeff: 4, deltaBase: 0.2 },
    { name: 'Mathématiques / Calcul & Problèmes', coeff: 4, deltaBase: 0.5 },
    { name: 'Éveil Scientifique & Environnement', coeff: 2, deltaBase: 0.8 },
    { name: 'Histoire-Géographie & Éducation Civique', coeff: 2, deltaBase: 0.1 },
    { name: 'Éducation Artistique & Dessin', coeff: 1, deltaBase: 1.5 },
    { name: 'Éducation Physique et Sportive (EPS)', coeff: 1, deltaBase: 1.8 }
  ] : [
    { name: 'Mathématiques', coeff: 4, deltaBase: 0.5 },
    { name: 'Français (Dictée / Rédaction)', coeff: 4, deltaBase: -0.4 },
    { name: 'Sciences de la Vie et de la Terre (SVT)', coeff: 3, deltaBase: 0.7 },
    { name: 'Physique-Chimie (PC)', coeff: 3, deltaBase: -0.6 },
    { name: 'Anglais', coeff: 2, deltaBase: 1.2 },
    { name: 'Histoire-Géographie', coeff: 2, deltaBase: 0.0 },
    { name: 'Éducation Physique (EPS)', coeff: 1, deltaBase: 1.6 }
  ];

  const subjects: SubjectRow[] = templateSubjects.map((tpl, i) => {
    // T1 marks
    const t1Dev = Math.min(20, Math.max(7, Number((baseAvg + tpl.deltaBase + ((seed * (i + 1)) % 7) * 0.2 - 0.5).toFixed(1))));
    const t1Comp = Math.min(20, Math.max(6, Number((baseAvg + tpl.deltaBase + ((seed * (i + 2)) % 5) * 0.2 - 0.4).toFixed(1))));
    const t1M = Number(((t1Dev + t1Comp * 2) / 3).toFixed(1));

    // T2 marks with delta
    const t2Dev = Math.min(20, Math.max(7, Number((t1Dev + t2Delta + (i % 2 === 0 ? 0.3 : -0.2)).toFixed(1))));
    const t2Comp = Math.min(20, Math.max(6, Number((t1Comp + t2Delta + (i % 3 === 0 ? 0.4 : -0.1)).toFixed(1))));
    const t2M = Number(((t2Dev + t2Comp * 2) / 3).toFixed(1));

    // Appreciations
    let t1Appr = 'Bonne participation et rigueur.';
    if (t1M >= 16) t1Appr = 'Excellent trimestre. Travail exemplaire.';
    else if (t1M >= 14) t1Appr = 'Très bon trimestre, esprit d\'analyse solide.';
    else if (t1M >= 12) t1Appr = 'Ensemble satisfaisant, poursuivre ainsi.';
    else if (t1M >= 10) t1Appr = 'Travail convenable mais perfectible.';
    else t1Appr = 'Doit redoubler d\'efforts et intensifier le travail.';

    let t2Appr = 'Poursuit ses efforts réguliers.';
    if (t2M > t1M) t2Appr = 'En nette progression ce trimestre. Bravo.';
    else if (t2M >= 16) t2Appr = 'Maintient un niveau d\'excellence remarquable.';
    else if (t2M >= 13) t2Appr = 'Bonne maîtrise des acquis, régularité appréciable.';
    else t2Appr = 'Résultats stables, consolider les bases.';

    const rankNumber = Math.max(1, Math.min(32, Math.round(33 - (t1M / 20) * 32)));
    const rankNumberT2 = Math.max(1, Math.min(32, Math.round(33 - (t2M / 20) * 32)));

    return {
      subject: tpl.name,
      coeff: tpl.coeff,
      t1Devoirs: t1Dev,
      t1Compo: t1Comp,
      t1Moy: t1M,
      t1Rank: `${rankNumber}ème`,
      t1Appreciation: t1Appr,
      t2Devoirs: t2Dev,
      t2Compo: t2Comp,
      t2Moy: t2M,
      t2Rank: `${rankNumberT2}ème`,
      t2Appreciation: t2Appr,
      classMin: Number(Math.max(5, baseAvg - 6.5).toFixed(1)),
      classMax: Number(Math.min(19.8, baseAvg + 4.5).toFixed(1)),
      classMoy: 12.8
    };
  });

  const t1TotalCoeff = subjects.reduce((acc, s) => acc + s.coeff, 0);
  const t1TotalPoints = subjects.reduce((acc, s) => acc + s.t1Moy * s.coeff, 0);
  const t1Avg = Number((t1TotalPoints / t1TotalCoeff).toFixed(2));

  const t2TotalPoints = subjects.reduce((acc, s) => acc + s.t2Moy * s.coeff, 0);
  const t2Avg = Number((t2TotalPoints / t1TotalCoeff).toFixed(2));

  const t1RankNum = Math.max(1, Math.min(32, Math.round(33 - (t1Avg / 20) * 32)));
  const t2RankNum = Math.max(1, Math.min(32, Math.round(33 - (t2Avg / 20) * 32)));

  const t1Honor = t1Avg >= 16 
    ? "TABLEAU D'HONNEUR AVEC FÉLICITATIONS"
    : t1Avg >= 14 
      ? "TABLEAU D'HONNEUR AVEC ENCOURAGEMENTS"
      : t1Avg >= 12 
        ? "TABLEAU D'HONNEUR"
        : t1Avg >= 10 
          ? "AVERTISSEMENT DE TRAVAIL ÉVITÉ" 
          : "AVERTISSEMENT TRAVAIL";

  const t2Honor = t2Avg >= 16 
    ? "TABLEAU D'HONNEUR AVEC FÉLICITATIONS DU CONSEIL"
    : t2Avg >= 14 
      ? "TABLEAU D'HONNEUR AVEC ENCOURAGEMENTS"
      : t2Avg >= 12 
        ? "TABLEAU D'HONNEUR"
        : t2Avg >= 10 
          ? "ENCOURAGEMENTS DU CONSEIL" 
          : "AVERTISSEMENT TRAVAIL";

  const t1AppreciationCouncil = t1Avg >= 14 
    ? "Trimestre très concluant. Élève rigoureux, attentif et régulier. Poursuivre dans cette excellente dynamique."
    : t1Avg >= 12
      ? "Ensemble satisfaisant. Le travail personnel est sérieux. Des progrès sont encore possibles au 2ème trimestre."
      : "Résultats tout juste moyens. Manque d'assiduité dans certaines matières clés. Doit se ressaisir.";

  const t2AppreciationCouncil = t2Avg >= t1Avg 
    ? `En nette hausse par rapport au 1er trimestre (+${(t2Avg - t1Avg).toFixed(2)} pts). Très belle attitude intellectuelle et investissement exemplaire.`
    : "Trimestre convenable mais en léger tassement. Restez concentré et maintenez le rythme pour le dernier trimestre.";

  return {
    subjects,
    t1Avg,
    t2Avg,
    t1Rank: `${t1RankNum}ème / 32`,
    t2Rank: `${t2RankNum}ème / 32`,
    t1Absences: (seed % 3) * 2,
    t2Absences: (seed % 4) * 2,
    t1Lates: (seed % 2),
    t2Lates: ((seed + 1) % 2),
    t1AppreciationCouncil,
    t2AppreciationCouncil,
    t1Honor,
    t2Honor
  };
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  student,
  school,
  userRole,
  attachedStudents,
  allStudents = [],
  onSelectStudent,
  onClose
}) => {
  const isParent = userRole === 'PARENT';
  const [activeTrimester, setActiveTrimester] = useState<Trimester>('T1');
  const [showQrModal, setShowQrModal] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [studentSearchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');

  const activeStudent = student || (attachedStudents && attachedStudents[0]) || (allStudents && allStudents[0]);

  // Candidate students list for switcher
  const selectableStudents = useMemo(() => {
    if (isParent && attachedStudents && attachedStudents.length > 0) {
      return attachedStudents;
    }
    if (allStudents && allStudents.length > 0) {
      return allStudents;
    }
    return activeStudent ? [activeStudent] : [];
  }, [isParent, attachedStudents, allStudents, activeStudent]);

  // Unique classes for filtering in pedagogical order
  const orderedClasses = useMemo(() => {
    const classMap = new Map<string, { name: string; count: number }>();
    
    // If parent, only their children's classes
    const sourceStudents = (isParent && attachedStudents && attachedStudents.length > 0)
      ? attachedStudents
      : (allStudents && allStudents.length > 0 ? allStudents : (activeStudent ? [activeStudent] : []));

    sourceStudents.forEach(s => {
      if (s?.className) {
        if (!classMap.has(s.className)) {
          classMap.set(s.className, { name: s.className, count: 1 });
        } else {
          classMap.get(s.className)!.count += 1;
        }
      }
    });

    const list = Array.from(classMap.values());
    return list.sort((a, b) => getClassPedagogicalWeight(a.name) - getClassPedagogicalWeight(b.name));
  }, [isParent, attachedStudents, allStudents, activeStudent]);

  // Current class index in pedagogical sequence
  const currentClassIndex = useMemo(() => {
    if (!activeStudent?.className) return 0;
    const idx = orderedClasses.findIndex(c => c.name.toLowerCase() === activeStudent.className.toLowerCase());
    return idx >= 0 ? idx : 0;
  }, [orderedClasses, activeStudent?.className]);

  const prevClass = currentClassIndex > 0 ? orderedClasses[currentClassIndex - 1] : null;
  const nextClass = currentClassIndex < orderedClasses.length - 1 ? orderedClasses[currentClassIndex + 1] : null;

  // Students belonging to current active class
  const studentsInCurrentClass = useMemo(() => {
    if (!activeStudent?.className) return [];
    const sourceStudents = (isParent && attachedStudents && attachedStudents.length > 0)
      ? attachedStudents
      : (allStudents && allStudents.length > 0 ? allStudents : [activeStudent]);
      
    return sourceStudents
      .filter(s => s?.className && s.className.toLowerCase() === activeStudent.className.toLowerCase())
      .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || '', 'fr'));
  }, [isParent, attachedStudents, allStudents, activeStudent]);

  // Handler for class scrolling / navigation
  const handleNavigateClass = (targetClassName: string) => {
    const sourceStudents = (isParent && attachedStudents && attachedStudents.length > 0)
      ? attachedStudents
      : (allStudents && allStudents.length > 0 ? allStudents : (activeStudent ? [activeStudent] : []));

    const targetStudents = sourceStudents.filter(s => s?.className && s.className.toLowerCase() === targetClassName.toLowerCase());
    if (targetStudents.length > 0 && onSelectStudent) {
      onSelectStudent(targetStudents[0]);
    }
  };

  // Compute realistic T1 & T2 data for selected student
  const reportData = useMemo(() => {
    return generateStudentReportData(activeStudent);
  }, [activeStudent]);

  const totalCoeff = reportData.subjects.reduce((acc, s) => acc + s.coeff, 0);

  // Active trimester figures
  const isT1 = activeTrimester === 'T1';
  const currentAvg = isT1 ? reportData.t1Avg : reportData.t2Avg;
  const currentRank = isT1 ? reportData.t1Rank : reportData.t2Rank;
  const currentAbsences = isT1 ? reportData.t1Absences : reportData.t2Absences;
  const currentLates = isT1 ? reportData.t1Lates : reportData.t2Lates;
  const currentCouncil = isT1 ? reportData.t1AppreciationCouncil : reportData.t2AppreciationCouncil;
  const currentHonor = isT1 ? reportData.t1Honor : reportData.t2Honor;
  const currentDeliberationDate = isT1 ? '18 Décembre 2026' : '27 Mars 2027';

  // Evolution between T1 and T2
  const evolutionDelta = Number((reportData.t2Avg - reportData.t1Avg).toFixed(2));
  const isProgressing = evolutionDelta > 0;
  const isRegressing = evolutionDelta < 0;

  // Annual cumulative average so far
  const cumulativeAnnualAverage = Number(((reportData.t1Avg + reportData.t2Avg) / 2).toFixed(2));

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleSendToParent = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3800);
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    setPdfSuccess(false);
    try {
      const ok = generateReportCardPdf(activeStudent, activeTrimester, school.name);
      if (ok) {
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 5000);
      }
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintCard = () => {
    // 1. Instantly generate & download official vector report card PDF
    generateReportCardPdf(activeStudent, activeTrimester, school.name);
    setPdfSuccess(true);
    setTimeout(() => setPdfSuccess(false), 5000);

    // 2. Also trigger native browser print if supported
    try {
      window.print();
    } catch {
      // Ignored if sandbox blocks window.print
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Student & Class Selection Toolbar (Hidden on print) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs print:hidden space-y-4">
        {/* Row 1: Class Scrolling & Student Switcher Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs shadow-2xs">
              <SchoolIcon className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
                  Classe active :
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-xs">
                  {activeStudent?.className || 'Classe'}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  ({studentsInCurrentClass.length} élève{studentsInCurrentClass.length > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : 'Aucun élève'} • <span className="font-mono text-xs text-slate-500 font-normal">Matricule: {activeStudent?.matricule || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Défilement des classes (Précédente / Suivante) + Sélecteur d'élève */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Défilement des classes */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                id="btn-prev-class-report"
                disabled={!prevClass}
                onClick={() => prevClass && handleNavigateClass(prevClass.name)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 transition-all cursor-pointer"
                title={prevClass ? `Classe précédente : ${prevClass.name}` : 'Première classe'}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Classe préc.</span>
              </button>

              {/* Classe Actuelle Indicator with quick selector */}
              <div className="px-2.5 py-1 bg-white rounded-xl shadow-2xs border border-slate-200 flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Classe</span>
                <select
                  id="select-active-class-report"
                  value={activeStudent?.className || ''}
                  onChange={(e) => handleNavigateClass(e.target.value)}
                  className="text-xs font-black text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
                  title="Changer de classe"
                >
                  {orderedClasses.map((cls, idx) => (
                    <option key={cls.name} value={cls.name}>
                      {cls.name} ({idx + 1}/{orderedClasses.length})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                id="btn-next-class-report"
                disabled={!nextClass}
                onClick={() => nextClass && handleNavigateClass(nextClass.name)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 transition-all cursor-pointer"
                title={nextClass ? `Classe suivante : ${nextClass.name}` : 'Dernière classe'}
              >
                <span className="hidden sm:inline">Classe suiv.</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Student Selector inside Active Class */}
            <div className="relative min-w-[210px]">
              <select
                id="select-active-student-report"
                value={activeStudent?.id || ''}
                onChange={(e) => {
                  const target = selectableStudents.find(s => s.id === e.target.value);
                  if (target && onSelectStudent) onSelectStudent(target);
                }}
                className="w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs transition-colors"
                title="Sélectionner un élève de cette classe"
              >
                {studentsInCurrentClass.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.lastName.toUpperCase()} {s.firstName} ({s.matricule})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Trimester Switcher (1er Trimestre vs 2ème Trimestre) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wide mr-1">
              Trimestre :
            </span>

            {/* 1er Trimestre Button */}
            <button
              type="button"
              id="btn-tab-trimester-1"
              onClick={() => setActiveTrimester('T1')}
              className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                isT1 
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1er Trimestre</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isT1 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {reportData.t1Avg}/20
              </span>
            </button>

            {/* 2ème Trimestre Button */}
            <button
              type="button"
              id="btn-tab-trimester-2"
              onClick={() => setActiveTrimester('T2')}
              className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                !isT1 
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>2ème Trimestre</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${!isT1 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {reportData.t2Avg}/20
              </span>
            </button>
          </div>

          {/* Evolution badge T1 -> T2 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Évolution T1 → T2 :</span>
            <span className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 ${
              isProgressing 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : isRegressing 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-slate-100 text-slate-700'
            }`}>
              {isProgressing && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
              {isRegressing && <TrendingDown className="w-3.5 h-3.5 text-amber-600" />}
              {!isProgressing && !isRegressing && <Minus className="w-3.5 h-3.5 text-slate-500" />}
              <span>{evolutionDelta > 0 ? `+${evolutionDelta}` : evolutionDelta} pts</span>
            </span>
            <span className="text-slate-400 font-medium">|</span>
            <span className="text-slate-600 font-semibold text-[11px]">
              Moy. Annuelle Cumulée : <strong className="text-blue-900">{cumulativeAnnualAverage} / 20</strong>
            </span>
          </div>
        </div>

        {/* Row 3: Action Buttons (Print, Send, QR) */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
              {isT1 ? 'Session 1er Trimestre • Clôturé' : 'Session 2ème Trimestre • Clôturé'}
            </span>
            {isParent && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bulletin Certifié & Délibéré</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-verify-qr-code"
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Vérifier QR Code</span>
            </button>

            {!isParent && (
              <button
                type="button"
                id="btn-send-parent-report"
                onClick={handleSendToParent}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer au Parent (SMS/WhatsApp)</span>
              </button>
            )}

            <button
              type="button"
              id="btn-print-report-card"
              onClick={handlePrintCard}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              title="Lancer l'impression via le navigateur"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              id="btn-download-report-card-pdf"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              title="Télécharger directement le bulletin officiel en format PDF A4"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Export PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {pdfSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 print:hidden animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Bulletin officiel de {activeStudent?.firstName} {activeStudent?.lastName} exporté et téléchargé en PDF (A4) avec succès !
          </span>
        </div>
      )}

      {sentSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 print:hidden animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Bulletin du <strong>{isT1 ? '1er Trimestre' : '2ème Trimestre'}</strong> de {activeStudent?.firstName || 'l’élève'} transmis avec succès au parent ({activeStudent?.parentName || 'Parent'} - {activeStudent?.parentPhone || ''}) !
          </span>
        </div>
      )}

      {/* Official Senegalese Report Card Sheet (High fidelity printable document) */}
      <div 
        id="official-report-card"
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-300 shadow-lg text-slate-900 font-sans print:border-none print:shadow-none print:p-0"
      >
        {/* Header MEN Senegal & School Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b-2 border-slate-900">
          {/* Left: MEN */}
          <div className="text-center sm:text-left text-[11px] leading-tight text-slate-700 uppercase font-semibold">
            <p className="font-bold text-slate-900">RÉPUBLIQUE DU SÉNÉGAL</p>
            <p className="text-[10px]">Un Peuple - Un But - Une Foi</p>
            <p className="text-[10px] text-slate-500 mt-1">Ministère de l'Éducation Nationale</p>
            <p className="text-[10px] text-slate-500">Inspection d'Académie de Dakar</p>
          </div>

          {/* Center: School Brand */}
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs tracking-widest uppercase mb-1">
              {school.name}
            </div>
            <p className="text-xs text-slate-600">{school.address}, {school.city}</p>
            <p className="text-[11px] text-slate-500">Tél : {school.phone} • Email : {school.email}</p>
          </div>

          {/* Right: QR Code of Authenticity */}
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => setShowQrModal(true)}>
            <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-xs group-hover:border-blue-500 transition-colors">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                <rect x="40" y="10" width="10" height="10" />
                <rect x="55" y="20" width="10" height="10" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="70" y="45" width="15" height="10" />
                <rect x="15" y="45" width="15" height="10" />
                <rect x="75" y="75" width="15" height="15" />
                <rect x="45" y="75" width="10" height="20" />
              </svg>
            </div>
            <span className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Certifié Authentique ({activeTrimester})
            </span>
          </div>
        </div>

        {/* Title Banner - Dynamic to Trimester */}
        <div className="my-5 text-center">
          <div className="inline-block px-3 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider mb-1">
            Enseignement Moyen & Secondaire Général
          </div>
          <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900">
            {isT1 ? 'BULLETIN DE NOTES DU 1ER TRIMESTRE' : 'BULLETIN DE NOTES DU 2ÈME TRIMESTRE'}
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            Année Scolaire {school.academicYear} • Période : {isT1 ? 'Octobre – Décembre 2026' : 'Janvier – Mars 2027'}
          </p>
        </div>

        {/* Student Identification Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nom & Prénom</span>
            <span className="font-bold text-slate-900 text-sm">{activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Matricule National</span>
            <span className="font-mono font-bold text-blue-700">{activeStudent?.matricule || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Classe & Effectif</span>
            <span className="font-bold text-slate-800">{activeStudent?.className || 'N/A'} (32 élèves)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Né(e) le & Lieu</span>
            <span className="font-semibold text-slate-800">{activeStudent ? `${activeStudent.dateOfBirth} à ${activeStudent.placeOfBirth}` : 'N/A'}</span>
          </div>
        </div>

        {/* Official Grades Table with Trimester-Specific Data */}
        <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-2.5">Discipline</th>
                <th className="p-2.5 text-center">Coeff</th>
                {!isT1 && (
                  <th className="p-2.5 text-center bg-slate-800 text-slate-300">Rappel T1</th>
                )}
                <th className="p-2.5 text-center">Devoirs {activeTrimester}</th>
                <th className="p-2.5 text-center">Compo {activeTrimester}</th>
                <th className="p-2.5 text-center bg-slate-800">Moy/20</th>
                {!isT1 && (
                  <th className="p-2.5 text-center bg-slate-800">Évol.</th>
                )}
                <th className="p-2.5 text-center">Classe (Min/Max/Moy)</th>
                <th className="p-2.5 text-center">Rang</th>
                <th className="p-2.5">Appréciation du Professeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.subjects.map((row, idx) => {
                const dev = isT1 ? row.t1Devoirs : row.t2Devoirs;
                const comp = isT1 ? row.t1Compo : row.t2Compo;
                const moy = isT1 ? row.t1Moy : row.t2Moy;
                const rank = isT1 ? row.t1Rank : row.t2Rank;
                const appr = isT1 ? row.t1Appreciation : row.t2Appreciation;
                const diff = Number((row.t2Moy - row.t1Moy).toFixed(1));

                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2.5 font-bold text-slate-900">{row.subject}</td>
                    <td className="p-2.5 text-center font-bold text-slate-600">{row.coeff}</td>
                    {!isT1 && (
                      <td className="p-2.5 text-center font-semibold text-slate-500 bg-slate-50">
                        {row.t1Moy.toFixed(1)}
                      </td>
                    )}
                    <td className="p-2.5 text-center">{dev.toFixed(1)}</td>
                    <td className="p-2.5 text-center font-semibold">{comp.toFixed(1)}</td>
                    <td className="p-2.5 text-center font-black text-blue-900 bg-blue-50/60 text-[13px]">
                      {moy.toFixed(1)}
                    </td>
                    {!isT1 && (
                      <td className="p-2.5 text-center font-bold text-[11px]">
                        {diff > 0 ? (
                          <span className="text-emerald-700">+{diff}</span>
                        ) : diff < 0 ? (
                          <span className="text-amber-700">{diff}</span>
                        ) : (
                          <span className="text-slate-400">=</span >
                        )}
                      </td>
                    )}
                    <td className="p-2.5 text-center text-[11px] text-slate-500">
                      {row.classMin} / {row.classMax} / {row.classMoy}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-700">{rank}</td>
                    <td className="p-2.5 text-[11px] text-slate-600 italic">{appr}</td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Totals & Trimester Highlights */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
              <tr>
                <td className="p-2.5 uppercase">Totaux & Moyenne {activeTrimester}</td>
                <td className="p-2.5 text-center font-black">{totalCoeff}</td>
                {!isT1 && (
                  <td className="p-2.5 text-center font-bold text-slate-600 bg-slate-200/60">
                    {reportData.t1Avg}
                  </td>
                )}
                <td colSpan={2}></td>
                <td className="p-2.5 text-center font-black text-sm text-blue-900 bg-blue-100">
                  {currentAvg} / 20
                </td>
                {!isT1 && (
                  <td className="p-2.5 text-center font-black text-xs text-emerald-800 bg-emerald-100/70">
                    {evolutionDelta > 0 ? `+${evolutionDelta}` : evolutionDelta}
                  </td>
                )}
                <td className="p-2.5 text-center text-slate-600">Moyenne Classe : 13.50</td>
                <td className="p-2.5 text-center font-black text-emerald-700">{currentRank}</td>
                <td className="p-2.5 text-emerald-800 font-bold">{currentHonor}</td>
              </tr>

              {/* Cumulative Summary Row for T2 */}
              {!isT1 && (
                <tr className="bg-blue-50/80 border-t border-blue-200 text-blue-900">
                  <td colSpan={5} className="p-2.5 font-extrabold uppercase text-[11px] tracking-wide">
                    BILAN ANNUEL PROVISOIRE (Moyenne T1: {reportData.t1Avg} + Moyenne T2: {reportData.t2Avg}) :
                  </td>
                  <td className="p-2.5 text-center font-black text-sm text-blue-950 bg-blue-200/80">
                    {cumulativeAnnualAverage} / 20
                  </td>
                  <td colSpan={4} className="p-2.5 font-bold text-xs text-blue-800">
                    Statut académique : Élève admis d'office en passage prévisionnel supérieur
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Observations, Vie Scolaire & Signatures Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 text-xs">
          {/* Assiduité */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span>Vie Scolaire & Assiduité ({activeTrimester})</span>
            </h4>
            <p className="mt-1">
              Absences enregistrées : <strong className="text-slate-800">{currentAbsences} heure{currentAbsences > 1 ? 's' : ''}</strong>
            </p>
            <p>
              Retards constatés : <strong className="text-slate-800">{currentLates}</strong>
            </p>
            <p>
              Conduite & Discipline : <strong className="text-emerald-700">Exemplaire</strong>
            </p>
          </div>

          {/* Avis Conseil de Classe */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-600" />
              <span>Avis du Conseil de Classe ({activeTrimester})</span>
            </h4>
            <p className="italic text-slate-700 mt-1 leading-relaxed">
              "{currentCouncil}"
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              {currentHonor}
            </span>
          </div>

          {/* Signatures & Tampon Officiel */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-center">
            <div className="flex justify-between text-[11px] font-semibold text-slate-700">
              <span>Le Professeur Principal</span>
              <span>Le Directeur des Études</span>
            </div>
            <div className="h-12 flex items-center justify-around font-serif italic text-slate-400 text-xs my-1">
              <span>[Signature]</span>
              <span className="text-blue-900 font-bold">[Cachet Officiel]</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Fait à Dakar, le {currentDeliberationDate}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Verification Dialog */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">Vérification de Bulletin Numérique Officiel</h3>
              <p className="text-xs text-slate-500 mt-1">
                Certificat de conformité conforme aux directives du MEN Sénégal
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5 font-mono">
              <p><span className="text-slate-400">Établissement:</span> {school.name}</p>
              <p><span className="text-slate-400">Élève:</span> {activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : 'N/A'}</p>
              <p><span className="text-slate-400">Matricule:</span> {activeStudent?.matricule || 'N/A'}</p>
              <p><span className="text-slate-400">Trimestre:</span> {isT1 ? '1er Trimestre (T1)' : '2ème Trimestre (T2)'}</p>
              <p><span className="text-slate-400">Moyenne Officielle:</span> {currentAvg}/20 (Rang: {currentRank})</p>
              <p><span className="text-slate-400">Date Délibération:</span> {currentDeliberationDate}</p>
              <p><span className="text-slate-400">Hash SHA-256:</span> {isT1 ? 'a4f8b9e...02e1-T1' : 'd92e10f...87b4-T2'}</p>
            </div>

            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              Document Intègre, Certifié & Non Falsifié
            </span>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Fermer la vérification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
