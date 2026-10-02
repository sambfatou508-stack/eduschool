import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Award, 
  Sparkles, 
  Plus, 
  PlusCircle, 
  X, 
  GraduationCap, 
  School, 
  Layers, 
  Check, 
  Trash2, 
  AlertCircle,
  Tag,
  BookCheck,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { Subject } from '../../types';

interface SubjectsModuleProps {
  subjects: Subject[];
  onAddSubject?: (newSub: Subject) => void;
  onDeleteSubject?: (subjectId: string) => void;
}

type CycleTab = 'COLLEGE' | 'LYCEE' | 'PRIMAIRE' | 'ALL_SEPARATED';

interface CycleConfig {
  key: CycleTab;
  label: string;
  sublabel: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  tagColor: string;
  classesList: string;
}

const CYCLES: Record<'COLLEGE' | 'LYCEE' | 'PRIMAIRE', CycleConfig> = {
  COLLEGE: {
    key: 'COLLEGE',
    label: 'Collège',
    sublabel: 'Enseignement Moyen (6ème à 3ème)',
    badge: 'Cycle Moyen (BFEM)',
    icon: School,
    accentBg: 'bg-blue-50/70',
    accentBorder: 'border-blue-200',
    accentText: 'text-blue-900',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    classesList: '6ème, 5ème, 4ème, 3ème'
  },
  LYCEE: {
    key: 'LYCEE',
    label: 'Lycée',
    sublabel: 'Enseignement Secondaire (2nde à Terminale)',
    badge: 'Cycle Secondaire (BAC)',
    icon: GraduationCap,
    accentBg: 'bg-purple-50/70',
    accentBorder: 'border-purple-200',
    accentText: 'text-purple-900',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    classesList: 'Seconde S/L, Première S1/S2/L, Terminale S1/S2/L'
  },
  PRIMAIRE: {
    key: 'PRIMAIRE',
    label: 'Primaire',
    sublabel: 'Enseignement Élémentaire (CI à CM2)',
    badge: 'Cycle Élémentaire (CFEE)',
    icon: BookOpen,
    accentBg: 'bg-emerald-50/70',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-900',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    classesList: 'CI, CP, CE1, CE2, CM1, CM2'
  }
};

const CATEGORIES = [
  'TOUS',
  'Scientifique',
  'Littéraire',
  'Sciences Humaines',
  'Langues',
  'Artistique & Sport'
];

