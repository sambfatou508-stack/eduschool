import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Student, School, Parent } from '../../types';
import { 
  AttendanceAlertConfig, 
  DispatchedAlert, 
  interpolateAlertTemplate 
} from './attendanceAlertTypes';

interface AbsenceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  parent?: Parent;
  school?: School;
  selectedDate: string;
  selectedHour: string;
  reason: string;
  isJustified: boolean;
  config: AttendanceAlertConfig;
  lastSentAlert?: DispatchedAlert;
  onSendAlert: (alert: DispatchedAlert) => void;
}

export const AbsenceAlertModal: React.FC<AbsenceAlertModalProps> = ({
  isOpen,
  onClose,
  student,
  parent,
  school,
  selectedDate,
  selectedHour,
  reason,
  isJustified,
  config,
  lastSentAlert,
  onSendAlert
}) => {
  if (!isOpen) return null;

  const schoolName = school?.name || 'Groupe Scolaire Excellence Dakar';
  const schoolPhone = school?.phone || '+221 33 825 40 50';
  const parentEmail = parent?.email || `${student.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
  const parentPhone = student.parentPhone || parent?.phone || '+221 77 000 00 00';

  const defaultParams = {
    studentName: `${student.firstName} ${student.lastName}`,
    firstName: student.firstName,
    lastName: student.lastName,
    className: student.className,
    matricule: student.matricule,
    parentName: student.parentName,
    date: new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    hour: selectedHour,
    reason: `${reason}${isJustified ? ' (Justifié)' : ' (Non justifié)'}`,
    schoolName,
    schoolPhone
  };

  const initialSms = interpolateAlertTemplate(config.smsTemplate, defaultParams);
  const initialEmailSubject = interpolateAlertTemplate(config.emailSubjectTemplate, defaultParams);
  const initialEmailBody = interpolateAlertTemplate(config.emailBodyTemplate, defaultParams);

  const [activeChannel, setActiveChannel] = useState<'SMS_AND_EMAIL' | 'SMS' | 'EMAIL'>(config.channel);
  const [smsText, setSmsText] = useState(initialSms);
  const [emailSubject, setEmailSubject] = useState(initialEmailSubject);
  const [emailBody, setEmailBody] = useState(initialEmailBody);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);

  const smsChars = smsText.length;
  const smsSegments = Math.ceil(smsChars / 160) || 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerSend = () => {
    setIsSending(true);
    setTimeout(() => {
      const newAlert: DispatchedAlert = {
        id: `alert-${Date.now()}-${student.id}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.className,
        parentName: student.parentName,
        parentPhone,
        parentEmail,
        channel: activeChannel,
        sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'DELIVRE',
        smsContent: (activeChannel === 'SMS' || activeChannel === 'SMS_AND_EMAIL') ? smsText : undefined,
        emailContent: (activeChannel === 'EMAIL' || activeChannel === 'SMS_AND_EMAIL') ? `${emailSubject}\n\n${emailBody}` : undefined,
        reason: defaultParams.reason,
        date: selectedDate,
        hour: selectedHour
      };

      onSendAlert(newAlert);
      setIsSending(false);
      setSuccessStatus(true);
      setTimeout(() => {
        setSuccessStatus(false);
        onClose();
      }, 1800);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Alerte Absence Parent : {student.firstName} {student.lastName}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-200 text-slate-700">
                  {student.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Destinataire : <strong>{student.parentName}</strong> ({parentPhone} • {parentEmail})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Status info if previously sent */}
          {lastSentAlert && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Une alerte d'absence a déjà été transmise à <strong>{lastSentAlert.sentAt}</strong> ({lastSentAlert.channel === 'SMS_AND_EMAIL' ? 'SMS & Email' : lastSentAlert.channel}).
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Délivré
              </span>
            </div>
          )}

          {/* Channel selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Canal d'expédition pour cette alerte
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveChannel('SMS_AND_EMAIL')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  activeChannel === 'SMS_AND_EMAIL'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>+</span>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>SMS & E-mail</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('SMS')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  activeChannel === 'SMS'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS Seul</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('EMAIL')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  activeChannel === 'EMAIL'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>E-mail Seul</span>
              </button>
            </div>
          </div>

          {/* SMS Preview & Edit */}
          {(activeChannel === 'SMS' || activeChannel === 'SMS_AND_EMAIL') && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Aperçu du SMS (Passerelle Sonatel / Orange / Free)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>{smsChars} car.</span>
                  <span>•</span>
                  <span>{smsSegments} SMS</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="ml-1 p-1 text-slate-500 hover:text-slate-800 rounded-md cursor-pointer hover:bg-slate-200/60"
                    title="Copier le texte"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white font-mono text-slate-800 leading-relaxed focus:outline-hidden focus:border-blue-500"
              />
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Expéditeur affiché : <strong>{config.senderName}</strong></span>
                <span>Numéro parent : <strong>{parentPhone}</strong></span>
              </div>
            </div>
          )}

          {/* Email Preview & Edit */}
          {(activeChannel === 'EMAIL' || activeChannel === 'SMS_AND_EMAIL') && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Aperçu du Courriel Officiel</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">À: {parentEmail}</span>
              </div>

              <div>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Objet du courriel"
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 mb-2 focus:outline-hidden focus:border-blue-500"
                />
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 leading-relaxed focus:outline-hidden focus:border-blue-500 font-sans"
                />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Expéditeur : <strong>{config.replyEmail}</strong></span>
                <span>Signature : Direction & Vie Scolaire</span>
              </div>
            </div>
          )}

          {/* Success banner inside modal */}
          {successStatus && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Alerte d'absence expédiée avec succès au parent ({student.parentName}) !</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="button"
            id="btn-confirm-send-absence-alert"
            disabled={isSending}
            onClick={handleTriggerSend}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Expédition en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {lastSentAlert ? "Renvoyer l'Alerte au Parent" : "Envoyer l'Alerte Immédiatement"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
