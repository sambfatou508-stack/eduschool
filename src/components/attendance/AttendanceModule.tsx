import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Smartphone, 
  AlertTriangle,
  Calendar,
  Filter,
  Check,
  X,
  FileText,
  RotateCcw,
  Info,
  ShieldCheck,
  ShieldAlert,
  Search,
  MessageSquare,
  Users,
  Mail,
  BellRing,
  Settings2,
  Send,
  Eye,
  ChevronDown,
  ChevronUp,
  History,
  ExternalLink
} from 'lucide-react';
import { Student, Parent, School, CommunicationLog } from '../../types';
import { 
  AttendanceAlertConfig, 
  DEFAULT_ALERT_CONFIG, 
  DispatchedAlert, 
  interpolateAlertTemplate 
} from './attendanceAlertTypes';
import { AbsenceAlertModal } from './AbsenceAlertModal';
import { AbsenceAlertSettingsModal } from './AbsenceAlertSettingsModal';
import { DispatchedAlertsModal } from './DispatchedAlertsModal';

interface AttendanceModuleProps {
  students: Student[];
  parents?: Parent[];
  school?: School;
  onSendAlert?: (log: CommunicationLog) => void;
  onNavigateToCommunication?: () => void;
}

export type AnomalyType = 'ABSENT' | 'RETARD';

export interface AnomalyRecord {
  status: AnomalyType;
  isJustified: boolean;
  reason: string;
  minutesLate?: number;
  note?: string;
  updatedAt: string;
}

const COMMON_ABSENCE_REASONS = [
  'Maladie / Certificat médical',
  'Urgence familiale',
  'Mot écrit des parents (Cahier/SMS)',
  'Rendez-vous médical spécialisé',
  'Cas de force majeure / Intempéries',
  'En attente de justificatif parental'
];

const COMMON_LATE_REASONS = [
  'Transports / Embouteillages (VDN/TER)',
  'Problème de santé matinal',
  'Urgence / Contrainte familiale',
  'Panne de réveil',
  'Sans justificatif valable'
];

