import React, { useState } from 'react';
import { Settings, Building2, Smartphone, Save, CheckCircle2, ShieldCheck, Globe, Mail } from 'lucide-react';
import { School } from '../../types';

interface SettingsModuleProps {
  school: School;
  onUpdateSchool: (updated: School) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ school, onUpdateSchool }) => {
  const [formState, setFormState] = useState({
    name: school.name,
    code: school.code,
    address: school.address,
    city: school.city,
    phone: school.phone,
    email: school.email,
    academicYear: school.academicYear,
    waveMerchantPhone: '+221 77 645 12 34',
    omMerchantPhone: '+221 78 230 45 89',
    monthlyDueDay: '10'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool({
      ...school,
      name: formState.name,
      code: formState.code,
      address: formState.address,
      city: formState.city,
      phone: formState.phone,
      email: formState.email,
      academicYear: formState.academicYear
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Paramètres & Configuration de l'Établissement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Informations légales, année académique et comptes de paiement mobile Wave & Orange Money
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Les paramètres de l'établissement ont été mis à jour avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General School Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Identité de l'École & Agrément MEN
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Nom Officiel de l'Établissement</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Code Établissement (IA / IEF)</label>
              <input
                type="text"
                value={formState.code}
                onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Adresse Complète</label>
              <input
                type="text"
                value={formState.address}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Ville / Région</label>
              <input
                type="text"
                value={formState.city}
                onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Téléphone Principal (+221)</label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email Officiel</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                required
              />
            </div>
          </div>
        </div>

        {/* Academic Period & Payment Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Paiements Mobile Money & Échéances (Sénégal)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Numéro Marchand Wave (+221)</label>
              <input
                type="text"
                value={formState.waveMerchantPhone}
                onChange={(e) => setFormState({ ...formState, waveMerchantPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Génère automatiquement les liens de paiement Wave pour les parents</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Numéro Marchand Orange Money (+221)</label>
              <input
                type="text"
                value={formState.omMerchantPhone}
                onChange={(e) => setFormState({ ...formState, omMerchantPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Numéro utilisé sur les avis de relance SMS et WhatsApp</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Année Scolaire Active</label>
              <input
                type="text"
                value={formState.academicYear}
                onChange={(e) => setFormState({ ...formState, academicYear: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Jour limite de paiement mensuel</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={formState.monthlyDueDay}
                  onChange={(e) => setFormState({ ...formState, monthlyDueDay: e.target.value })}
                  className="w-24 px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
                <span className="text-xs text-slate-500">de chaque mois (Ex: le 10)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};
