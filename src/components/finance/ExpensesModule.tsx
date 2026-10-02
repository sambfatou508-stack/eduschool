import React, { useState } from 'react';
import { 
  Plus, 
  TrendingDown, 
  Wallet, 
  Building, 
  Zap, 
  Droplet, 
  Wifi, 
  BookOpen, 
  Wrench,
  X
} from 'lucide-react';
import { ExpenseRecord, PaymentMethod } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface ExpensesModuleProps {
  expenses: ExpenseRecord[];
  onAddExpense: (newExpense: ExpenseRecord) => void;
  totalRevenue: number;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({
  expenses,
  onAddExpense,
  totalRevenue
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseRecord['category']>('SENELEC_ELECTRICITE');
  const [amount, setAmount] = useState(50000);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      paidTo: paidTo || 'Fournisseur / Prestataire',
      paymentMethod,
      status: 'PAYE'
    };

    onAddExpense(newExp);
    setShowModal(false);
    setTitle('');
    setAmount(50000);
    setPaidTo('');
  };

  const getCategoryIcon = (cat: ExpenseRecord['category']) => {
    switch (cat) {
      case 'SENELEC_ELECTRICITE': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'SENEAU_EAU': return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'INTERNET_TELECOM': return <Wifi className="w-4 h-4 text-indigo-500" />;
      case 'SALAIRES': return <Building className="w-4 h-4 text-emerald-500" />;
      case 'FOURNITURES': return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return <Wrench className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestion des Dépenses de l'Établissement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Suivi des charges d'exploitation (Senelec, Sen'Eau, salaires enseignants, fournitures)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Enregistrer une Dépense</span>
        </button>
      </div>

      {/* Financial Overview (Revenus vs Dépenses vs Solde) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold uppercase">Revenus Encaissés (FCFA)</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {formatFCFA(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Frais scolarité & inscriptions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold uppercase">Dépenses Cumulées (FCFA)</span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            {formatFCFA(totalExpenses)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{expenses.length} factures réglées</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold uppercase">Solde d'Exploitation</span>
          <p className={`text-xl sm:text-2xl font-black mt-1 ${netBalance >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
            {formatFCFA(netBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Trésorerie nette disponible</p>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Dépense & Catégorie</th>
                <th className="px-4 py-3">Bénéficiaire</th>
                <th className="px-4 py-3">Montant (FCFA)</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                        {getCategoryIcon(exp.category)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        <p className="text-[11px] text-slate-500">{exp.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {exp.paidTo}
                  </td>
                  <td className="px-4 py-3 font-black text-rose-600">
                    - {formatFCFA(exp.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {exp.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                      RÉGLÉ
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Enregistrer une Facture ou Dépense</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Désignation de la dépense *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Facture Senelec campus principal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseRecord['category'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="SENELEC_ELECTRICITE">Électricité (Senelec)</option>
                    <option value="SENEAU_EAU">Eau (Sen'Eau)</option>
                    <option value="SALAIRES">Salaires Personnel</option>
                    <option value="INTERNET_TELECOM">Internet & Télécom</option>
                    <option value="FOURNITURES">Fournitures & Papeterie</option>
                    <option value="MAINTENANCE">Maintenance & Travaux</option>
                    <option value="AUTRE">Autre dépense</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant (FCFA) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bénéficiaire / Prestataire</label>
                  <input
                    type="text"
                    placeholder="Ex: Senelec, Sonatel, Libraire..."
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode de règlement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="VIREMENT">Virement</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="ESPECES">Espèces</option>
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Enregistrer la dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
