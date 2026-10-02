import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';
import { TimetableSlot, UserRole } from '../../types';

interface TimetableModuleProps {
  initialSlots: TimetableSlot[];
  userRole?: UserRole;
  allowedClasses?: string[];
  activeChildName?: string;
  teacherName?: string;
  teacherSubjects?: string[];
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;
const TIME_SLOTS = [
  '08h00 - 10h00',
  '10h15 - 12h15',
  '15h00 - 17h00'
];

export const TimetableModule: React.FC<TimetableModuleProps> = ({ 
  initialSlots, 
  userRole,
  allowedClasses,
  activeChildName,
  teacherName,
  teacherSubjects
}) => {
  const isParent = userRole === 'PARENT';
  const isTeacher = userRole === 'ENSEIGNANT';
  const canEditTimetable = !isParent && !isTeacher;

  const teacherAllowedClasses = isTeacher && allowedClasses && allowedClasses.length > 0
    ? allowedClasses
    : ['6ème A', '5ème A', '4ème A'];

  const parentAllowedClasses = isParent && allowedClasses && allowedClasses.length > 0
    ? allowedClasses
    : ['6ème A', '5ème A', '4ème A', 'Terminale S2'];

  const [slots, setSlots] = useState<TimetableSlot[]>(initialSlots);
  const [selectedClass, setSelectedClass] = useState<string>(
    isTeacher ? 'ALL' : (parentAllowedClasses[0] || '6ème A')
  );
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to determine if a slot belongs to the current teacher
  const isSlotForTeacher = (slot: TimetableSlot) => {
    if (!isTeacher) return true;
    if (teacherName) {
      const teacherLastName = teacherName.toLowerCase().split(' ').pop() || '';
      if (slot.teacherName.toLowerCase().includes(teacherLastName)) return true;
    }
    if (teacherSubjects && teacherSubjects.length > 0) {
      if (teacherSubjects.includes(slot.subject) && teacherAllowedClasses.includes(slot.className)) {
        return true;
      }
    }
    return false;
  };

  // Synchronize selectedClass
  React.useEffect(() => {
    if (isParent && !parentAllowedClasses.includes(selectedClass)) {
      setSelectedClass(parentAllowedClasses[0] || '6ème A');
    } else if (isTeacher && selectedClass !== 'ALL' && !teacherAllowedClasses.includes(selectedClass)) {
      setSelectedClass('ALL');
    }
  }, [isParent, isTeacher, parentAllowedClasses, teacherAllowedClasses, selectedClass]);

  // New slot form
  const [day, setDay] = useState<typeof DAYS[number]>('Lundi');
  const [timeSlot, setTimeSlot] = useState('08h00 - 10h00');
  const [subject, setSubject] = useState('Mathématiques');
  const [formTeacherName, setFormTeacherName] = useState('M. Ousmane Diédhiou');
  const [room, setRoom] = useState('Salle 101');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const checkConflict = (newDay: string, newTime: string, newTeacher: string, newRoom: string, newClass: string) => {
    // 1. Teacher conflict
    const teacherConflict = slots.find(s => s.day === newDay && s.timeSlot === newTime && s.teacherName === newTeacher);
    if (teacherConflict) {
      return `Conflit enseignant : ${newTeacher} est déjà en cours avec la classe ${teacherConflict.className} !`;
    }
    // 2. Room conflict
    const roomConflict = slots.find(s => s.day === newDay && s.timeSlot === newTime && s.room === newRoom);
    if (roomConflict) {
      return `Conflit de salle : La salle ${newRoom} est déjà occupée par la classe ${roomConflict.className} !`;
    }
    // 3. Class conflict
    const classConflict = slots.find(s => s.day === newDay && s.timeSlot === newTime && s.className === newClass);
    if (classConflict) {
      return `Conflit classe : La ${newClass} a déjà le cours de ${classConflict.subject} sur ce créneau !`;
    }
    return null;
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkConflict(day, timeSlot, formTeacherName, room, selectedClass);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      day,
      timeSlot,
      subject,
      teacherName: formTeacherName,
      className: selectedClass,
      room
    };

    setSlots(prev => [...prev, newSlot]);
    setShowAddModal(false);
    setConflictWarning(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const classSlots = slots.filter(s => s.className === selectedClass);

  // Total slots count for banner
  const visibleSlotsCount = isTeacher 
    ? slots.filter(s => isSlotForTeacher(s) && (selectedClass === 'ALL' || s.className === selectedClass)).length
    : classSlots.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isTeacher ? 'Mes Heures de Cours' : 'Emploi du Temps Hebdomadaire'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isTeacher 
              ? 'Planning hebdomadaire de vos heures d\'enseignement (Vos créneaux uniquement)' 
              : 'Planning hebdomadaire du Lundi au Samedi avec détection automatique des conflits triples'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTeacher ? (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs sm:text-sm bg-white shadow-xs"
            >
              <option value="ALL">Toutes mes heures de cours</option>
              {teacherAllowedClasses.map(clsName => (
                <option key={clsName} value={clsName}>Classe : {clsName}</option>
              ))}
            </select>
          ) : (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs sm:text-sm bg-white shadow-xs"
            >
              {parentAllowedClasses.map(clsName => (
                <option key={clsName} value={clsName}>Classe : {clsName}</option>
              ))}
            </select>
          )}

          {canEditTimetable ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter Cours</span>
            </button>
          ) : isTeacher ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Consultation Enseignant</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Consultation Parent</span>
            </span>
          )}
        </div>
      </div>

      {isParent && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900 font-medium">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Emploi du temps de votre enfant :</strong> Vous visualisez le planning officiel de la classe <strong>{selectedClass}</strong> {activeChildName ? `(${activeChildName})` : ''}. Les modifications d'emploi du temps sont strictement réservées à la direction pédagogique.
          </span>
        </div>
      )}

      {isTeacher && (
        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-950 font-medium">
          <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Planning Enseignant :</strong> Vous visualisez exclusivement vos propres heures de cours ({teacherSubjects?.join(', ') || 'Vos matières'}) pour vos classes ({teacherAllowedClasses.join(', ')}). Les cours des autres professeurs sont masqués.
          </span>
        </div>
      )}

      {/* Conflict Detector Badge */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Détecteur de conflits actif : Aucun chevauchement de salle ou d'horaire.
        </span>
        <span className="text-[11px] text-emerald-700 font-bold">
          {visibleSlotsCount} cours {isTeacher ? 'attribués' : 'programmés'}
        </span>
      </div>

      {/* Timetable Grid (Lundi à Samedi) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Header row: Days */}
            <div className="grid grid-cols-7 bg-slate-900 text-white text-xs font-bold divide-x divide-slate-800">
              <div className="p-3 text-center text-slate-400">Horaires</div>
              {DAYS.map(d => (
                <div key={d} className="p-3 text-center uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* Time Slot Rows */}
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-7 border-t border-slate-200 divide-x divide-slate-200 min-h-[110px]">
                {/* Time column */}
                <div className="p-3 bg-slate-50 flex items-center justify-center text-center font-mono font-bold text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {time}
                </div>

                {/* Day columns */}
                {DAYS.map((dayName) => {
                  const course = isTeacher
                    ? slots.find(s => s.day === dayName && s.timeSlot === time && isSlotForTeacher(s) && (selectedClass === 'ALL' || s.className === selectedClass))
                    : classSlots.find(s => s.day === dayName && s.timeSlot === time);
                  return (
                    <div key={dayName} className="p-2 relative hover:bg-slate-50/70 transition-colors">
                      {course ? (
                        <div className={`h-full p-2.5 rounded-xl border flex flex-col justify-between text-xs shadow-xs group ${
                          isTeacher 
                            ? 'bg-indigo-50 border-indigo-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`font-bold truncate ${isTeacher ? 'text-indigo-950' : 'text-blue-950'}`}>
                                {course.subject}
                              </span>
                              {canEditTimetable && (
                                <button
                                  onClick={() => handleDeleteSlot(course.id)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                                  title="Supprimer ce cours"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-800">
                                {course.className}
                              </span>
                              {!isTeacher && (
                                <p className="text-[11px] text-blue-800 flex items-center gap-1">
                                  <User className="w-3 h-3 text-blue-600" />
                                  <span className="truncate">{course.teacherName}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{course.room}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[11px] text-slate-300 font-serif italic">
                          Libre
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Programmer un Cours</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-5 space-y-3.5 text-xs sm:text-sm">
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jour</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horaire</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Matière</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enseignant</label>
                <select
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                >
                  <option value="M. Ousmane Diédhiou">M. Ousmane Diédhiou (Maths)</option>
                  <option value="Mme Fatou Kiné Diagne">Mme Fatou Kiné Diagne (Français/HG)</option>
                  <option value="Dr. Cheikh Tidiane Wade">Dr. Cheikh Tidiane Wade (PC/Maths)</option>
                  <option value="Mme Aïda Gueye">Mme Aïda Gueye (SVT)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Salle attribuée</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                >
                  Ajouter au Planning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
