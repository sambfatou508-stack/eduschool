import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  FileText, 
  CreditCard, 
  Printer, 
  Download,
  School,
  Sparkles
} from 'lucide-react';
import { Student } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface EnrollmentWizardProps {
  onSuccess: (newStudent: Student) => void;
  onCancel: () => void;
}

export const EnrollmentWizard: React.FC<EnrollmentWizardProps> = ({
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2014-04-12',
    placeOfBirth: 'Dakar',
    gender: 'M' as 'M' | 'F',
    address: 'Sicap Liberté 2, Dakar',
    nationality: 'Sénégalaise',
    parentFirstName: 'El Hadji',
    parentLastName: '',
    parentPhone: '+221 77 540 33 21',
    parentEmail: 'parent@gmail.com',
    parentProfession: 'Commerçant',
    className: '6ème A',
    level: 'Collège',
    annualFee: 225000,
    registrationFee: 25000,
    paymentMethod: 'WAVE',
    transactionRef: 'WV-SN-84920'
  });

  const [generatedMatricule, setGeneratedMatricule] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName)) {
      alert('Veuillez renseigner le prénom et le nom de l\'élève.');
      return;
    }
    if (step === 2 && !formData.parentPhone) {
      alert('Le numéro de téléphone du parent est obligatoire pour le suivi.');
      return;
    }
    if (step === 5) {
      // Generate matricule
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const matricule = `EDS-2026-${randNum}`;
      setGeneratedMatricule(matricule);
      setStep(6);
      return;
    }
    setStep(step + 1);
  };

  const handleFinalize = () => {
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      matricule: generatedMatricule,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      placeOfBirth: formData.placeOfBirth,
      gender: formData.gender,
      address: formData.address,
      nationality: formData.nationality,
      classId: 'cls-6a',
      className: formData.className,
      level: formData.level,
      academicYear: '2026-2027',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'ACTIF',
      parentId: `par-${Date.now()}`,
      parentName: `${formData.parentFirstName} ${formData.parentLastName || formData.lastName}`,
      parentPhone: formData.parentPhone,
      annualFee: formData.annualFee,
      paidFee: formData.registrationFee,
      remainingFee: formData.annualFee - formData.registrationFee,
      attendanceRate: 100,
      averageGrade: 14.0
    };

    setIsCompleted(true);
    onSuccess(newStudent);
  };

  const steps = [
    { num: 1, label: 'Élève' },
    { num: 2, label: 'Parents' },
    { num: 3, label: 'Dossier' },
    { num: 4, label: 'Classe' },
    { num: 5, label: 'Frais' },
    { num: 6, label: 'Confirmation' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Procédure d'Inscription 2026-2027
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dossier d'admission et génération automatique du matricule officiel
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Annuler
        </button>
      </div>

      {/* Stepper progress */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.num 
                      ? 'bg-emerald-600 text-white' 
                      : step === s.num 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 hidden sm:block">
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-1 transition-all ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} 
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Étape 1 : État Civil de l'Élève
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prénom(s) *</label>
                <input
                  type="text"
                  placeholder="Ex: Seydou"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  placeholder="Ex: Diallo"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lieu de naissance</label>
                <input
                  type="text"
                  placeholder="Ex: Dakar, Thiès, Saint-Louis..."
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sexe</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nationalité</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Adresse complète de résidence</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Étape 2 : Parent ou Tuteur Responsable
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prénom du tuteur</label>
                <input
                  type="text"
                  value={formData.parentFirstName}
                  onChange={(e) => setFormData({ ...formData, parentFirstName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom de famille</label>
                <input
                  type="text"
                  placeholder={formData.lastName || 'Nom'}
                  value={formData.parentLastName}
                  onChange={(e) => setFormData({ ...formData, parentLastName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone Principal (+221) *</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profession</label>
                <input
                  type="text"
                  value={formData.parentProfession}
                  onChange={(e) => setFormData({ ...formData, parentProfession: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Étape 3 : Pièces Justificatives Déposées
            </h2>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded-sm" />
                <span className="font-semibold text-slate-800">Extrait de naissance récent (- 3 mois)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded-sm" />
                <span className="font-semibold text-slate-800">Certificat de scolarité ou radiation école précédente</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded-sm" />
                <span className="font-semibold text-slate-800">2 photos d'identité récentes</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded-sm" />
                <span className="font-semibold text-slate-800">Carnet de vaccination à jour</span>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Étape 4 : Affectation de Classe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classe d'inscription</label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden font-bold"
                >
                  <option value="6ème A">6ème A (Collège)</option>
                  <option value="6ème B">6ème B (Collège)</option>
                  <option value="5ème A">5ème A (Collège)</option>
                  <option value="4ème A">4ème A (Collège)</option>
                  <option value="3ème A">3ème A (BFEM)</option>
                  <option value="Seconde S">Seconde S (Lycée)</option>
                  <option value="Première S2">Première S2 (Lycée)</option>
                  <option value="Terminale S2">Terminale S2 (BAC)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Régime</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden">
                  <option>Externe</option>
                  <option>Demi-pensionnaire (Cantine)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Étape 5 : Frais d'Inscription & Premier Règlement (FCFA)
            </h2>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between font-medium">
                <span>Frais d'inscription & assurance :</span>
                <span className="font-bold">{formatFCFA(formData.registrationFee)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Scolarité annuelle totale :</span>
                <span className="font-bold">{formatFCFA(formData.annualFee)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mode de règlement</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden font-semibold"
                >
                  <option value="WAVE">Wave Mobile Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="ESPECES">Espèces à la caisse</option>
                  <option value="VIREMENT">Virement bancaire</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Référence transaction / reçu</label>
                <input
                  type="text"
                  value={formData.transactionRef}
                  onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Dossier Prêt pour Validation Officielle
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Le matricule unique ci-dessous sera définitivement attribué à l'élève pour tout son cursus scolaire.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white inline-block px-8 py-3 shadow-lg">
              <span className="text-xs text-blue-300 block uppercase font-bold tracking-wider">Matricule Généré</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{generatedMatricule}</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs text-left max-w-md mx-auto space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Élève :</span>
                <span className="font-bold text-slate-800">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Classe :</span>
                <span className="font-bold text-slate-800">{formData.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parent / Tuteur :</span>
                <span className="font-bold text-slate-800">{formData.parentPhone}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Montant Encaissé :</span>
                <span className="font-bold text-emerald-700">{formatFCFA(formData.registrationFee)} ({formData.paymentMethod})</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          {step > 1 && step < 6 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : <div />}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg transition-all mx-auto cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Valider & Imprimer Quittance Officielle</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