const COMMON_LATE_DURATIONS = [5, 10, 15, 20, 30, 45];

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({ 
  students,
  parents,
  school,
  onSendAlert,
  onNavigateToCommunication
}) => {
  // Extract unique available classes
  const availableClasses = useMemo(() => {
    const set = new Set(students.map(s => s.className));
    return Array.from(set);
  }, [students]);

  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[0] || '6ème A');
  const [selectedHour, setSelectedHour] = useState('08h00 - 10h00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState<'ALL' | 'ANOMALIES' | 'ABSENT' | 'RETARD'>('ALL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Automated Alert System Configuration
  const [alertConfig, setAlertConfig] = useState<AttendanceAlertConfig>(() => {
    try {
      const saved = localStorage.getItem('edu_attendance_alert_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_ALERT_CONFIG;
  });

  const handleSaveConfig = (newCfg: AttendanceAlertConfig) => {
    setAlertConfig(newCfg);
    try {
      localStorage.setItem('edu_attendance_alert_config', JSON.stringify(newCfg));
    } catch {
      // ignore
    }
  };

  // Modals state
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);
  const [selectedStudentForAlert, setSelectedStudentForAlert] = useState<Student | null>(null);
  const [dispatchedSummaryList, setDispatchedSummaryList] = useState<DispatchedAlert[]>([]);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Dispatched Alerts tracker (studentId -> DispatchedAlert)
  const [dispatchedAlerts, setDispatchedAlerts] = useState<DispatchedAlert[]>([
    {
      id: 'alert-init-stu-3',
      studentId: 'stu-3',
      studentName: 'Fatou Binetou Fall',
      className: '6ème A',
      parentName: 'Abdoulaye Fall',
      parentPhone: '+221 76 589 11 22',
      parentEmail: 'a.fall@comptabilite.sn',
      channel: 'SMS_AND_EMAIL',
      sentAt: '08:05',
      status: 'DELIVRE',
      smsContent: '[GS EXCELLENCE] Bonjour Abdoulaye Fall, nous vous informons que votre enfant Fatou Binetou Fall (6ème A) est noté(e) ABSENT(E) ce jour (08h00 - 10h00). Motif: Maladie / Certificat médical (Justifié). Vie Scolaire: +221 33 825 40 50.',
      emailContent: "Notification d'absence scolaire - Fatou Binetou Fall",
      reason: 'Maladie / Certificat médical (Justifié)',
      date: new Date().toISOString().split('T')[0],
      hour: '08h00 - 10h00'
    }
  ]);

  // Helper to find parent
  const getParentForStudent = (student: Student): Parent | undefined => {
    if (!parents) return undefined;
    return parents.find(p => p.id === student.parentId || (p.studentIds && p.studentIds.includes(student.id)));
  };

  // Anomaly map: studentId -> AnomalyRecord (Students NOT in this map are considered PRESENT by default)
  const [anomalies, setAnomalies] = useState<Record<string, AnomalyRecord>>({
    'stu-3': {
      status: 'ABSENT',
      isJustified: true,
      reason: 'Maladie / Certificat médical',
      note: 'Certificat médical de 48h transmis par le parent.',
      updatedAt: '08:05'
    },
    'stu-6': {
      status: 'RETARD',
      isJustified: true,
      reason: 'Transports / Embouteillages (VDN/TER)',
      minutesLate: 15,
      note: 'Arrivé à 08h15 en classe après mot de la Vie Scolaire.',
      updatedAt: '08:15'
    }
  });

  // Filter students for active class
  const classStudents = useMemo(() => {
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  // Calculations for attendance statistics
  const absentStudents = classStudents.filter(s => anomalies[s.id]?.status === 'ABSENT');
  const lateStudents = classStudents.filter(s => anomalies[s.id]?.status === 'RETARD');
  const totalAnomaliesCount = absentStudents.length + lateStudents.length;
  const presentCount = classStudents.length - totalAnomaliesCount;

  const justifiedAbsencesCount = absentStudents.filter(s => anomalies[s.id]?.isJustified).length;
  const unjustifiedAbsencesCount = absentStudents.length - justifiedAbsencesCount;
  const justifiedLatesCount = lateStudents.filter(s => anomalies[s.id]?.isJustified).length;

  // Pending alerts count (absent students who haven't been alerted yet for this session)
  const pendingAlertsCount = absentStudents.filter(s => {
    return !dispatchedAlerts.some(
      a => a.studentId === s.id && a.date === selectedDate && a.hour === selectedHour
    );
  }).length;

  // Single alert dispatcher helper
  const dispatchAlertForStudent = (student: Student, anomaly: AnomalyRecord, customAlert?: DispatchedAlert): DispatchedAlert => {
    const par = getParentForStudent(student);
    const parentEmail = par?.email || `${student.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    const parentPhone = student.parentPhone || par?.phone || '+221 77 000 00 00';
    const schoolName = school?.name || 'Groupe Scolaire Excellence Dakar';
    const schoolPhone = school?.phone || '+221 33 825 40 50';

    const params = {
      studentName: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      className: student.className,
      matricule: student.matricule,
      parentName: student.parentName,
      date: new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      hour: selectedHour,
      reason: `${anomaly.reason}${anomaly.isJustified ? ' (Justifié)' : ' (Non justifié)'}`,
      schoolName,
      schoolPhone
    };

    const alert: DispatchedAlert = customAlert || {
      id: `alert-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      className: student.className,
      parentName: student.parentName,
      parentPhone,
      parentEmail,
      channel: alertConfig.channel,
      sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVRE',
      smsContent: interpolateAlertTemplate(alertConfig.smsTemplate, params),
      emailContent: `${interpolateAlertTemplate(alertConfig.emailSubjectTemplate, params)}\n\n${interpolateAlertTemplate(alertConfig.emailBodyTemplate, params)}`,
      reason: params.reason,
      date: selectedDate,
      hour: selectedHour
    };

    setDispatchedAlerts(prev => [alert, ...prev.filter(a => !(a.studentId === student.id && a.date === selectedDate && a.hour === selectedHour))]);

    // Push to app-level communication logs
    if (onSendAlert) {
      if (alert.channel === 'SMS' || alert.channel === 'SMS_AND_EMAIL') {
        const smsLog: CommunicationLog = {
          id: `log-sms-${Date.now()}-${student.id}`,
          channel: 'SMS',
          recipientGroup: `Alerte Absence SMS • ${student.parentName} (${student.firstName} ${student.lastName})`,
          message: alert.smsContent || `Alerte absence élève ${student.firstName} ${student.lastName}`,
          sentAt: alert.sentAt,
          status: 'DELIVRE',
          recipientCount: 1
        };
        onSendAlert(smsLog);
      }

      if (alert.channel === 'EMAIL' || alert.channel === 'SMS_AND_EMAIL') {
        const mailLog: CommunicationLog = {
          id: `log-mail-${Date.now()}-${student.id}`,
          channel: 'EMAIL',
          recipientGroup: `Alerte Absence E-mail • ${student.parentName} (${student.firstName} ${student.lastName})`,
          message: alert.emailContent || `Alerte absence élève ${student.firstName} ${student.lastName}`,
          sentAt: alert.sentAt,
          status: 'DELIVRE',
          recipientCount: 1
        };
        onSendAlert(mailLog);
      }
    }

    return alert;
  };

  // Mark student as Absent or Retard
  const handleMarkAnomaly = (studentId: string, status: AnomalyType) => {
    setAnomalies(prev => {
      const existing = prev[studentId];
      if (existing && existing.status === status) {
        return prev;
      }

      return {
        ...prev,
        [studentId]: {
          status,
          isJustified: false,
          reason: status === 'ABSENT' ? COMMON_ABSENCE_REASONS[0] : COMMON_LATE_REASONS[0],
          minutesLate: status === 'RETARD' ? 15 : undefined,
          note: '',
          updatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      };
    });
  };

  // Reset student back to Present (remove anomaly)
  const handleResetToPresent = (studentId: string) => {
    setAnomalies(prev => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  // Update justification fields
  const handleUpdateJustification = (studentId: string, updates: Partial<AnomalyRecord>) => {
    setAnomalies(prev => {
      const current = prev[studentId];
      if (!current) return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          ...updates
        }
      };
    });
  };

  // Reset all students of current class to Present
  const handleResetAllToPresent = () => {
    if (window.confirm(`Voulez-vous réinitialiser tous les élèves de la classe ${selectedClass} à "Présent" ?`)) {
      setAnomalies(prev => {
        const copy = { ...prev };
        classStudents.forEach(s => {
          delete copy[s.id];
        });
        return copy;
      });
    }
  };

  // Save attendance sheet with automatic alert dispatch
  const handleSaveAttendance = () => {
    setSavedSuccess(true);

    if (alertConfig.enabled && alertConfig.autoSendOnSave && absentStudents.length > 0) {
      const newlyDispatched: DispatchedAlert[] = [];

      absentStudents.forEach(st => {
        const anomaly = anomalies[st.id];
        if (!anomaly) return;

        const alreadySent = dispatchedAlerts.some(
          a => a.studentId === st.id && a.date === selectedDate && a.hour === selectedHour
        );

        if (!alreadySent) {
          const sent = dispatchAlertForStudent(st, anomaly);
          newlyDispatched.push(sent);
        }
      });

      if (newlyDispatched.length > 0) {
        setDispatchedSummaryList(newlyDispatched);
        setIsSummaryModalOpen(true);
      }
    }

    setTimeout(() => setSavedSuccess(false), 5000);
  };

  // Filter student list for display
  const displayedStudents = classStudents.filter(s => {
    const anomaly = anomalies[s.id];
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (viewFilter === 'ALL') return true;
    if (viewFilter === 'ANOMALIES') return !!anomaly;
    if (viewFilter === 'ABSENT') return anomaly?.status === 'ABSENT';
    if (viewFilter === 'RETARD') return anomaly?.status === 'RETARD';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header with Title, Auto-Alert Switch and Quick Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200/80 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Saisie d'Appel Rapide
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5" />
              Alertes SMS & E-mail Automatiques
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Seuls Absents et Retards sont signalés</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Feuille d'Appel & Gestion des Absences / Retards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Par défaut, tous les élèves sont <strong>Présents</strong>. Marquez uniquement les <strong>Absents</strong> ou les <strong>Retards</strong>. Les alertes automatiques préviennent instantanément les parents par <strong>SMS</strong> et <strong>E-mail</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            type="button"
            id="btn-save-attendance"
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 text-blue-100" />
            <span>Enregistrer l'Appel</span>
          </button>
        </div>
      </div>

      {/* Dedicated Automatic Alert System Bar */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300 shrink-0 border border-white/15">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm text-white">
                Système d'Alertes Parents en Direct
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                alertConfig.enabled ? 'bg-emerald-400 text-emerald-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {alertConfig.enabled ? 'Actif' : 'En veille'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-blue-100 flex items-center gap-1">
                {alertConfig.channel === 'SMS_AND_EMAIL' ? (
                  <>
                    <Smartphone className="w-3 h-3" /> SMS + <Mail className="w-3 h-3" /> E-mail
                  </>
                ) : alertConfig.channel === 'SMS' ? (
                  <>
                    <Smartphone className="w-3 h-3" /> SMS Seul
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3" /> E-mail Seul
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1 leading-relaxed">
              {alertConfig.enabled ? (
                <>
                  {pendingAlertsCount > 0 ? (
                    <strong className="text-amber-300">
                      {pendingAlertsCount} parent{pendingAlertsCount > 1 ? 's' : ''} recevront une alerte automatique lors de l'enregistrement de l'appel.
                    </strong>
                  ) : (
                    <span>Toutes les absences actuelles ont déjà été notifiées aux parents.</span>
                  )}
                </>
              ) : (
                <span className="text-slate-300">L'envoi automatique est désactivé. Vous pouvez alerter manuellement chaque famille.</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {/* Quick toggle switch */}
          <button
            type="button"
            id="toggle-auto-alerts"
            onClick={() => handleSaveConfig({ ...alertConfig, enabled: !alertConfig.enabled })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              alertConfig.enabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30' 
                : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${alertConfig.enabled ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            <span>{alertConfig.enabled ? 'Alertes ON' : 'Alertes OFF'}</span>
          </button>

          {/* Settings modal trigger */}
          <button
            type="button"
            id="btn-open-alert-settings"
            onClick={() => setIsAlertSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15 flex items-center gap-1.5 text-xs font-bold"
            title="Paramètres des modèles et canaux d'alerte"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Configurer</span>
          </button>

          {/* History toggle */}
          {dispatchedAlerts.length > 0 && (
            <button
              type="button"
              id="btn-toggle-alert-history"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15 flex items-center gap-1.5 text-xs font-bold"
              title="Consulter les alertes transmises aujourd'hui"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historique ({dispatchedAlerts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation notification banner */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Feuille d'appel enregistrée pour <strong>{selectedClass}</strong> ! 
              {' '}{absentStudents.length} absence(s) et {lateStudents.length} retard(s) consignés avec justifications.
              {alertConfig.enabled && absentStudents.length > 0 && (
                <strong className="text-emerald-950 ml-1">
                  Les alertes SMS & E-mail ont été transmises aux parents.
                </strong>
              )}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setSavedSuccess(false)}
            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Class, Date & Session Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Classe ({availableClasses.length} disponibles)
          </label>
          <select
            id="select-attendance-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
          >
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Date d'appel</label>
          <input
            id="input-attendance-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Créneau horaire d'évaluation</label>
          <select
            id="select-attendance-hour"
            value={selectedHour}
            onChange={(e) => setSelectedHour(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option>08h00 - 10h00 (Matinée)</option>
            <option>10h15 - 12h15 (Midi)</option>
            <option>15h00 - 17h00 (Après-midi)</option>
            <option>17h15 - 19h15 (Soir)</option>
          </select>
        </div>
      </div>

      {/* Attendance Summary Cards with Justification Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Class */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Effectif Classe</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{classStudents.length}</span>
            <span className="text-xs text-slate-500 font-medium">élèves inscrits</span>
          </div>
        </div>

        {/* Présents par défaut */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Présents en classe</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-700">{presentCount}</span>
            <span className="text-[11px] font-bold text-emerald-800">Par défaut</span>
          </div>
        </div>

        {/* Absents Marqués */}
        <div className={`p-3.5 rounded-2xl border shadow-2xs ${absentStudents.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Absents signalés</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-700">{absentStudents.length}</span>
            <span className="text-[10px] font-bold text-rose-800">
              {justifiedAbsencesCount} justifié{justifiedAbsencesCount > 1 ? 's' : ''} • {unjustifiedAbsencesCount} non just.
            </span>
          </div>
        </div>

        {/* Retards Marqués */}
        <div className={`p-3.5 rounded-2xl border shadow-2xs ${lateStudents.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Retards signalés</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-700">{lateStudents.length}</span>
            <span className="text-[10px] font-bold text-amber-800">
              {justifiedLatesCount} justifié{justifiedLatesCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter View Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
          <button
            type="button"
            id="filter-all-students"
            onClick={() => setViewFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              viewFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({classStudents.length})
          </button>

          <button
            type="button"
            id="filter-anomalies-only"
            onClick={() => setViewFilter('ANOMALIES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              viewFilter === 'ANOMALIES'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Signalés ({totalAnomaliesCount})</span>
          </button>

          <button
            type="button"
            id="filter-absents-only"
            onClick={() => setViewFilter('ABSENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              viewFilter === 'ABSENT'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Absents ({absentStudents.length})
          </button>

          <button
            type="button"
            id="filter-retards-only"
            onClick={() => setViewFilter('RETARD')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              viewFilter === 'RETARD'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retards ({lateStudents.length})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Chercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {totalAnomaliesCount > 0 && (
            <button
              type="button"
              onClick={handleResetAllToPresent}
              title="Tout réinitialiser à Présent"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable History Drawer of Today's Dispatched Alerts */}
      {showHistoryDrawer && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Journal des Alertes d'Absence Transmises Aujourd'hui ({dispatchedAlerts.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Historique complet des avis SMS & E-mail délivrés aux familles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToCommunication && (
                <button
                  type="button"
                  onClick={onNavigateToCommunication}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Module Communication</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {dispatchedAlerts.map(alert => (
              <div key={alert.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{alert.studentName}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {alert.className}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">Parent: {alert.parentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono">{alert.parentPhone}</span>
                    <span>•</span>
                    <span className="font-mono">{alert.parentEmail}</span>
                    <span>•</span>
                    <span>Motif : {alert.reason}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {alert.channel === 'SMS_AND_EMAIL' ? 'SMS & Email' : alert.channel}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">{alert.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Appel de la classe : {selectedClass}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {displayedStudents.length} élève{displayedStudents.length > 1 ? 's' : ''} affiché{displayedStudents.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Aucun élève ne correspond au filtre actif.</p>
              <p className="text-xs text-slate-500 mt-1">
                {viewFilter !== 'ALL' ? 'Tous les autres élèves sont considérés Présents.' : 'Aucun élève trouvé.'}
              </p>
            </div>
          ) : (
            displayedStudents.map((student) => {
              const anomaly = anomalies[student.id];
              const isAbsent = anomaly?.status === 'ABSENT';
              const isLate = anomaly?.status === 'RETARD';
              const isPresent = !anomaly;

              const par = getParentForStudent(student);
              const parentPhone = student.parentPhone || par?.phone || '+221 77 000 00 00';
              const parentEmail = par?.email || `${student.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

              // Check if alert was dispatched for this student
              const lastAlert = dispatchedAlerts.find(
                a => a.studentId === student.id && a.date === selectedDate && a.hour === selectedHour
              );

              return (
                <div 
                  key={student.id}
                  id={`student-attendance-row-${student.id}`}
                  className={`p-4 sm:p-5 transition-all ${
                    isAbsent 
                      ? 'bg-rose-50/40 border-l-4 border-l-rose-500' 
                      : isLate 
                        ? 'bg-amber-50/40 border-l-4 border-l-amber-500' 
                        : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Top Row: Student Identity + Status Badge + Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">
                          {student.matricule}
                        </span>

                        {/* Status Badge */}
                        {isPresent && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Présent
                          </span>
                        )}

                        {isAbsent && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            anomaly.isJustified 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Absent • {anomaly.isJustified ? 'Justifié' : 'Non justifié'}
                          </span>
                        )}

                        {isLate && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            anomaly.isJustified 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Retard {anomaly.minutesLate ? `${anomaly.minutesLate} min` : ''} • {anomaly.isJustified ? 'Justifié' : 'Non justifié'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Parent : <strong>{student.parentName}</strong> ({parentPhone})</span>
                      </div>
                    </div>

                    {/* Marking Buttons: ONLY ABSENT or RETARD (with Reset option) */}
                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      {/* Marquer Absent */}
                      <button
                        type="button"
                        id={`btn-mark-absent-${student.id}`}
                        onClick={() => {
                          if (isAbsent) {
                            handleResetToPresent(student.id);
                          } else {
                            handleMarkAnomaly(student.id, 'ABSENT');
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[42px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isAbsent ? 'Absent (Marqué)' : 'Marquer Absent'}</span>
                      </button>

                      {/* Marquer Retard */}
                      <button
                        type="button"
                        id={`btn-mark-retard-${student.id}`}
                        onClick={() => {
                          if (isLate) {
                            handleResetToPresent(student.id);
                          } else {
                            handleMarkAnomaly(student.id, 'RETARD');
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[42px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          isLate
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isLate ? 'Retard (Marqué)' : 'Marquer Retard'}</span>
                      </button>

                      {/* Reset to Present (if marked) */}
                      {(isAbsent || isLate) && (
                        <button
                          type="button"
                          id={`btn-reset-present-${student.id}`}
                          onClick={() => handleResetToPresent(student.id)}
                          title="Annuler et remettre Présent"
                          className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer min-h-[42px] flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Présent</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Justification & Absence Alert Panel */}
                  {(isAbsent || isLate) && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${isAbsent ? 'text-rose-600' : 'text-amber-600'}`} />
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            Justification obligatoire : {isAbsent ? "de l'Absence" : 'du Retard'}
                          </span>
                        </div>

                        {/* Justifié vs Non Justifié Toggle Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            id={`btn-justified-yes-${student.id}`}
                            onClick={() => handleUpdateJustification(student.id, { isJustified: true })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              anomaly.isJustified
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Justifié</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-justified-no-${student.id}`}
                            onClick={() => handleUpdateJustification(student.id, { isJustified: false })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              !anomaly.isJustified
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Non justifié</span>
                          </button>
                        </div>
                      </div>

                      {/* For Retard: Duration Selection */}
                      {isLate && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Durée du retard constatée
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {COMMON_LATE_DURATIONS.map(mins => (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => handleUpdateJustification(student.id, { minutesLate: mins })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  anomaly.minutesLate === mins
                                    ? 'bg-amber-500 border-amber-600 text-white shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {mins} min
                              </button>
                            ))}
                            <div className="flex items-center gap-1 ml-1 text-xs">
                              <span className="text-slate-400">ou</span>
                              <input
                                type="number"
                                min={1}
                                max={120}
                                value={anomaly.minutesLate || ''}
                                onChange={(e) => handleUpdateJustification(student.id, { minutesLate: Number(e.target.value) })}
                                placeholder="Autre min"
                                className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Motif de la justification */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Motif officiel de {isAbsent ? "l'absence" : 'du retard'}
                        </label>
                        <select
                          value={anomaly.reason}
                          onChange={(e) => handleUpdateJustification(student.id, { reason: e.target.value })}
                          className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                        >
                          {(isAbsent ? COMMON_ABSENCE_REASONS : COMMON_LATE_REASONS).map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {/* Optional Custom Note */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Précision ou observation (certificat médical, appel parent...)
                        </label>
                        <input
                          type="text"
                          placeholder={isAbsent ? "Ex: Certificat médical de 48h déposé par le parent..." : "Ex: Appel reçu de la mère à 08h10 (panne de bus VDN)..."}
                          value={anomaly.note || ''}
                          onChange={(e) => handleUpdateJustification(student.id, { note: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      {/* Direct Parent Alert Module for Absence */}
                      {isAbsent && (
                        <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <BellRing className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="font-bold text-xs text-blue-950">
                                Alerte Absence Parent (SMS & E-mail) :
                              </span>

                              {lastAlert ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Envoyée à {lastAlert.sentAt} ({lastAlert.channel === 'SMS_AND_EMAIL' ? 'SMS + Email' : lastAlert.channel})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  {alertConfig.enabled && alertConfig.autoSendOnSave 
                                    ? "Programmée à l'enregistrement" 
                                    : "En attente d'envoi"}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-blue-800 font-medium">
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-blue-600" />
                                {parentPhone}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-indigo-600" />
                                {parentEmail}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              id={`btn-open-alert-modal-${student.id}`}
                              onClick={() => setSelectedStudentForAlert(student)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{lastAlert ? 'Aperçu / Renvoyer' : "Aperçu & Envoi Direct"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal 1: Individual Student Absence Alert Preview & Dispatch */}
      {selectedStudentForAlert && anomalies[selectedStudentForAlert.id] && (
        <AbsenceAlertModal
          isOpen={!!selectedStudentForAlert}
          onClose={() => setSelectedStudentForAlert(null)}
          student={selectedStudentForAlert}
          parent={getParentForStudent(selectedStudentForAlert)}
          school={school}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          reason={anomalies[selectedStudentForAlert.id]?.reason || 'Non spécifié'}
          isJustified={!!anomalies[selectedStudentForAlert.id]?.isJustified}
          config={alertConfig}
          lastSentAlert={dispatchedAlerts.find(
            a => a.studentId === selectedStudentForAlert.id && a.date === selectedDate && a.hour === selectedHour
          )}
          onSendAlert={(alert) => {
            dispatchAlertForStudent(selectedStudentForAlert, anomalies[selectedStudentForAlert.id], alert);
          }}
        />
      )}

      {/* Modal 2: General Alert System Settings */}
      <AbsenceAlertSettingsModal
        isOpen={isAlertSettingsOpen}
        onClose={() => setIsAlertSettingsOpen(false)}
        config={alertConfig}
        onSaveConfig={handleSaveConfig}
      />

      {/* Modal 3: Batch Dispatched Alerts Summary */}
      <DispatchedAlertsModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        alerts={dispatchedSummaryList}
        className={selectedClass}
        onNavigateToCommunication={onNavigateToCommunication}
      />
    </div>
  );
};
