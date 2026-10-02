import React from 'react';
import { CalendarEvent } from '../../types';

interface OfficialCalendarPrintSheetProps {
  events: CalendarEvent[];
  id?: string;
  className?: string;
}

export const OfficialCalendarPrintSheet: React.FC<OfficialCalendarPrintSheetProps> = ({
  events,
  id = 'printable-school-calendar',
  className = ''
}) => {
  const todayStr = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const examEvents = events
    .filter(e => e.category === 'EXAMEN_NATIONAL')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const holidayEvents = events
    .filter(e => e.category === 'JOUR_FERIE')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const vacationEvents = events
    .filter(e => e.category === 'VACANCES_SCOLAIRES')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const schoolEvents = events
    .filter(e => e.category === 'EVENEMENT_ECOLE' || e.category === 'REUNION_PEDAGOGIQUE')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const formatDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div 
      id={id} 
      className={`bg-white text-slate-900 font-sans p-6 sm:p-8 space-y-6 printable-sheet ${className}`}
      style={{ minWidth: '700px' }}
    >
      {/* Official Senegal Header */}
      <div className="border-b-2 border-slate-900 pb-5">
        <div className="flex justify-between items-start gap-4 text-xs">
          <div className="text-left space-y-0.5">
            <p className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
              RÉPUBLIQUE DU SÉNÉGAL
            </p>
            <p className="text-[10px] text-slate-500 italic">Un Peuple - Un But - Une Foi</p>
            <p className="font-semibold text-slate-700 text-[10px] uppercase pt-1">
              Ministère de l'Éducation Nationale (MEN)
            </p>
            <p className="text-[10px] text-slate-600">Inspection d'Académie (IA) de Dakar</p>
            <p className="text-[10px] text-slate-600">IEF de Dakar-Plateau</p>
          </div>

          <div className="text-right space-y-0.5">
            <p className="font-black text-blue-900 uppercase text-xs tracking-tight">
              GROUPE SCOLAIRE EXCELLENCE DAKAR
            </p>
            <p className="text-[10px] text-slate-600">Établissement Privé d'Enseignement Général</p>
            <p className="text-[10px] text-slate-500">Autorisation Ministérielle N° 00482/MEN</p>
            <p className="text-[10px] text-slate-500">Année Scolaire Académique : <strong>2026 - 2027</strong></p>
            <p className="text-[10px] text-slate-400">Édité le : {todayStr}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 text-center">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
            CALENDRIER SCOLAIRE ET ÉCHÉANCES NATIONALES OFFICIELLES
          </h2>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
            Arrêté ministériel fixant le calendrier scolaire des écoles publiques et privées du Sénégal
          </p>
        </div>
      </div>

      {/* Section 1: Sessions d'Examens Nationaux */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-blue-600 pb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider">
            1. Sessions des Examens Nationaux d'État & Concours (MEN 2027)
          </h3>
        </div>

        <table className="w-full text-left text-[11px] border border-slate-200">
          <thead>
            <tr className="bg-blue-50/80 text-blue-950 font-bold border-b border-slate-200">
              <th className="py-2 px-3 w-1/4">Examen / Épreuve</th>
              <th className="py-2 px-3 w-1/4">Date ou Période</th>
              <th className="py-2 px-3 w-1/4">Public Cible</th>
              <th className="py-2 px-3">Jurys & Centres</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {examEvents.map(evt => (
              <tr key={evt.id} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-bold text-slate-900">
                  {evt.title}
                </td>
                <td className="py-2 px-3 text-slate-700 font-medium">
                  {formatDate(evt.startDate)}
                  {evt.endDate && evt.endDate !== evt.startDate ? ` au ${formatDate(evt.endDate)}` : ''}
                </td>
                <td className="py-2 px-3 text-slate-600">
                  {evt.targetAudience === 'TOUS' ? 'Tous les candidats' : evt.targetAudience}
                </td>
                <td className="py-2 px-3 text-slate-500 text-[10px]">
                  {evt.location || 'Centres de Dakar'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Fêtes Légales et Chômées au Sénégal */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-amber-600 pb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider">
            2. Fêtes Légales et Religieuses Chômées au Sénégal (Loi sénégalaise)
          </h3>
        </div>

        <table className="w-full text-left text-[11px] border border-slate-200">
          <thead>
            <tr className="bg-amber-50/80 text-amber-950 font-bold border-b border-slate-200">
              <th className="py-2 px-3 w-1/4">Fête / Célébration</th>
              <th className="py-2 px-3 w-1/4">Date</th>
              <th className="py-2 px-3">Nature & Statut Légal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {holidayEvents.map(evt => (
              <tr key={evt.id} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-bold text-slate-900">
                  {evt.title}
                </td>
                <td className="py-2 px-3 text-slate-700 font-medium">
                  {formatDate(evt.startDate)}
                </td>
                <td className="py-2 px-3 text-slate-600 text-[10px]">
                  {evt.description || 'Jour férié légal chômé et payé en République du Sénégal'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 3: Vacances Scolaires */}
      {vacationEvents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-emerald-600 pb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h3 className="text-xs font-black uppercase text-emerald-900 tracking-wider">
              3. Périodes de Vacances et Congés Pédagogiques
            </h3>
          </div>

          <table className="w-full text-left text-[11px] border border-slate-200">
            <thead>
              <tr className="bg-emerald-50/80 text-emerald-950 font-bold border-b border-slate-200">
                <th className="py-2 px-3 w-1/3">Période de Congés</th>
                <th className="py-2 px-3 w-1/3">Date de début</th>
                <th className="py-2 px-3">Reprise des cours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {vacationEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">{evt.title}</td>
                  <td className="py-2 px-3 text-slate-700">{formatDate(evt.startDate)}</td>
                  <td className="py-2 px-3 text-slate-700 font-semibold">{evt.endDate ? formatDate(evt.endDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 4: Événements de l'Établissement */}
      {schoolEvents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-indigo-600 pb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider">
              4. Vie Pédagogique et Événements de l'Établissement
            </h3>
          </div>

          <table className="w-full text-left text-[11px] border border-slate-200">
            <thead>
              <tr className="bg-indigo-50/80 text-indigo-950 font-bold border-b border-slate-200">
                <th className="py-2 px-3 w-1/4">Événement</th>
                <th className="py-2 px-3 w-1/4">Date</th>
                <th className="py-2 px-3 w-1/4">Lieu</th>
                <th className="py-2 px-3">Consignes / Public</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {schoolEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">{evt.title}</td>
                  <td className="py-2 px-3 text-slate-700">{formatDate(evt.startDate)}</td>
                  <td className="py-2 px-3 text-slate-600">{evt.location || 'Dans l’école'}</td>
                  <td className="py-2 px-3 text-slate-500 text-[10px]">{evt.description || evt.targetAudience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Signatures & Visa */}
      <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
        <div className="space-y-12">
          <p className="font-bold text-slate-700 uppercase text-[11px]">
            Pour la Direction des Études
          </p>
          <p className="text-[10px] text-slate-400 italic">Signature & Visa</p>
        </div>

        <div className="space-y-12">
          <p className="font-bold text-slate-900 uppercase text-[11px]">
            Le Chef d'Établissement / Directeur
          </p>
          <div className="inline-block border-2 border-dashed border-slate-300 p-2 rounded-xl text-[10px] text-slate-400">
            [Cachet Officiel de l'Établissement]
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
        Document officiel généré numériquement via la plateforme de gestion intégrée EDU-SCHOOL Sénégal.
      </div>
    </div>
  );
};
