import React from 'react';
import { 
  ShieldCheck, 
  User, 
  ChevronDown, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Users
} from 'lucide-react';
import { Parent, Student } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface ParentContextBannerProps {
  activeParent?: Parent;
  parent?: Parent;
  parents?: Parent[];
  allParents?: Parent[];
  attachedStudents: Student[];
  selectedChild?: Student;
  activeChild?: Student;
  onSelectParent: (parentId: string) => void;
  onSelectChild: (studentId: string) => void;
}

export const ParentContextBanner: React.FC<ParentContextBannerProps> = ({
  activeParent,
  parent,
  parents,
  allParents,
  attachedStudents,
  selectedChild,
  activeChild,
  onSelectParent,
  onSelectChild,
}) => {
  const [showParentDropdown, setShowParentDropdown] = React.useState(false);

  const effectiveParent = activeParent || parent || (parents && parents[0]) || (allParents && allParents[0]);
  const parentList = parents || allParents || [];
  const currentChild = selectedChild || activeChild || attachedStudents[0];

  const parentInitial = effectiveParent?.firstName ? effectiveParent.firstName.charAt(0) : 'P';
  const parentFullName = effectiveParent ? `${effectiveParent.firstName} ${effectiveParent.lastName}` : 'Parent';

  return (
    <div className="bg-white rounded-3xl border border-blue-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top row: Status, Parent Switcher, Confidentiality Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Espace Sécurisé Famille
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Accès Strictement Cloisonné
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultation exclusive des données de vos enfants rattachés
            </p>
          </div>
        </div>

        {/* Parent Account Switcher (For testing / demonstration) */}
        <div className="relative self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowParentDropdown(!showParentDropdown)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Changer de compte parent pour tester le cloisonnement des données"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
              {parentInitial}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-normal">Parent connecté</span>
              <span className="font-bold text-slate-900">{parentFullName}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showParentDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">Changer de compte parent</p>
                <p className="text-[11px] text-slate-500">
                  Permet de vérifier que chaque parent n'accède qu'à ses propres enfants
                </p>
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {parentList.map((par) => {
                  const isCurrent = effectiveParent && par.id === effectiveParent.id;
                  const childCount = par.studentIds?.length || 1;
                  return (
                    <button
                      key={par.id}
                      type="button"
                      onClick={() => {
                        onSelectParent(par.id);
                        setShowParentDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-blue-50/50 transition-colors flex items-center justify-between ${
                        isCurrent ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900">{par.firstName} {par.lastName}</p>
                        <p className="text-[11px] text-slate-500">
                          {par.profession} • {childCount} enfant{childCount > 1 ? 's' : ''} rattaché{childCount > 1 ? 's' : ''}
                        </p>
                      </div>
                      {isCurrent && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Children Selection Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            {attachedStudents.length > 1 ? 'Vos Élèves Rattachés (Sélectionnez pour consulter)' : 'Élève Rattaché à votre Dossier'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {attachedStudents.length} enfant{attachedStudents.length > 1 ? 's' : ''} inscrit{attachedStudents.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachedStudents.map((child) => {
            const isSelected = currentChild?.id === child.id;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onSelectChild(child.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {child.gender === 'F' ? '👧' : '👦'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-[11px] font-semibold text-blue-700">
                        {child.className} • <span className="font-mono text-slate-500">{child.matricule}</span>
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      Actif
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/70 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Moyenne</span>
                    <span className="font-bold text-slate-800">{child.averageGrade}/20</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assiduité</span>
                    <span className="font-bold text-emerald-700">{child.attendanceRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Solde dû</span>
                    <span className={`font-bold ${child.remainingFee > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {child.remainingFee > 0 ? formatFCFA(child.remainingFee) : 'À jour'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
