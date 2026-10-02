import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Users, 
  Filter,
  Sparkles,
  Phone,
  Lock,
  Mail,
  Building2,
  BellRing
} from 'lucide-react';
import { CommunicationLog, UserRole, Parent, Student } from '../../types';

interface CommunicationModuleProps {
  logs: CommunicationLog[];
  userRole?: UserRole;
  activeParent?: Parent;
  attachedStudents?: Student[];
  onSendMessage: (msg: CommunicationLog) => void;
}

export const CommunicationModule: React.FC<CommunicationModuleProps> = ({
  logs,
  userRole,
  activeParent,
  attachedStudents,
  onSendMessage
}) => {
  const isParent = userRole === 'PARENT';
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [recipientGroup, setRecipientGroup] = useState('ALL_PARENTS');
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Filter logs for parents: ONLY messages targeting all parents or their children's classes
  const parentClasses = attachedStudents?.map(s => s.className) || [];
  const hasUnpaidDebt = attachedStudents?.some(s => s.remainingFee > 0) || false;

  const displayLogs = isParent && attachedStudents ? logs.filter(log => {
    const grp = (log.recipientGroup || '').toUpperCase();
    // 1. All parents broadcasts
    if (grp.includes('TOUS') || grp.includes('ALL') || grp.includes('GÉNÉRAL') || grp.includes('COMMUNAUTÉ')) return true;
    // 2. Class broadcasts
    for (const cls of parentClasses) {
      if (cls.includes('6ème') && (grp.includes('6È') || grp.includes('6E') || grp.includes('6A'))) return true;
      if (cls.includes('5ème') && (grp.includes('5È') || grp.includes('5E') || grp.includes('5A'))) return true;
      if (cls.includes('4ème') && (grp.includes('4È') || grp.includes('4E') || grp.includes('4A'))) return true;
      if (cls.includes('Terminale') && (grp.includes('TERMINALE') || grp.includes('TS2') || grp.includes('BAC'))) return true;
    }
    // 3. Debtors reminder only if this parent has debt
    if (hasUnpaidDebt && (grp.includes('IMPAYÉ') || grp.includes('RAPPEL') || grp.includes('ÉCHÉANCE') || grp.includes('DEBTOR'))) {
      return true;
    }
    // 4. Individual absence alerts concerning this parent or their children
    if (attachedStudents.some(s => 
      grp.includes(s.firstName.toUpperCase()) || 
      grp.includes(s.lastName.toUpperCase()) || 
      grp.includes(s.matricule.toUpperCase()) ||
      (log.message && (
        log.message.toLowerCase().includes(s.firstName.toLowerCase()) || 
        log.message.includes(s.matricule)
      ))
    )) {
      return true;
    }
    return false;
  }) : logs;

  // Template selector
  const templates = [
    {
      title: 'Fermeture Religieuse (Magal / Gamou / Korité)',
      text: "Chers parents d'élèves, le Groupe Scolaire Excellence Dakar vous informe de la fermeture exceptionnelle de l'établissement du jeudi au lundi à l'occasion des célébrations religieuses. Reprise normale des cours mardi à 08h00."
    },
    {
      title: 'Rappel Échéance Scolarité (FCFA)',
      text: "Chers parents, nous vous rappelons que l'échéance de scolarité pour ce mois arrive à terme le 05. Vous pouvez régler facilement via Wave ou Orange Money au 77 645 12 34 ou à la caisse de l'école. Merci de votre confiance."
    },
    {
      title: 'Réunion Parents-Professeurs',
      text: "La direction et le corps professoral vous invitent à la Grande Réunion Parents-Professeurs ce samedi à 09h30 pour la remise commentée des bulletins du 1er trimestre."
    },
    {
      title: 'Alerte Absence Immédiate',
      text: "Votre enfant est absent ce jour sans justification préalable enregistrée auprès de la vie scolaire. Merci de bien vouloir contacter le secrétariat au +221 33 825 40 50."
    }
  ];

  const handleSelectTemplate = (text: string) => {
    setMessageText(text);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText) return;

    const newLog: CommunicationLog = {
      id: `com-${Date.now()}`,
      channel,
      recipientGroup: recipientGroup === 'ALL_PARENTS' ? 'Tous les parents (350 contacts)' : 'Parents de 6ème A',
      message: messageText,
      sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVRE',
      recipientCount: recipientGroup === 'ALL_PARENTS' ? 350 : 32
    };

    onSendMessage(newLog);
    setSentSuccess(true);
    setMessageText('');
    setTimeout(() => setSentSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Passerelle SMS & WhatsApp Sénégal (+221)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isParent ? 'Avis & Communications de l\'Établissement' : 'Communication & Notifications Parents'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isParent 
              ? 'Consultez les annonces officielles, fermetures, convocations et alertes transmises aux familles' 
              : 'Diffusion instantanée d\'avis scolaires, rappels de frais et alertes disciplinaires'}
          </p>
        </div>

        {isParent && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Mode Réception Parent</span>
          </span>
        )}
      </div>

      {isParent && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs sm:text-sm space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <BellRing className="w-4 h-4 text-blue-600" />
            <span>Fil d'actualité et alertes officielles</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Ce journal récapitule l'ensemble des communications transmises par la Direction, la Comptabilité et la Vie Scolaire à l'attention des parents. L'envoi de messages de masse est exclusivement réservé au personnel administratif.
          </p>
        </div>
      )}

      {/* Direct Contact Card for Parents */}
      {isParent && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Secrétariat Général</p>
              <p className="text-slate-500 font-mono text-[11px]">+221 33 825 40 50</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Vie Scolaire & WhatsApp</p>
              <p className="text-slate-500 font-mono text-[11px]">+221 77 645 12 34</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <Mail className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Courriel Administration</p>
              <p className="text-slate-500 text-[11px] truncate">contact@excellence-dakar.sn</p>
            </div>
          </div>
        </div>
      )}

      {sentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Campagne transmise avec succès aux parents d'élèves ! Taux de délivrabilité estimé : 99.4%</span>
        </div>
      )}

      {/* Quick Templates Bar (Admin only) */}
      {!isParent && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Modèles Prêts à l'Emploi (Contexte Sénégalais)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectTemplate(tpl.text)}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs transition-colors cursor-pointer group"
              >
                <p className="font-bold text-slate-800 group-hover:text-blue-700">{tpl.title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{tpl.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composition Box (Admin only) */}
      {!isParent && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSend} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Canal de diffusion</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('WHATSAPP')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'WHATSAPP' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('SMS')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'SMS' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS Pro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'EMAIL' 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destinataires</label>
                <select
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold bg-slate-50"
                >
                  <option value="ALL_PARENTS">Tous les parents de l'établissement (350)</option>
                  <option value="CLASS_6A">Parents de 6ème A (32)</option>
                  <option value="CLASS_4A">Parents de 4ème A (35)</option>
                  <option value="CLASS_TS2">Parents de Terminale S2 (28)</option>
                  <option value="DEBTORS">Parents avec impayés uniquement (18)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Contenu du message</label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {messageText.length} caractères • {Math.ceil(messageText.length / 160) || 1} SMS
                </span>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Rédigez votre annonce ou choisissez un modèle ci-dessus..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Diffuser le Message Immédiatement</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast History / Inbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase">
            {isParent ? 'Messages & Avis Transmis à Votre Famille' : 'Historique des Diffusions Récentes'}
          </span>
          <span className="text-xs text-slate-500">{displayLogs.length} message{displayLogs.length > 1 ? 's' : ''} reçu{displayLogs.length > 1 ? 's' : ''}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {displayLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun avis ou message spécifique pour le moment.
            </div>
          ) : (
            displayLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800' :
                      log.channel === 'SMS' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {log.channel}
                    </span>
                    <span className="font-bold text-xs text-slate-800">{log.recipientGroup}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.sentAt}</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Délivré ({log.recipientCount})
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
