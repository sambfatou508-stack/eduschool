import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Smartphone, 
  Mail, 
  Check, 
  RotateCcw, 
  Info, 
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { 
  AttendanceAlertConfig, 
  DEFAULT_ALERT_CONFIG, 
  AlertChannel 
} from './attendanceAlertTypes';

interface AbsenceAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AttendanceAlertConfig;
  onSaveConfig: (newConfig: AttendanceAlertConfig) => void;
}

export const AbsenceAlertSettingsModal: React.FC<AbsenceAlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<AttendanceAlertConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleResetDefaults = () => {
    setForm({ ...DEFAULT_ALERT_CONFIG });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Configuration des Alertes Automatiques d'Absence
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Règles de notification instantanée SMS & E-mail aux parents d'élèves
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Main Activation Switch */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-blue-600" />
                <span className="font-black text-blue-950 text-sm">
                  Système d'Alertes Automatiques Parents
                </span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Avertir immédiatement les familles dès qu'une absence est constatée et enregistrée en classe.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={form.enabled} 
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Trigger Option */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Mode de déclenchement des notifications
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div 
                onClick={() => setForm({ ...form, autoSendOnSave: true })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  form.autoSendOnSave 
                    ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">À l'enregistrement de l'appel (Recommandé)</span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    form.autoSendOnSave ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {form.autoSendOnSave && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Les alertes sont groupées et expédiées en un clic au moment où le professeur ou surveillant clique sur "Enregistrer l'Appel".
                </p>
              </div>

              <div 
                onClick={() => setForm({ ...form, autoSendOnSave: false })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  !form.autoSendOnSave 
                    ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Envoi manuel ou sur demande</span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    !form.autoSendOnSave ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {!form.autoSendOnSave && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Les alertes ne sont pas envoyées automatiquement à la sauvegarde. L'utilisateur clique sur "Alerter le parent" pour chaque élève.
                </p>
              </div>
            </div>
          </div>

          {/* Default Channels */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Canaux de transmission par défaut
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, channel: 'SMS_AND_EMAIL' })}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  form.channel === 'SMS_AND_EMAIL'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  <span>+</span>
                  <Mail className="w-4 h-4" />
                </div>
                <span>SMS + E-mail</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, channel: 'SMS' })}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  form.channel === 'SMS'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>SMS Pro Seul</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, channel: 'EMAIL' })}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  form.channel === 'EMAIL'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>E-mail Seul</span>
              </button>
            </div>
          </div>

          {/* Senders Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom d'émetteur SMS (Sender ID 11 car. max)
              </label>
              <input
                type="text"
                maxLength={11}
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse de réponse e-mail
              </label>
              <input
                type="email"
                value={form.replyEmail}
                onChange={(e) => setForm({ ...form, replyEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Variable chips guidance */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold block text-slate-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Variables dynamiques disponibles dans les modèles :
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;ELEVE&#125;</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;CLASSE&#125;</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;DATE&#125;</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;CRENEAU&#125;</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;MOTIF&#125;</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;PARENT&#125;</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">&#123;TELEPHONE_ECOLE&#125;</span>
            </div>
          </div>

          {/* SMS Template */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Modèle de message SMS</label>
              <span className="text-[11px] font-mono text-slate-400">
                {form.smsTemplate.length} caractères
              </span>
            </div>
            <textarea
              rows={3}
              value={form.smsTemplate}
              onChange={(e) => setForm({ ...form, smsTemplate: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 font-mono bg-white focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Email Subject & Body */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Modèle de message E-mail</label>
            <input
              type="text"
              value={form.emailSubjectTemplate}
              onChange={(e) => setForm({ ...form, emailSubjectTemplate: e.target.value })}
              placeholder="Objet du mail..."
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
            />
            <textarea
              rows={4}
              value={form.emailBodyTemplate}
              onChange={(e) => setForm({ ...form, emailBodyTemplate: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 font-sans bg-white focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Paramètres d'alertes automatiques enregistrés avec succès !</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rétablir modèles d'origine</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                id="btn-save-alert-settings"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Enregistrer les Paramètres
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
