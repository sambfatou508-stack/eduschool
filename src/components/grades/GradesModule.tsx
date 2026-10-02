import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Save, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  BookOpen,
  Filter,
  Lock
} from 'lucide-react';
import { Student, Subject, UserRole } from '../../types';
import { getGradeBadgeClass } from '../../utils/formatters';

interface GradesModuleProps {
  students: Student[];
  subjects: Subject[];
  userRole?: UserRole;
  attachedStudents?: Student[];
  activeChild?: Student;
  teacherSubjects?: string[];
  teacherClasses?: string[];
  teacherName?: string;
}

export const GradesModule: React.FC<GradesModuleProps> = ({ 
  students, 
  subjects, 
  userRole,
  attachedStudents,
  activeChild,
  teacherSubjects,
  teacherClasses,
  teacherName
}) => {
  const isParent = userRole === 'PARENT';
  const isTeacher = userRole === 'ENSEIGNANT';
  const canEditGrades = !isParent && !isTeacher;
  
  // Available classes
  const allowedClasses = isParent && attachedStudents && attachedStudents.length > 0
    ? Array.from(new Set(attachedStudents.map(s => s.className)))
    : isTeacher && teacherClasses && teacherClasses.length > 0
    ? teacherClasses
    : ['6ème A', '6ème B', '5ème A', '4ème A', 'Terminale S2'];

  // Available subjects
  const allowedSubjects = isTeacher && teacherSubjects && teacherSubjects.length > 0
    ? subjects.filter(sub => teacherSubjects.includes(sub.name))
    : subjects;

  const initialClass = isParent && activeChild 
    ? activeChild.className 
    : (allowedClasses[0] || '6ème A');

  const initialSubject = allowedSubjects[0]?.name || 'Mathématiques';

  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [evaluationType, setEvaluationType] = useState('COMPOSITION');
  const [period, setPeriod] = useState('TRIMESTRE_1');
  const [evaluationDate, setEvaluationDate] = useState('2026-12-10');
  const [successSaved, setSuccessSaved] = useState(false);

  // Keep selectedClass synchronized
  React.useEffect(() => {
    if (!allowedClasses.includes(selectedClass)) {
      setSelectedClass(allowedClasses[0] || '6ème A');
    }
  }, [allowedClasses, selectedClass]);

  // Keep selectedSubject synchronized
  React.useEffect(() => {
    if (allowedSubjects.length > 0 && !allowedSubjects.some(s => s.name === selectedSubject)) {
      setSelectedSubject(allowedSubjects[0].name);
    }
  }, [allowedSubjects, selectedSubject]);

  // Filter students for the active class: STRICT ISOLATION
  const classStudents = students.filter(s => {
    const inClass = s.className === selectedClass;
    if (!isParent) return inClass;
    // Parent CAN ONLY see their attached child
    return inClass && (attachedStudents?.some(att => att.id === s.id) ?? false);
  });

  // Saisie notes state map studentId -> score
  const [scores, setScores] = useState<Record<string, number>>({
    'stu-1': 14.5,
    'stu-2': 17.0,
    'stu-3': 10.0,
    'stu-4': 15.0,
    'stu-5': 13.5,
    'stu-6': 10.8
  });

  const handleScoreChange = (studentId: string, val: string) => {
    const num = parseFloat(val);
    setScores(prev => ({
      ...prev,
      [studentId]: isNaN(num) ? 0 : Math.min(20, Math.max(0, num))
    }));
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 3000);
  };

  // Stats calculation
  const scoreValues = classStudents.map(s => scores[s.id] ?? 12);
  const classAverage = scoreValues.length > 0
    ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(2)
    : '0.00';
  const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues).toFixed(1) : '0';
  const minScore = scoreValues.length > 0 ? Math.min(...scoreValues).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              Système de Notation MEN Sénégal (Base 20)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isParent 
              ? 'Relevé des Notes & Évaluations' 
              : isTeacher 
              ? 'Consultation de mes Notes' 
              : 'Saisie des Notes & Calcul des Moyennes'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isParent 
              ? 'Consultation officielle des devoirs surveillés et compositions' 
              : isTeacher
              ? 'Affichage exclusif de vos propres notes (Saisie et édition restreintes)'
              : 'Enregistrement des devoirs surveillés et compositions avec calcul instantané des rangs'}
          </p>
        </div>

        {canEditGrades ? (
          <button
            onClick={handleSaveGrades}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publier les Notes</span>
          </button>
        ) : isTeacher ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-xs self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consultation Enseignant (Saisie bloquée)</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Mode Consultation Parent</span>
          </span>
        )}
      </div>

      {isParent && (
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Espace Parent :</strong> Les notes sont arrêtées et validées par le corps professoral. La saisie et l'édition de notes sont réservées aux enseignants.
          </span>
        </div>
      )}

      {isTeacher && (
        <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs font-medium flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Espace Enseignant :</strong> Vous visualisez exclusivement vos propres notes pour vos matières ({allowedSubjects.map(s => s.name).join(', ')}) et vos classes attribuées ({allowedClasses.join(', ')}). La saisie et la modification des notes sont bloquées.
          </span>
        </div>
      )}

      {successSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Notes enregistrées avec succès ! Les moyennes générales et les rangs ont été recalculés automatiquement.</span>
        </div>
      )}

      {/* Configuration Saisie Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Classe</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-slate-50"
          >
            {allowedClasses.map(clsName => (
              <option key={clsName} value={clsName}>{clsName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Matière</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-slate-50"
          >
            {allowedSubjects.map(sub => (
              <option key={sub.id} value={sub.name}>{sub.name} (Coeff {sub.coefficient})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Type d'Évaluation</label>
          <select
            value={evaluationType}
            onChange={(e) => setEvaluationType(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold bg-slate-50"
          >
            <option value="DEVOIR_1">Devoir 1 (Surveillé)</option>
            <option value="DEVOIR_2">Devoir 2 (Surveillé)</option>
            <option value="COMPOSITION">Composition Finale</option>
            <option value="INTERROGATION">Interrogation Écrite</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Période</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold bg-slate-50"
          >
            <option value="TRIMESTRE_1">1er Trimestre</option>
            <option value="TRIMESTRE_2">2ème Trimestre</option>
            <option value="TRIMESTRE_3">3ème Trimestre</option>
            <option value="SEMESTRE_1">1er Semestre</option>
            <option value="SEMESTRE_2">2ème Semestre</option>
          </select>
        </div>
      </div>

      {/* Class Statistics Indicators */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
          <span className="text-[11px] font-bold text-blue-800 uppercase">Moyenne de Classe</span>
          <p className="text-xl font-black text-blue-700">{classAverage} / 20</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Note Maximale</span>
          <p className="text-xl font-black text-emerald-700">{maxScore} / 20</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
          <span className="text-[11px] font-bold text-rose-800 uppercase">Note Minimale</span>
          <p className="text-xl font-black text-rose-700">{minScore} / 20</p>
        </div>
      </div>

      {/* Grade Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase">
            {selectedClass} • {selectedSubject} • {evaluationType}
          </span>
          <span className="text-xs text-slate-500 font-medium">{classStudents.length} élèves</span>
        </div>

        <div className="divide-y divide-slate-100">
          {classStudents.map((student, idx) => {
            const currentScore = scores[student.id] ?? 12.0;
            return (
              <div 
                key={student.id} 
                className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-slate-400 text-center">{idx + 1}</span>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-slate-400 font-mono">{student.matricule}</p>
                  </div>
                </div>

                {/* Score Input Box */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {canEditGrades ? (
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="20"
                        value={currentScore}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        className="w-20 p-2 text-center text-base font-black rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-hidden bg-slate-50 font-mono"
                      />
                    ) : (
                      <div className="w-20 p-2 text-center text-base font-black rounded-xl border border-slate-200 bg-slate-100/90 font-mono text-slate-800 shadow-2xs select-none">
                        {currentScore.toFixed(1)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-400 absolute -right-6 top-3">/20</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border hidden sm:block ${getGradeBadgeClass(currentScore)}`}>
                    {currentScore >= 16 ? 'Très Bien' : currentScore >= 14 ? 'Bien' : currentScore >= 12 ? 'Assez Bien' : currentScore >= 10 ? 'Passable' : 'Insuffisant'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
