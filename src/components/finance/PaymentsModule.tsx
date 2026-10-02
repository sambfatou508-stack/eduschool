import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  CreditCard, 
  Wallet, 
  FileText, 
  Calendar,
  X,
  Building2,
  Smartphone,
  Lock,
  Download,
  Loader2
} from 'lucide-react';
import { PaymentRecord, Student, PaymentMethod, UserRole, Parent } from '../../types';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { exportElementToPdf } from '../../utils/printUtils';
import { generatePaymentReceiptPdf } from '../../utils/pdfGenerators';

interface PaymentsModuleProps {
  payments: PaymentRecord[];
  students: Student[];
  userRole?: UserRole;
  activeParent?: Parent;
  attachedStudents?: Student[];
  onAddPayment: (newPayment: PaymentRecord) => void;
}

export const PaymentsModule: React.FC<PaymentsModuleProps> = ({
  payments,
  students,
  userRole,
  activeParent,
  attachedStudents,
  onAddPayment
}) => {
  const isParent = userRole === 'PARENT';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // New payment form
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState(20000);
  const [method, setMethod] = useState<PaymentMethod>('WAVE');
  const [period, setPeriod] = useState('Mensualité Décembre 2026');
  const [reference, setReference] = useState('WV-DKR-98412');

  // STRICT DATA ISOLATION: Parents ONLY see receipts and metrics for their attached children
  const effectivePayments = isParent && attachedStudents
    ? payments.filter(p => attachedStudents.some(s => s.id === p.studentId))
    : payments;

  const filteredPayments = effectivePayments.filter(p => {
    const matchesSearch = 
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.className.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = selectedMethod === 'ALL' || p.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  // Family financial metrics
  const familyTotalAnnual = attachedStudents?.reduce((acc, s) => acc + s.annualFee, 0) || 0;
  const familyTotalPaid = attachedStudents?.reduce((acc, s) => acc + s.paidFee, 0) || 0;
  const familyTotalRemaining = attachedStudents?.reduce((acc, s) => acc + s.remainingFee, 0) || 0;

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    const randNum = Math.floor(100 + Math.random() * 900);
    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-2026-00${randNum}`,
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      className: st.className,
      amount: Number(amount),
      method,
      reference: reference || `REF-${Date.now()}`,
      period,
      date: new Date().toISOString().split('T')[0],
      cashierName: 'Mme Khadidiatou Sy (Comptabilité)',
      status: 'VALIDE'
    };

    onAddPayment(newPay);
    setShowModal(false);
    setSelectedReceipt(newPay);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isParent ? 'Historique des Règlements & Quittances' : 'Paiements & Gestion de la Scolarité'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isParent 
              ? 'Consultation de vos versements et téléchargement des reçus officiels' 
              : 'Encaissements multi-canaux (Wave, Orange Money, Espèces) et quittances officielles'}
          </p>
        </div>
        {!isParent ? (
          <button
            id="btn-open-payment-modal"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Encaisser un Paiement</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Reçus & Quittances Vérifiés</span>
          </span>
        )}
      </div>

      {isParent && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900 font-medium">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Espace Règlement Parent :</strong> Retrouvez l'historique de vos versements et téléchargez vos reçus officiels certifiés. L'enregistrement des encaissements est réservé au service comptable de l'établissement.
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">
            {isParent ? 'Scolarité Totale Famille' : 'Total Encaissé (Session)'}
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
            {formatFCFA(isParent ? familyTotalAnnual : payments.reduce((acc, p) => acc + p.amount, 0))}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isParent 
              ? `${attachedStudents?.length || 0} enfant${(attachedStudents?.length || 0) > 1 ? 's' : ''} rattaché${(attachedStudents?.length || 0) > 1 ? 's' : ''}`
              : `${payments.length} quittances émises`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">
            {isParent ? 'Total Déjà Versé' : 'Paiements Wave & OM'}
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {formatFCFA(isParent 
              ? familyTotalPaid 
              : payments.filter(p => p.method === 'WAVE' || p.method === 'ORANGE_MONEY').reduce((acc, p) => acc + p.amount, 0))}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {isParent 
              ? `${effectivePayments.length} quittance${effectivePayments.length > 1 ? 's' : ''} enregistrée${effectivePayments.length > 1 ? 's' : ''}`
              : 'Mobile Money majoritaire'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">
            {isParent ? 'Solde Restant à Régler' : 'Espèces & Chèques'}
          </span>
          <p className={`text-xl sm:text-2xl font-black mt-1 ${
            isParent 
              ? (familyTotalRemaining > 0 ? 'text-amber-600' : 'text-emerald-700') 
              : 'text-slate-800'
          }`}>
            {formatFCFA(isParent 
              ? familyTotalRemaining 
              : payments.filter(p => p.method === 'ESPECES' || p.method === 'CHEQUE').reduce((acc, p) => acc + p.amount, 0))}
          </p>
          <p className={`text-[11px] font-medium mt-0.5 ${
            isParent && familyTotalRemaining > 0 ? 'text-amber-700' : 'text-slate-500'
          }`}>
            {isParent 
              ? (familyTotalRemaining > 0 ? 'À régulariser avant échéance' : 'Scolarité entièrement soldée')
              : 'Caisse centrale établissement'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par élève, reçu, classe, référence de transaction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
        >
          <option value="ALL">Tous les modes de règlement</option>
          <option value="WAVE">Wave</option>
          <option value="ORANGE_MONEY">Orange Money</option>
          <option value="ESPECES">Espèces</option>
          <option value="VIREMENT">Virement bancaire</option>
          <option value="CHEQUE">Chèque</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">N° Quittance</th>
                <th className="px-4 py-3">Élève & Classe</th>
                <th className="px-4 py-3">Période / Échéance</th>
                <th className="px-4 py-3">Montant (FCFA)</th>
                <th className="px-4 py-3">Mode & Référence</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700 text-xs">
                    {p.receiptNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{p.studentName}</p>
                    <p className="text-[11px] text-slate-500">{p.className}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {p.period}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-900">
                    {formatFCFA(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        p.method === 'WAVE' ? 'bg-sky-100 text-sky-800' :
                        p.method === 'ORANGE_MONEY' ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {p.method}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{p.reference}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {p.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reçu</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Enregistrer un Encaissement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sélectionner l'élève</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.className}) - Reste: {formatFCFA(st.remainingFee)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant versé (FCFA)</label>
                  <input
                    type="number"
                    step="5000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-base text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode de paiement</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="ESPECES">Espèces (Caisse)</option>
                    <option value="VIREMENT">Virement bancaire</option>
                    <option value="CHEQUE">Chèque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Période concernée</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ex: Mensualité Décembre 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Référence transaction / reçu</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Valider l'encaissement & Émettre Quittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal (Quittance) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs">Quittance de Paiement Scolaire</span>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div id="printable-receipt-paper" className="p-6 space-y-4 text-xs font-sans bg-white printable-sheet">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="font-black text-sm uppercase text-slate-900 tracking-tight">
                  Groupe Scolaire Excellence Dakar
                </h4>
                <p className="text-[11px] text-slate-500">Avenue Cheikh Anta Diop, Dakar • Tél: +221 33 825 40 50</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-bold text-[11px] border border-blue-200">
                  {selectedReceipt.receiptNumber}
                </span>
              </div>

              <div className="space-y-1.5 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Élève :</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classe :</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Objet / Échéance :</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de paiement :</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.method} ({selectedReceipt.reference})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date d'encaissement :</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.date}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-800 font-semibold block">Montant Réglé</span>
                <span className="text-xl font-black text-emerald-700">{formatFCFA(selectedReceipt.amount)}</span>
              </div>

              <div className="flex justify-between items-end pt-3 text-[10px] text-slate-400 border-t border-dashed border-slate-200">
                <div>
                  <p>Caissier(e) : {selectedReceipt.cashierName}</p>
                  <p>Document officiel certifié • EDU-SCHOOL</p>
                </div>
                <div className="text-center font-serif text-slate-700 italic border border-slate-200 p-1.5 rounded-md bg-slate-50">
                  [Cachet Économat & Signature]
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  generatePaymentReceiptPdf(selectedReceipt);
                  try {
                    window.print();
                  } catch {
                    // ignore
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                title="Générer le reçu officiel et imprimer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Imprimer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  generatePaymentReceiptPdf(selectedReceipt);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Télécharger la quittance officielle en PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
