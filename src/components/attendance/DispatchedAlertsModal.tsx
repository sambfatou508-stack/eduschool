import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Smartphone, 
  Mail, 
  ExternalLink, 
  Users, 
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { DispatchedAlert } from './attendanceAlertTypes';

interface DispatchedAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: DispatchedAlert[];
  className: string;
  onNavigateToCommunication?: () => void;
}

export const DispatchedAlertsModal: React.FC<DispatchedAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  className,
  onNavigateToCommunication
}) => {
  if (!isOpen || alerts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-emerald-950">
                  {alerts.length} Alerte{alerts.length > 1 ? 's' : ''} d'Absence Expédiée{alerts.length > 1 ? 's' : ''} aux Parents !
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">
                  {className}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Les notifications automatiques ont été transmises avec succès via passerelle SMS & messagerie e-mail.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Alertés</span>
              <span className="text-lg font-black text-slate-900">{alerts.length} élève{alerts.length > 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Canaux Utilisés</span>
              <span className="text-xs font-black text-blue-700 flex items-center justify-center gap-1 mt-1">
                <Smartphone className="w-3.5 h-3.5" /> SMS + <Mail className="w-3.5 h-3.5" /> Email
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Accusé Réception</span>
              <span className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Délivré
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Détail des avis transmis aux familles :
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3.5 bg-white hover:bg-slate-50/70 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-xs">
                        {alert.studentName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        (Parent : {alert.parentName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-mono">{alert.sentAt}</span>
                      <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Smartphone className="w-3 h-3 text-blue-600" />
                      {alert.parentPhone}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Mail className="w-3 h-3 text-indigo-600" />
                      {alert.parentEmail}
                    </span>
                    <span className="text-slate-400">
                      Motif : <strong>{alert.reason}</strong>
                    </span>
                  </div>

                  {alert.smsContent && (
                    <div className="mt-1 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Extrait SMS transmis :</span>
                      {alert.smsContent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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

          {onNavigateToCommunication && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToCommunication();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Voir le Journal de Communication</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
