import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Send, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  X,
  Clock,
  Filter,
  DollarSign
} from 'lucide-react';
import { Student } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface DebtsModuleProps {
  students: Student[];
}

export const DebtsModule: React.FC<DebtsModuleProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [relanceModalStudent, setRelanceModalStudent] = useState<Student | null>(null);
  const [customRelanceMessage, setCustomRelanceMessage] = useState('');
  const [relanceSent, setRelanceSent] = useState(false);

  const debtors = students.filter(s => s.remainingFee > 0);

  const filteredDebtors = debtors.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);

    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const totalDebt = debtors.reduce((sum, s) => sum + s.remainingFee, 0);

  const handleOpenRelance = (student: Student) => {
    const defaultMsg = `Chers parents de ${student.firstName} ${student.lastName} (Classe ${student.className}), le Groupe Scolaire Excellence Dakar vous rappelle que le solde de scolarité s'élève à ${formatFCFA(student.remainingFee)}. Merci de régulariser via Wave au 77 645 12 34 ou à la caisse de l'école. Cordialement, la Direction.`;
    setCustomRelanceMessage(defaultMsg);
    setRelanceModalStudent(student);
    setRelanceSent(false);
  };

  const handleSendRelance = () => {
    setRelanceSent(true);
    setTimeout(() => {
      setRelanceModalStudent(null);
      setRelanceSent(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
              Module Recouvrement
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Suivi des Impayés & Relances Parents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion du recouvrement des frais de scolarité au Sénégal
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Impayés en Cours</span>
          <p className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
            {formatFCFA(totalDebt)}
          </p>
          <p className="text-[11px] text-rose-600 mt-0.5">{debtors.length} élèves concernés</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taux de Recouvrement</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            78.4 %
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Objectif mensuel : &gt; 85%</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dernières Relances</span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
            34 envoyées
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Via WhatsApp & SMS (+221)</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher élève, parent, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="ALL">Toutes les classes</option>
          <option value="6ème A">6ème A</option>
          <option value="4ème A">4ème A</option>
          <option value="Terminale S2">Terminale S2</option>
        </select>
      </div>

      {/* Debtors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Élève & Matricule</th>
                <th className="px-4 py-3">Classe</th>
                <th className="px-4 py-3">Parent / Tuteur</th>
                <th className="px-4 py-3">Téléphone (+221)</th>
                <th className="px-4 py-3">Montant Dû (FCFA)</th>
                <th className="px-4 py-3">Retard Estimé</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDebtors.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{student.matricule}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                      {student.className}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {student.parentName}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {student.parentPhone}
                  </td>
                  <td className="px-4 py-3 font-black text-rose-600 text-sm">
                    {formatFCFA(student.remainingFee)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Clock className="w-3 h-3" />
                      1 à 2 mois
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`btn-relancer-${student.id}`}
                      onClick={() => handleOpenRelance(student)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Relancer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relance Modal */}
      {relanceModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Avis de Relance pour Scolarité</span>
              </div>
              <button onClick={() => setRelanceModalStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p><span className="text-slate-500">Destinataire :</span> <strong className="text-slate-800">{relanceModalStudent.parentName}</strong> ({relanceModalStudent.parentPhone})</p>
                <p><span className="text-slate-500">Élève :</span> <strong className="text-slate-800">{relanceModalStudent.firstName} {relanceModalStudent.lastName}</strong> - {relanceModalStudent.className}</p>
                <p><span className="text-slate-500">Montant en souffrance :</span> <strong className="text-rose-600">{formatFCFA(relanceModalStudent.remainingFee)}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Message de relance (SMS / WhatsApp)
                </label>
                <textarea
                  rows={4}
                  value={customRelanceMessage}
                  onChange={(e) => setCustomRelanceMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              {relanceSent ? (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Relance envoyée avec succès au parent (+221) !</span>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a
                    href={`https://wa.me/${relanceModalStudent.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customRelanceMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <span>Ouvrir dans WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRelanceModalStudent(null)}
                      className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendRelance}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer SMS Système</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
