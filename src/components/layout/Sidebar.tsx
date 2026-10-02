import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  HeartHandshake, 
  GraduationCap, 
  School as SchoolIcon, 
  BookOpen, 
  CalendarDays, 
  UserCheck, 
  Award, 
  FileText, 
  CreditCard, 
  AlertOctagon, 
  TrendingDown, 
  MessageSquare, 
  FolderArchive, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { UserRole, School } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen?: boolean;
  mobileMenuOpen?: boolean;
  onClose?: () => void;
  setMobileMenuOpen?: (open: boolean) => void;
  activeRole?: UserRole;
  activeSchool?: School;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  mobileMenuOpen,
  onClose,
  setMobileMenuOpen,
  activeRole = 'DIRECTEUR',
  activeSchool
}) => {
  const isSidebarOpen = isOpen ?? mobileMenuOpen ?? false;
  const handleClose = () => {
    if (onClose) onClose();
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const schoolName = activeSchool?.name || 'Groupe Scolaire Excellence Dakar';
  const schoolCode = activeSchool?.code || 'GSED-DKR';
  const schoolYear = activeSchool?.academicYear || '2026-2027';

  // Navigation items based on role

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['DIRECTEUR', 'COMPTABLE', 'SECRETAIRE'] },
    { id: 'eleves', label: activeRole === 'ENSEIGNANT' ? 'Mes Élèves' : 'Élèves', icon: Users, roles: ['DIRECTEUR', 'SECRETAIRE', 'ENSEIGNANT'] },
    { id: 'inscriptions', label: 'Inscriptions', icon: UserPlus, roles: ['DIRECTEUR', 'SECRETAIRE'] },
    { id: 'parents', label: 'Parents', icon: HeartHandshake, roles: ['DIRECTEUR', 'SECRETAIRE'] },
    { id: 'enseignants', label: 'Enseignants', icon: GraduationCap, roles: ['DIRECTEUR', 'SECRETAIRE'] },
    { id: 'classes', label: activeRole === 'ENSEIGNANT' ? 'Mes Classes' : 'Classes', icon: SchoolIcon, roles: ['DIRECTEUR', 'SECRETAIRE', 'ENSEIGNANT'] },
    { id: 'matieres', label: 'Matières', icon: BookOpen, roles: ['DIRECTEUR'] },
    { id: 'calendrier', label: 'Calendrier Scolaire', icon: CalendarDays, roles: ['DIRECTEUR', 'SECRETAIRE', 'ENSEIGNANT', 'PARENT', 'ELEVE', 'COMPTABLE'] },
    { id: 'emploi-du-temps', label: activeRole === 'ENSEIGNANT' ? 'Mes Heures de Cours' : 'Emploi du temps', icon: CalendarDays, roles: ['DIRECTEUR', 'ENSEIGNANT', 'ELEVE', 'PARENT'] },
    { id: 'presences', label: 'Présences', icon: UserCheck, roles: ['DIRECTEUR', 'SECRETAIRE'] },
    { id: 'notes', label: activeRole === 'ENSEIGNANT' ? 'Mes Notes' : 'Notes & Évaluations', icon: Award, roles: ['DIRECTEUR', 'ENSEIGNANT', 'ELEVE', 'PARENT'] },
    { id: 'bulletins', label: 'Bulletins', icon: FileText, roles: ['DIRECTEUR', 'PARENT', 'ELEVE', 'SECRETAIRE'] },
    { id: 'paiements', label: 'Paiements', icon: CreditCard, roles: ['DIRECTEUR', 'COMPTABLE', 'PARENT'] },
    { id: 'impayes', label: 'Impayés', icon: AlertOctagon, roles: ['DIRECTEUR', 'COMPTABLE'] },
    { id: 'depenses', label: 'Dépenses', icon: TrendingDown, roles: ['DIRECTEUR', 'COMPTABLE'] },
    { id: 'communication', label: 'Communication', icon: MessageSquare, roles: ['DIRECTEUR', 'PARENT', 'SECRETAIRE', 'COMPTABLE'] },
    { id: 'documents', label: 'Documents', icon: FolderArchive, roles: ['DIRECTEUR', 'SECRETAIRE'] },
    { id: 'rapports', label: 'Rapports & Stats', icon: BarChart3, roles: ['DIRECTEUR', 'COMPTABLE'] },
    { id: 'import', label: 'Import Excel / CSV', icon: FileSpreadsheet, roles: ['DIRECTEUR', 'SECRETAIRE', 'COMPTABLE'] },
    { id: 'parametres', label: 'Paramètres', icon: Settings, roles: ['DIRECTEUR'] }
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(activeRole));

  return (
    <>
      {/* Backdrop (Mobile & Desktop Overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity print:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside 
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl print:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md tracking-wider">
              EDS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">EDU-SCHOOL</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sénégal
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">{schoolCode}</p>
            </div>
          </div>
          <button 
            id="close-sidebar-button"
            onClick={handleClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer le menu"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Current School Card */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/50">
              <SchoolIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">{schoolName}</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Année {schoolYear}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">FCFA</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>


        {/* Footer Profile & Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                {activeRole.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Session Active</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {activeRole}
                </span>
              </div>
            </div>
            <button 
              id="sidebar-logout-button"
              onClick={() => alert("Déconnexion sécurisée d'EDU-SCHOOL effectuée")}
              title="Déconnexion" 
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
