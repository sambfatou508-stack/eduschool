import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Plus, 
  Search, 
  Flag, 
  GraduationCap, 
  School, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download,
  X, 
  Check, 
  CheckCircle2,
  Users, 
  MapPin, 
  AlertCircle, 
  Sparkles, 
  Sun,
  Trash2,
  Bookmark,
  Loader2
} from 'lucide-react';
import { CalendarEvent, CalendarEventCategory, UserRole } from '../../types';
import { INITIAL_CALENDAR_EVENTS } from '../../data/calendarData';
import { PrintExportModal } from '../common/PrintExportModal';
import { OfficialCalendarPrintSheet } from './OfficialCalendarPrintSheet';
import { exportElementToPdf, isInIframe } from '../../utils/printUtils';
import { generateSchoolCalendarPdf } from '../../utils/pdfGenerators';

interface SchoolCalendarModuleProps {
  userRole?: UserRole;
}

export const SchoolCalendarModule: React.FC<SchoolCalendarModuleProps> = ({
  userRole = 'DIRECTEUR'
}) => {
  const canManageEvents = userRole === 'DIRECTEUR' || userRole === 'SECRETAIRE';

  // Events state with persistence in localStorage
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('edu_calendar_events_2026_2027');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    try {
      localStorage.setItem('edu_calendar_events_2026_2027', JSON.stringify(newEvents));
    } catch {
      // ignore
    }
  };

  const [activeView, setActiveView] = useState<'MONTH' | 'LIST'>('MONTH');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | CalendarEventCategory>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Current calendar view month (starts in September 2026 for academic year start)
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-01'));
  
  // Add Event Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);

  // New Event Form State
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    category: 'EVENEMENT_ECOLE',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    location: "Cour d'Honneur de l'établissement",
    targetAudience: 'TOUS',
    description: ''
  });

  // Category counts
  const counts = useMemo(() => {
    return {
      all: events.length,
      ferie: events.filter(e => e.category === 'JOUR_FERIE').length,
      exam: events.filter(e => e.category === 'EXAMEN_NATIONAL').length,
      ecole: events.filter(e => e.category === 'EVENEMENT_ECOLE').length,
      vacances: events.filter(e => e.category === 'VACANCES_SCOLAIRES').length,
      reunions: events.filter(e => e.category === 'REUNION_PEDAGOGIQUE').length,
    };
  }, [events]);

  // Print & PDF Export state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDirectExporting, setIsDirectExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleDirectPdfExport = () => {
    setIsDirectExporting(true);
    setExportNotice(null);
    try {
      const ok = generateSchoolCalendarPdf(events);
      if (ok) {
        setExportNotice('✓ Calendrier officiel 2026-2027 téléchargé en PDF pour impression !');
        setTimeout(() => setExportNotice(null), 5000);
      }
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsDirectExporting(false);
    }
  };

  const handlePrintCalendar = () => {
    // 1. Instant robust vector PDF generation & download
    generateSchoolCalendarPdf(events);
    setExportNotice('✓ Calendrier officiel généré et téléchargé en format PDF prêt à imprimer !');
    setTimeout(() => setExportNotice(null), 5000);

    // 2. Also invoke native browser print dialog if available
    try {
      window.print();
    } catch {
      // Ignored if sandboxed iframe restricts window.print
    }
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchesSearch = 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, selectedCategory, searchTerm]);

  // Calendar Grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date('2026-09-01'));
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startDate) return;

    const created: CalendarEvent = {
      id: `cal-custom-${Date.now()}`,
      title: newEvent.title,
      category: newEvent.category || 'EVENEMENT_ECOLE',
      startDate: newEvent.startDate,
      endDate: newEvent.endDate || newEvent.startDate,
      description: newEvent.description || '',
      location: newEvent.location || "Groupe Scolaire Excellence Dakar",
      targetAudience: newEvent.targetAudience as any || 'TOUS',
      isNationalExam: newEvent.category === 'EXAMEN_NATIONAL',
      isOfficialHoliday: newEvent.category === 'JOUR_FERIE',
      colorBadge: newEvent.category === 'JOUR_FERIE' ? 'emerald' : newEvent.category === 'EXAMEN_NATIONAL' ? 'rose' : 'blue'
    };

    saveEvents([...events, created]);
    setIsAddModalOpen(false);
    setNewEvent({
      title: '',
      category: 'EVENEMENT_ECOLE',
      startDate: '2026-10-15',
      endDate: '2026-10-15',
      location: "Cour d'Honneur de l'établissement",
      targetAudience: 'TOUS',
      description: ''
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      saveEvents(events.filter(e => e.id !== id));
      if (selectedEventForDetail?.id === id) {
        setSelectedEventForDetail(null);
      }
    }
  };

  // Group events by Month for List View
  const eventsByMonth = useMemo<Record<string, CalendarEvent[]>>(() => {
    const groups: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(evt => {
      const d = new Date(evt.startDate);
      const key = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(evt);
    });
    return groups;
  }, [filteredEvents]);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Interactive Calendar Interface (Hidden during browser print) */}
      <div className="space-y-6 print:hidden">
        {/* Header Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                Jours Fériés Sénégal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Examens Nationaux (CFEE, BFEM, BAC)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center gap-1">
                <School className="w-3.5 h-3.5" />
                Vie de l'Établissement
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Calendrier Scolaire & Échéances Officielles (2026-2027)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Consultez les fêtes nationales et religieuses légales au Sénégal, les sessions d'examens d'État du Ministère de l'Éducation Nationale et les activités de l'établissement.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {/* Print & PDF Button (Matches user selector) */}
            <button
              type="button"
              id="btn-print-calendar-main"
              onClick={handlePrintCalendar}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:border-blue-400 active:scale-95"
              title="Générer le PDF officiel et lancer l'impression du calendrier"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Imprimer / PDF</span>
            </button>

            {/* Direct Instant PDF Download Button */}
            <button
              type="button"
              id="btn-direct-download-calendar-pdf"
              onClick={handleDirectPdfExport}
              disabled={isDirectExporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Téléchargement direct en PDF A4 du calendrier officiel"
            >
              {isDirectExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Download className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span className="hidden lg:inline">{isDirectExporting ? 'Export...' : 'Télécharger PDF'}</span>
            </button>

            {canManageEvents && (
              <button
                type="button"
                id="btn-add-calendar-event"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter un Événement</span>
              </button>
            )}
          </div>
        </div>

        {exportNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

      {/* View Selector & Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setActiveView('MONTH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'MONTH' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Vue Grille Mensuelle</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'LIST' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Vue Agenda / Liste</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher un jour férié, un examen (BAC, BFEM...), un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous les événements ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('JOUR_FERIE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'JOUR_FERIE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Jours Fériés Sénégal ({counts.ferie})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('EXAMEN_NATIONAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'EXAMEN_NATIONAL'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Examens Nationaux ({counts.exam})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('VACANCES_SCOLAIRES')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'VACANCES_SCOLAIRES'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Vacances MEN ({counts.vacances})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('EVENEMENT_ECOLE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'EVENEMENT_ECOLE'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Vie de l'École ({counts.ecole})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('REUNION_PEDAGOGIQUE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'REUNION_PEDAGOGIQUE'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Réunions & Conseils ({counts.reunions})</span>
          </button>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {activeView === 'MONTH' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Month Navigation Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize ml-2">
                {monthName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Rentrée (Sept. 2026)
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-bold text-slate-500 bg-slate-100/60 py-2.5">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Jeu</div>
            <div>Ven</div>
            <div>Sam</div>
            <div>Dim</div>
          </div>

          {/* 7-column Calendar Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {/* Empty slots for days before 1st of month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-28 bg-slate-50/40 p-1.5" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              // Find events on this day
              const dayEvents = filteredEvents.filter(e => {
                if (e.startDate === dateStr) return true;
                if (e.endDate && dateStr >= e.startDate && dateStr <= e.endDate) return true;
                return false;
              });

              const isWeekend = (firstDayIndex + idx) % 7 === 5 || (firstDayIndex + idx) % 7 === 6;

              return (
                <div 
                  key={`day-${dayNum}`}
                  className={`h-28 sm:h-32 p-1.5 overflow-hidden flex flex-col justify-between transition-colors hover:bg-slate-50/80 ${
                    isWeekend ? 'bg-slate-50/20' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      dayEvents.some(e => e.category === 'JOUR_FERIE')
                        ? 'bg-emerald-600 text-white'
                        : dayEvents.some(e => e.category === 'EXAMEN_NATIONAL')
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 overflow-y-auto max-h-20 my-1">
                    {dayEvents.map(evt => {
                      const isHoliday = evt.category === 'JOUR_FERIE';
                      const isExam = evt.category === 'EXAMEN_NATIONAL';
                      const isVacation = evt.category === 'VACANCES_SCOLAIRES';

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEventForDetail(evt)}
                          title={`${evt.title} - ${evt.description}`}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-2xs ${
                            isHoliday
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isExam
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : isVacation
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {evt.title}
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA / LIST VIEW */}
      {activeView === 'LIST' && (
        <div className="space-y-6">
          {Object.keys(eventsByMonth).length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">Aucun événement ne correspond à vos critères.</p>
              <p className="text-xs text-slate-500 mt-1">Essayez d'ajuster le filtre de catégorie ou le texte de recherche.</p>
            </div>
          ) : (
            (Object.entries(eventsByMonth) as [string, CalendarEvent[]][]).map(([monthTitle, monthEvts]) => (
              <div key={monthTitle} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Month Title Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 capitalize tracking-wide">
                      {monthTitle}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {monthEvts.length} jalon{monthEvts.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Event rows */}
                <div className="divide-y divide-slate-100">
                  {monthEvts.map(evt => {
                    const isHoliday = evt.category === 'JOUR_FERIE';
                    const isExam = evt.category === 'EXAMEN_NATIONAL';
                    const isVacation = evt.category === 'VACANCES_SCOLAIRES';

                    const startFormatted = new Date(evt.startDate).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    });

                    const endFormatted = evt.endDate && evt.endDate !== evt.startDate
                      ? new Date(evt.endDate).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : null;

                    return (
                      <div 
                        key={evt.id}
                        className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
                            isHoliday 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : isExam 
                                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                : isVacation 
                                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                                  : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                            {isHoliday ? (
                              <Flag className="w-5 h-5" />
                            ) : isExam ? (
                              <GraduationCap className="w-5 h-5" />
                            ) : isVacation ? (
                              <Sun className="w-5 h-5" />
                            ) : (
                              <School className="w-5 h-5" />
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-slate-900">
                                {evt.title}
                              </span>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isHoliday 
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                                  : isExam 
                                    ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                                    : isVacation 
                                      ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}>
                                {isHoliday ? 'Férié National Sénégal' : isExam ? 'Examen d\'État (MEN)' : isVacation ? 'Vacances Scolaires' : 'Établissement'}
                              </span>

                              {evt.targetAudience && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                  Public : {evt.targetAudience}
                                </span>
                              )}
                            </div>

                            {evt.description && (
                              <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">
                                {evt.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                              <span className="flex items-center gap-1 text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {evt.location || "Groupe Scolaire Excellence Dakar"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 text-xs block">
                              {startFormatted}
                            </span>
                            {endFormatted && (
                              <span className="text-[11px] text-slate-400 font-medium block">
                                au {endFormatted}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedEventForDetail(evt)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                            >
                              Détails
                            </button>

                            {canManageEvents && evt.id.startsWith('cal-custom-') && (
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(evt.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Supprimer cet événement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Détail du Jalon Scolaire
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Intitulé officiel
                </span>
                <h4 className="text-base font-black text-slate-900">
                  {selectedEventForDetail.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Catégorie</span>
                  <span className="font-black text-slate-800">
                    {selectedEventForDetail.category === 'JOUR_FERIE' ? 'Férié Légal Sénégal' :
                     selectedEventForDetail.category === 'EXAMEN_NATIONAL' ? 'Examen National d\'État' :
                     selectedEventForDetail.category === 'VACANCES_SCOLAIRES' ? 'Vacances Officielles MEN' :
                     selectedEventForDetail.category === 'REUNION_PEDAGOGIQUE' ? 'Réunion Pédagogique' : 'Vie de l\'École'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-black text-slate-800">
                    {new Date(selectedEventForDetail.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {selectedEventForDetail.endDate && selectedEventForDetail.endDate !== selectedEventForDetail.startDate && (
                      ` au ${new Date(selectedEventForDetail.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lieu / Centre</span>
                  <span className="font-medium text-slate-800">{selectedEventForDetail.location || 'Dakar'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Public Concerné</span>
                  <span className="font-medium text-slate-800">{selectedEventForDetail.targetAudience || 'Tous'}</span>
                </div>
              </div>

              {selectedEventForDetail.description && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Description & Directives
                  </span>
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedEventForDetail.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {canManageEvents && selectedEventForDetail.id.startsWith('cal-custom-') ? (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(selectedEventForDetail.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer cet événement</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Jalon officiel 2026-2027</span>
              )}

              <button
                type="button"
                onClick={() => setSelectedEventForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Ajouter un Événement au Calendrier Scolaire
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Année académique 2026-2027
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intitulé de l'événement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Concours d'Orthographe & Dictée du Collège"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as CalendarEventCategory })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="EVENEMENT_ECOLE">Vie de l'École</option>
                    <option value="REUNION_PEDAGOGIQUE">Réunion Pédagogique</option>
                    <option value="EXAMEN_NATIONAL">Examen / Devoir Commun</option>
                    <option value="VACANCES_SCOLAIRES">Congé / Vacances</option>
                    <option value="JOUR_FERIE">Jour Férié Exceptionnel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Public Cible
                  </label>
                  <select
                    value={newEvent.targetAudience}
                    onChange={(e) => setNewEvent({ ...newEvent, targetAudience: e.target.value as any })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="TOUS">Tous les élèves & familles</option>
                    <option value="ELEMENTAIRE">Cycle Élémentaire (CI-CM2)</option>
                    <option value="COLLEGE">Cycle Collège (6e-3e)</option>
                    <option value="LYCEE">Cycle Lycée (2nde-Tle)</option>
                    <option value="PARENTS">Parents d'élèves</option>
                    <option value="ENSEIGNANTS">Corps Professoral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value, endDate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de fin (optionnelle)
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cour d'Honneur, Salle Polyvalente..."
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Consignes
                </label>
                <textarea
                  rows={3}
                  placeholder="Précisez le déroulement, les horaires ou les consignes pour les élèves/parents..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Enregistrer l'Événement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Official Print & PDF Export Modal */}
      <PrintExportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Calendrier Scolaire & Échéances Officielles (2026-2027)"
        documentName="calendrier_scolaire_senegal_2026_2027"
        targetElementId="printable-school-calendar-modal"
      >
        <OfficialCalendarPrintSheet
          events={events}
          id="printable-school-calendar-modal"
        />
      </PrintExportModal>

      {/* Hidden print element for direct browser print and single-click direct PDF export */}
      <div className="hidden print:block">
        <OfficialCalendarPrintSheet
          events={events}
          id="printable-school-calendar-hidden"
        />
      </div>
    </div>
  );
};