export const SubjectsModule: React.FC<SubjectsModuleProps> = ({ 
  subjects,
  onAddSubject,
  onDeleteSubject 
}) => {
  const [activeCycle, setActiveCycle] = useState<CycleTab>('COLLEGE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for new subject
  const [formCycle, setFormCycle] = useState<'Collège' | 'Lycée' | 'Primaire'>('Collège');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCoeff, setFormCoeff] = useState<number>(3);
  const [formCategory, setFormCategory] = useState<string>('Scientifique');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Open modal with preselected cycle
  const handleOpenAddForCycle = (cycle: 'Collège' | 'Lycée' | 'Primaire') => {
    setFormCycle(cycle);
    setFormName('');
    setFormCode('');
    setFormCoeff(cycle === 'Lycée' ? 5 : cycle === 'Primaire' ? 2 : 3);
    setFormCategory('Scientifique');
    setFormDesc('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Auto-generate code abbreviation from name
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!formCode || formCode.length <= 4) {
      const clean = val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      if (clean.length >= 3) {
        setFormCode(clean.slice(0, 4));
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Veuillez renseigner le nom complet de la matière.');
      return;
    }
    if (!formCode.trim()) {
      setFormError('Veuillez renseigner un code officiel abrégé (ex: MATH, PHILO).');
      return;
    }
    if (formCoeff < 1 || formCoeff > 12) {
      setFormError('Le coefficient doit être compris entre 1 et 12.');
      return;
    }

    const newSub: Subject = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      coefficient: Number(formCoeff),
      level: formCycle,
      category: formCategory,
      description: formDesc.trim() || `Matière inscrite au programme officiel du cycle ${formCycle}`
    };

    if (onAddSubject) {
      onAddSubject(newSub);
    }

    // Auto-switch to the cycle where subject was created to view it immediately
    if (formCycle === 'Collège') setActiveCycle('COLLEGE');
    else if (formCycle === 'Lycée') setActiveCycle('LYCEE');
    else if (formCycle === 'Primaire') setActiveCycle('PRIMAIRE');

    setIsAddModalOpen(false);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormError(null);

    setNotification(`La matière "${newSub.name}" a été ajoutée avec succès dans le programme du ${formCycle}.`);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Partition subjects strictly by level
  const collegeSubjects = useMemo(() => 
    subjects.filter(s => s.level.toLowerCase().includes('collège') || s.level.toLowerCase().includes('college')),
    [subjects]
  );

  const lyceeSubjects = useMemo(() => 
    subjects.filter(s => s.level.toLowerCase().includes('lycée') || s.level.toLowerCase().includes('lycee')),
    [subjects]
  );

  const primaireSubjects = useMemo(() => 
    subjects.filter(s => s.level.toLowerCase().includes('primaire') || s.level.toLowerCase().includes('élémentaire')),
    [subjects]
  );

  // Helper to filter a list of subjects by search and category
  const applyFilters = (list: Subject[]) => {
    return list.filter(sub => {
      const matchesSearch = 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = 
        selectedCategory === 'TOUS' || 
        (sub.category && sub.category.toLowerCase() === selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  };

  // Render a specific cycle card grid
  const renderCycleSection = (config: CycleConfig, rawList: Subject[]) => {
    const list = applyFilters(rawList);
    const IconComponent = config.icon;
    const totalCoeff = rawList.reduce((acc, s) => acc + (s.coefficient || 0), 0);

    return (
      <div 
        key={config.key} 
        id={`cycle-section-${config.key.toLowerCase()}`}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* Cycle Header Banner */}
        <div className={`p-5 sm:p-6 ${config.accentBg} border-b ${config.accentBorder} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200/70 shrink-0">
              <IconComponent className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${config.tagColor}`}>
                  {config.badge}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Niveaux : {config.classesList}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                Programme du {config.label}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {config.sublabel} — Répartition étanche et coefficients officiels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="px-3.5 py-2 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200 text-xs flex items-center gap-3 shadow-2xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-bold">Matières</span>
                <span className="text-sm font-black text-slate-900">{rawList.length}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-bold">Total Coefs</span>
                <span className="text-sm font-black text-blue-700">{totalCoeff}</span>
              </div>
            </div>

            <button
              type="button"
              id={`btn-add-subject-${config.key.toLowerCase()}`}
              onClick={() => handleOpenAddForCycle(config.label as any)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter pour le {config.label}</span>
            </button>
          </div>
        </div>

        {/* Subjects Cards Grid */}
        <div className="p-5 sm:p-6">
          {list.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BookCheck className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Aucune matière trouvée pour le {config.label}</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || selectedCategory !== 'TOUS' 
                  ? 'Modifiez vos filtres de recherche ou réinitialisez la catégorie.' 
                  : `Aucune matière n'est actuellement enregistrée pour ce cycle.`}
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddForCycle(config.label as any)}
                className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter la première matière pour le {config.label}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(sub => (
                <div 
                  key={sub.id}
                  id={`subject-card-${sub.id}`}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 group relative"
                >
                  <div>
                    {/* Top Row: Code + Name + Coeff */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs border border-slate-200/80 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                          {sub.code}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {sub.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {sub.level}
                            </span>
                            {sub.category && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                {sub.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200 inline-block shadow-2xs">
                          Coef {sub.coefficient}
                        </span>
                      </div>
                    </div>

                    {/* Description or syllabus note */}
                    {sub.description && (
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  {/* Footer infos & delete button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Award className="w-3.5 h-3.5 text-blue-500" />
                      Évaluation sur 20
                    </span>

                    {onDeleteSubject && (
                      <button
                        type="button"
                        id={`btn-delete-${sub.id}`}
                        onClick={() => {
                          if (window.confirm(`Confirmez-vous la suppression de la matière "${sub.name}" (${sub.level}) ?`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        title="Supprimer cette matière"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Notification Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)} 
            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Programmes Homologués MEN Sénégal
            </span>
            <span className="text-xs text-slate-400 font-medium">• Année Scolaire 2026-2027</span>
          </div>

          <h1 
            id="page-subjects-title"
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
          >
            Matières & Programmes Pédagogiques
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Organisation étanche des programmes par cycle d'enseignement : le <strong>Collège</strong>, le <strong>Lycée</strong> et le <strong>Primaire</strong> disposent de leurs propres matières, volumes horaires et coefficients officiels indépendants.
          </p>
        </div>

        {/* Global Add Subject Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
          <button
            type="button"
            id="btn-add-subject-header"
            onClick={() => handleOpenAddForCycle(activeCycle === 'LYCEE' ? 'Lycée' : activeCycle === 'PRIMAIRE' ? 'Primaire' : 'Collège')}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-100" />
            <span>Ajouter une Nouvelle Matière</span>
          </button>
        </div>
      </div>

      {/* Cycle Separator Selector Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Cycle Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            id="cycle-tab-college"
            onClick={() => setActiveCycle('COLLEGE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCycle === 'COLLEGE'
                ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className={`w-3.5 h-3.5 ${activeCycle === 'COLLEGE' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Collège ({collegeSubjects.length})</span>
          </button>

          <button
            type="button"
            id="cycle-tab-lycee"
            onClick={() => setActiveCycle('LYCEE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCycle === 'LYCEE'
                ? 'bg-white text-purple-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${activeCycle === 'LYCEE' ? 'text-purple-600' : 'text-slate-400'}`} />
            <span>Lycée ({lyceeSubjects.length})</span>
          </button>

          <button
            type="button"
            id="cycle-tab-primaire"
            onClick={() => setActiveCycle('PRIMAIRE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCycle === 'PRIMAIRE'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeCycle === 'PRIMAIRE' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Primaire ({primaireSubjects.length})</span>
          </button>

          <button
            type="button"
            id="cycle-tab-all-separated"
            onClick={() => setActiveCycle('ALL_SEPARATED')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCycle === 'ALL_SEPARATED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tous les cycles séparés</span>
          </button>
        </div>

        {/* Filter and Search within selected view */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            id="filter-subject-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'TOUS' ? 'Toutes les catégories' : cat}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-subject-input"
              type="text"
              placeholder="Rechercher une matière ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area based on selected cycle */}
      <div className="space-y-6">
        {activeCycle === 'COLLEGE' && renderCycleSection(CYCLES.COLLEGE, collegeSubjects)}
        {activeCycle === 'LYCEE' && renderCycleSection(CYCLES.LYCEE, lyceeSubjects)}
        {activeCycle === 'PRIMAIRE' && renderCycleSection(CYCLES.PRIMAIRE, primaireSubjects)}
        {activeCycle === 'ALL_SEPARATED' && (
          <div className="space-y-8">
            {renderCycleSection(CYCLES.COLLEGE, collegeSubjects)}
            {renderCycleSection(CYCLES.LYCEE, lyceeSubjects)}
            {renderCycleSection(CYCLES.PRIMAIRE, primaireSubjects)}
          </div>
        )}
      </div>

      {/* Modal: Add Subject with strict Cycle assignment */}
      {isAddModalOpen && (
        <div 
          id="modal-add-subject"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Ajouter une Nouvelle Matière
                  </h3>
                  <p className="text-xs text-slate-500">
                    Affectation stricte au programme du cycle sélectionné
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Cycle Selector (Mandatory separation) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cycle d'enseignement (Obligatoire & Séparé) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Collège', 'Lycée', 'Primaire'] as const).map(cyc => (
                    <button
                      key={cyc}
                      type="button"
                      onClick={() => {
                        setFormCycle(cyc);
                        if (cyc === 'Lycée' && formCoeff < 4) setFormCoeff(5);
                        if (cyc === 'Primaire' && formCoeff > 4) setFormCoeff(2);
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        formCycle === cyc
                          ? cyc === 'Collège'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                            : cyc === 'Lycée'
                              ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200'
                              : 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cyc}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cette matière sera exclusivement répertoriée dans la filière <strong>{formCycle}</strong>.
                </p>
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intitulé officiel de la matière <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Philosophie, Sciences Économiques, Arabe..."
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              {/* Code & Coefficient */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code abrégé <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PHILO, SES, ARB"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono font-bold uppercase focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coefficient officiel (1 à 12) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formCoeff}
                    onChange={(e) => setFormCoeff(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pôle / Catégorie de discipline
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Scientifique">Scientifique (Maths, PC, SVT, Informatique)</option>
                  <option value="Littéraire">Littéraire (Français, Philo, Littérature)</option>
                  <option value="Sciences Humaines">Sciences Humaines (Histoire-Géo, Éco, Civisme)</option>
                  <option value="Langues">Langues Vivantes (Anglais, Espagnol, Arabe, etc.)</option>
                  <option value="Artistique & Sport">Artistique & Sport (EPS, Dessin, Musique)</option>
                </select>
              </div>

              {/* Description / Specific syllabus note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description pédagogique / Séries ciblées (Optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Obligatoire en classe de Terminale S2 et L2, épreuve écrite au Bac..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  id="btn-submit-subject"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer la matière</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

