import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  Building2, 
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UserRole, School } from '../../types';

interface HeaderProps {
  onOpenSidebar?: () => void;
  onOpenMobileMenu?: () => void;
  activeRole?: UserRole;
  setActiveRole?: (role: UserRole) => void;
  onChangeRole?: (role: UserRole) => void;
  activeSchool?: School;
  setActiveSchool?: (school: School) => void;
  onSelectSchool?: (school: School) => void;
  schools?: School[];
  onOpenQuickAction?: (actionName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenMobileMenu,
  activeRole = 'DIRECTEUR',
  setActiveRole,
  onChangeRole,
  activeSchool,
  setActiveSchool,
  onSelectSchool,
  schools = [],
  onOpenQuickAction
}) => {
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleOpenMenu = onOpenSidebar || onOpenMobileMenu || (() => {});
  const handleRoleChange = onChangeRole || setActiveRole || (() => {});
  const handleSchoolSelect = onSelectSchool || setActiveSchool || (() => {});

  const currentSchoolName = activeSchool?.name || schools[0]?.name || 'Groupe Scolaire Excellence Dakar';
  const currentSchoolId = activeSchool?.id || schools[0]?.id || 'sch-1';


  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'DIRECTEUR', label: 'Directeur / DG', desc: 'Gestion 360°, finances, effectifs, validation' },
    { role: 'ENSEIGNANT', label: 'Enseignant', desc: 'Appel mobile, saisie des notes, cahier de texte' },
    { role: 'PARENT', label: 'Parent / Tuteur', desc: 'Situation de l\'enfant, impayés, bulletins, notes' },
    { role: 'ELEVE', label: 'Élève', desc: 'Emploi du temps, devoirs, moyennes' },
    { role: 'COMPTABLE', label: 'Comptable / Économe', desc: 'Encaissements Wave/OM, reçus, dépenses' },
    { role: 'SECRETAIRE', label: 'Secrétaire', desc: 'Inscriptions, dossiers élèves, documents' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs print:hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left Side: Menu Toggle Button + School Title */}
        <div className="flex items-center gap-3">
          <button
            id="open-sidebar-button"
            onClick={handleOpenMenu}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors border border-slate-200/80 bg-slate-50 cursor-pointer shadow-2xs"
            aria-label="Ouvrir ou fermer le menu"
            title="Menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>


          {/* School Selector Dropdown */}
          <div className="relative">
            <button
              id="school-switcher-button"
              onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-medium transition-colors"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="font-semibold max-w-[140px] sm:max-w-[220px] truncate">{currentSchoolName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSchoolDropdown && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Changer d'établissement (Multi-écoles)
                </div>
                {schools.map((sch) => (
                  <button
                    key={sch.id}
                    id={`school-option-${sch.id}`}
                    onClick={() => {
                      handleSchoolSelect(sch);
                      setShowSchoolDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between ${
                      sch.id === currentSchoolId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{sch.name}</p>
                      <p className="text-[11px] text-slate-500">{sch.city} • {sch.phone}</p>
                    </div>
                    {sch.id === currentSchoolId && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Right Side: Global Role Switcher + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input 
              id="global-search-input"
              type="text" 
              placeholder="Rechercher élève, classe, reçu..." 
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-100 rounded-lg border border-transparent focus:border-blue-400 focus:bg-white focus:outline-hidden w-48 lg:w-64 transition-all"
            />
          </div>

          {/* Persona / Role Switcher - Essential for testing all specified views */}
          <div className="relative">
            <button
              id="role-switcher-button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100/70 text-blue-900 text-xs sm:text-sm font-medium transition-all"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <div className="text-left leading-tight hidden xs:block">
                <span className="text-[10px] text-blue-600 font-medium block">Rôle actif :</span>
                <span className="font-bold text-xs">{activeRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-3.5 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Sélectionner un profil de test</p>
                  <p className="text-[11px] text-slate-500">Basculez entre les rôles selon les spécifications</p>
                </div>
                <div className="py-1">
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      id={`role-option-${item.role}`}
                      onClick={() => {
                        handleRoleChange(item.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        activeRole === item.role ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >

                      <div>
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                      {activeRole === item.role && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              id="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Notifications École</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">3 urgentes</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-900">12 élèves ont des impayés majeurs</p>
                      <p className="text-[11px] text-rose-700">Relance automatique WhatsApp prête</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">8 élèves ont dépassé 5 absences</p>
                      <p className="text-[11px] text-amber-700">6ème A et Terminale S2</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Paiement Wave reçu</p>
                      <p className="text-[11px] text-blue-700">60 000 FCFA pour Amadou Ndiaye</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
