import React, { useState } from 'react';
import { 
  Calendar, 
  Flag, 
  GraduationCap, 
  Clock, 
  ArrowRight, 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  School,
  AlertCircle
} from 'lucide-react';
import { CalendarEvent, CalendarEventCategory } from '../../types';
import { INITIAL_CALENDAR_EVENTS } from '../../data/calendarData';

interface DirectorCalendarWidgetProps {
  events?: CalendarEvent[];
  onNavigateToCalendar: () => void;
}

export const DirectorCalendarWidget: React.FC<DirectorCalendarWidgetProps> = ({
  events = INITIAL_CALENDAR_EVENTS,
  onNavigateToCalendar
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'JOUR_FERIE' | 'EXAMEN_NATIONAL' | 'EVENEMENT_ECOLE'>('ALL');

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Count by categories
  const holidayCount = events.filter(e => e.category === 'JOUR_FERIE').length;
  const examCount = events.filter(e => e.category === 'EXAMEN_NATIONAL').length;
  const schoolEventCount = events.filter(e => e.category === 'EVENEMENT_ECOLE' || e.category === 'VACANCES_SCOLAIRES' || e.category === 'REUNION_PEDAGOGIQUE').length;

  const filteredEvents = sortedEvents.filter(e => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'JOUR_FERIE') return e.category === 'JOUR_FERIE';
    if (selectedFilter === 'EXAMEN_NATIONAL') return e.category === 'EXAMEN_NATIONAL';
    if (selectedFilter === 'EVENEMENT_ECOLE') return e.category === 'EVENEMENT_ECOLE' || e.category === 'VACANCES_SCOLAIRES' || e.category === 'REUNION_PEDAGOGIQUE';
    return true;
  });

  // Calculate days remaining from a reference date in the 2026-2027 school year
  const getDaysRemainingBadge = (dateStr: string) => {
    const today = new Date('2026-09-21'); // Current session date context
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">Passé</span>;
    } else if (diffDays === 0) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white animate-pulse">Aujourd'hui</span>;
    } else if (diffDays <= 7) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white">J-{diffDays} (Cette semaine)</span>;
    } else if (diffDays <= 30) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">Dans {diffDays} j</span>;
    } else {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">Dans {Math.round(diffDays / 30)} mois</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300 border border-white/15 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                Calendrier Scolaire & Échéances Officielles (Sénégal)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Session 2026-2027
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Jours fériés légaux, dates officielles des examens nationaux (CFEE, BFEM, BAC) et vie scolaire.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-director-open-calendar"
          onClick={onNavigateToCalendar}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>Module Calendrier Complet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50 text-center text-xs py-3 px-4">
        <div className="px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Jours Fériés Sénégal</span>
          <span className="text-sm font-black text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
            <Flag className="w-3.5 h-3.5" /> {holidayCount} fêtes officielles
          </span>
        </div>

        <div className="px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Examens Nationaux</span>
          <span className="text-sm font-black text-rose-700 flex items-center justify-center gap-1 mt-0.5">
            <GraduationCap className="w-3.5 h-3.5" /> {examCount} épreuves d'État
          </span>
        </div>

        <div className="px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Événements de l'École</span>
          <span className="text-sm font-black text-blue-700 flex items-center justify-center gap-1 mt-0.5">
            <School className="w-3.5 h-3.5" /> {schoolEventCount} jalons prévus
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-white">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({sortedEvents.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('JOUR_FERIE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'JOUR_FERIE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Flag className="w-3 h-3" />
            <span>Jours Fériés ({holidayCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('EXAMEN_NATIONAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'EXAMEN_NATIONAL'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>Examens Nationaux ({examCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('EVENEMENT_ECOLE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'EVENEMENT_ECOLE'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <School className="w-3 h-3" />
            <span>Vie de l'École ({schoolEventCount})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden md:inline">
          Affichage des jalons de l'année scolaire 2026-2027
        </span>
      </div>

      {/* Events List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {filteredEvents.slice(0, 8).map(event => {
          const isHoliday = event.category === 'JOUR_FERIE';
          const isExam = event.category === 'EXAMEN_NATIONAL';
          const isVacation = event.category === 'VACANCES_SCOLAIRES';

          const formattedDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div 
              key={event.id}
              className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isHoliday 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : isExam 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : isVacation 
                        ? 'bg-purple-50 border-purple-200 text-purple-700' 
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  {isHoliday ? (
                    <Flag className="w-4 h-4" />
                  ) : isExam ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <CalendarDays className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {event.title}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isHoliday 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : isExam 
                          ? 'bg-rose-100 text-rose-900' 
                          : isVacation 
                            ? 'bg-purple-100 text-purple-900' 
                            : 'bg-blue-100 text-blue-900'
                    }`}>
                      {isHoliday ? 'Férié Sénégal' : isExam ? 'Examen d\'État' : isVacation ? 'Vacances MEN' : 'Établissement'}
                    </span>
                  </div>

                  <p className="text-slate-500 text-[11px] line-clamp-1 max-w-xl">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Lieu : <strong>{event.location}</strong></span>
                    {event.targetAudience && (
                      <>
                        <span>•</span>
                        <span>Cible : <strong>{event.targetAudience}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-800 text-xs font-mono">
                  {formattedDate}
                </span>
                {getDaysRemainingBadge(event.startDate)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link to full module */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onNavigateToCalendar}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Consulter les {sortedEvents.length} événements dans le Calendrier Scolaire complet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
