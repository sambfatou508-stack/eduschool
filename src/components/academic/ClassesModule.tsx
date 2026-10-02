import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Plus, 
  UserCheck, 
  MapPin, 
  Award,
  Search,
  Lock
} from 'lucide-react';
import { ClassRoom, Student, UserRole } from '../../types';

interface ClassesModuleProps {
  classes: ClassRoom[];
  students: Student[];
  onSelectClassStudents: (className: string) => void;
  userRole?: UserRole;
  teacherClasses?: string[];
}

export const ClassesModule: React.FC<ClassesModuleProps> = ({
  classes,
  students,
  onSelectClassStudents,
  userRole,
  teacherClasses
}) => {
  const isTeacher = userRole === 'ENSEIGNANT';
  const [levelFilter, setLevelFilter] = useState('ALL');

  // If teacher, strictly restrict to teacher's classes
  const teacherClassList = isTeacher && teacherClasses && teacherClasses.length > 0
    ? classes.filter(c => teacherClasses.includes(c.name))
    : classes;

  const filteredClasses = teacherClassList.filter(c => 
    levelFilter === 'ALL' || c.level === levelFilter
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isTeacher ? 'Mes Classes Attribuées' : 'Structure Pédagogique & Classes'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isTeacher 
              ? 'Classes et effectifs d\'élèves confiés à votre enseignement'
              : 'Organisation des cycles d\'enseignement sénégalais (Collège & Lycée)'}
          </p>
        </div>

        {/* Level filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          {['ALL', 'Primaire', 'Collège', 'Lycée'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                levelFilter === lvl
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl === 'ALL' ? (isTeacher ? 'Toutes mes classes' : 'Tous les cycles') : lvl}
            </button>
          ))}
        </div>
      </div>

      {isTeacher && (
        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-950 font-medium">
          <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Espace Enseignant :</strong> Vous visualisez exclusivement vos classes d'affectation ({teacherClassList.map(c => c.name).join(', ')}). Les autres classes de l'établissement sont masquées.
          </span>
        </div>
      )}

      {/* Classes Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const classStudentsCount = students.filter(s => s.className === cls.name).length;

          return (
            <div 
              key={cls.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                    {cls.level}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{cls.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-700">{classStudentsCount}</span>
                  <span className="text-xs text-slate-400 block font-medium">/ {cls.capacity} élèves</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Professeur Principal :</span>
                  <span className="font-bold text-slate-800">{cls.mainTeacherName || (cls as any).mainTeacher || 'Non assigné'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Salle attitrée :</span>
                  <span className="font-semibold text-slate-700">{cls.room}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Régime :</span>
                  <span className="font-semibold text-emerald-700">Plein temps (8h - 17h)</span>
                </div>
              </div>

              <button
                id={`btn-consulter-effectif-${cls.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectClassStudents(cls.name)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-200/80 group shadow-2xs"
              >
                <Users className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                <span>Consulter l'Effectif ({classStudentsCount} {classStudentsCount > 1 ? 'élèves' : 'élève'})</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
