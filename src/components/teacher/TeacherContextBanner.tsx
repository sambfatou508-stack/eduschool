import React, { useState } from 'react';
import { 
  GraduationCap, 
  ChevronDown, 
  BookOpen, 
  CheckCircle2, 
  Users, 
  Award,
  CalendarDays,
  Building2
} from 'lucide-react';
import { Teacher, Student } from '../../types';

interface TeacherContextBannerProps {
  activeTeacher: Teacher;
  allTeachers: Teacher[];
  teacherStudents: Student[];
  onSelectTeacher: (teacherId: string) => void;
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const TeacherContextBanner: React.FC<TeacherContextBannerProps> = ({
  activeTeacher,
  allTeachers,
  teacherStudents,
  onSelectTeacher,
  currentTab,
  onNavigateTab
}) => {
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  const assignedClasses = activeTeacher?.classNames || activeTeacher?.assignedClasses || ['6ème A'];
  const subjects = activeTeacher?.subjects || [activeTeacher?.specialty || 'Enseignement Général'];
  const teacherInitial = activeTeacher?.firstName ? activeTeacher.firstName.charAt(0) : 'E';
  const teacherFullName = activeTeacher ? `${activeTeacher.firstName} ${activeTeacher.lastName}` : 'Enseignant';

  return (
    <div className="bg-white rounded-3xl border border-indigo-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top row: Status, Teacher Switcher, Restriction Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                Espace Enseignant
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Vos Classes & Heures Uniquement
              </span>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Mode Consultation Pédagogique
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Accès strictement restreint à vos propres classes, vos élèves, vos heures de cours et vos notes.
            </p>
          </div>
        </div>

        {/* Teacher Account Switcher (For demo / simulation) */}
        <div className="relative self-start md:self-auto">
          <button
            type="button"
            id="btn-teacher-switcher"
            onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Changer d'enseignant pour tester la liste des élèves selon le professeur"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
              {teacherInitial}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-normal">Professeur connecté</span>
              <span className="font-bold text-xs text-slate-900 truncate max-w-[140px] block">
                {teacherFullName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showTeacherDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Changer de profil Enseignant</p>
                <p className="text-[11px] text-slate-500">Testez le filtrage automatique de la liste des élèves par enseignant</p>
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {allTeachers.map((tea) => {
                  const isCurrent = tea.id === activeTeacher.id;
                  const classes = tea.classNames || tea.assignedClasses || [];
                  return (
                    <button
                      key={tea.id}
                      id={`teacher-select-${tea.id}`}
                      onClick={() => {
                        onSelectTeacher(tea.id);
                        setShowTeacherDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                        isCurrent ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tea.firstName ? tea.firstName.charAt(0) : 'P'}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">
                            {tea.firstName || ''} {tea.lastName || ''}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {tea.subjects?.join(', ') || 'Discipline'} • {classes.join(', ')}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Teacher info pills & quick stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Matière{subjects.length > 1 ? 's' : ''} : <strong>{subjects.join(', ')}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vos classes :</span>
            <div className="flex items-center gap-1">
              {assignedClasses.map((cls) => (
                <span
                  key={cls}
                  className="px-2 py-0.5 rounded-md bg-white text-indigo-900 border border-slate-200 text-xs font-bold"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          {activeTeacher.isMainTeacherFor && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Prof. Principal : {activeTeacher.isMainTeacherFor}</span>
            </div>
          )}

          <div className="text-xs text-slate-600 font-semibold px-2">
            <strong>{teacherStudents.length}</strong> élève{teacherStudents.length > 1 ? 's' : ''} au total
          </div>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateTab('eleves')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'eleves'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mes Élèves</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('classes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'classes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mes Classes</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('emploi-du-temps')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'emploi-du-temps' || currentTab === 'emploidutemps'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Mes Heures</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mes Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
