import React, { useState } from 'react';
import { 
  FolderArchive, 
  FileText, 
  Printer, 
  Download, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  User, 
  Calendar,
  Eye,
  FileCheck,
  Loader2
} from 'lucide-react';
import { School, Student } from '../../types';
import { exportElementToPdf } from '../../utils/printUtils';
import { generateDocumentPdf } from '../../utils/pdfGenerators';

interface DocumentsModuleProps {
  school: School;
  students: Student[];
}

type DocumentType = 
  | 'CERTIFICAT_SCOLARITE' 
  | 'ATTESTATION_INSCRIPTION' 
  | 'CERTIFICAT_RADIATION' 
  | 'ATTESTATION_SOLDE';

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ school, students }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [docType, setDocType] = useState<DocumentType>('CERTIFICAT_SCOLARITE');
  const [searchStudent, setSearchStudent] = useState('');
  const [includeSeal, setIncludeSeal] = useState(true);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.matricule.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.className.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const todayStr = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);

  const handlePrint = () => {
    generateDocumentPdf(docType, selectedStudent, school, includeSeal);
    setPdfNotice('Document officiel généré en PDF et prêt pour impression !');
    setTimeout(() => setPdfNotice(null), 5000);
    try {
      window.print();
    } catch {
      // Ignored if sandbox blocks window.print
    }
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    setPdfNotice(null);
    try {
      const ok = generateDocumentPdf(docType, selectedStudent, school, includeSeal);
      if (ok) {
        setPdfNotice('Document officiel exporté en PDF avec succès !');
        setTimeout(() => setPdfNotice(null), 5000);
      }
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-blue-600" />
            Documents Administratifs & Actes Scolaires
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Émission instantanée de certificats officiels, attestations et documents scellés
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
            title="Lancer l'impression"
          >
            <Printer className="w-4 h-4" />
            Imprimer le document
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            title="Télécharger directement en PDF A4"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Export PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {pdfNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pdfNotice}</span>
        </div>
      )}

      {/* Main Grid: Controls + Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left column: Selection & Settings (4 cols) - Hidden on print */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Document Type Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Type de document à générer
            </label>
            <div className="space-y-2">
              {[
                { type: 'CERTIFICAT_SCOLARITE' as DocumentType, label: 'Certificat de Scolarité', desc: 'Atteste l\'assiduité régulière pour l\'année' },
                { type: 'ATTESTATION_INSCRIPTION' as DocumentType, label: 'Attestation d\'Inscription', desc: 'Preuve officielle d\'admission et de paiement' },
                { type: 'CERTIFICAT_RADIATION' as DocumentType, label: 'Certificat de Radiation', desc: 'Indispensable pour transfert d\'établissement' },
                { type: 'ATTESTATION_SOLDE' as DocumentType, label: 'Attestation de Non-Dette', desc: 'Certifie la régularité totale des paiements' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setDocType(item.type)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    docType === item.type
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{item.label}</span>
                    {docType === item.type && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Student Selector with Quick Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Sélectionner l'élève concerné
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Chercher élève ou matricule..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    selectedStudent?.id === st.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{st.firstName} {st.lastName}</p>
                    <p className="text-[11px] text-slate-500">{st.className} • {st.matricule}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                    {st.remainingFee === 0 ? 'À jour' : `${st.remainingFee.toLocaleString('fr-FR')} F`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Document Security Options */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Apposer le sceau et signature</span>
              <input
                type="checkbox"
                checked={includeSeal}
                onChange={(e) => setIncludeSeal(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Inclut le cachet numérique certifié de la Direction et la référence régalienne.
            </p>
          </div>
        </div>

        {/* Right column: Document Official Preview (8 cols) */}
        <div className="lg:col-span-8 print:w-full">
          <div 
            id="official-school-document" 
            className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 min-h-[680px] flex flex-col justify-between relative overflow-hidden printable-sheet"
          >
            {/* Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-9xl font-black rotate-[-30deg]">OFFICIEL</span>
            </div>

            {/* Official Header */}
            <div>
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <p className="text-[11px] uppercase font-bold tracking-widest text-slate-600">
                  RÉPUBLIQUE DU SÉNÉGAL
                </p>
                <p className="text-[10px] text-slate-500">
                  Un Peuple — Un But — Une Foi
                </p>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  MINISTÈRE DE L'ÉDUCATION NATIONALE
                </p>
                <p className="text-[10px] text-slate-500">
                  Inspection d'Académie de Dakar • IEF Almadies
                </p>
              </div>

              {/* School Info */}
              <div className="flex justify-between items-start mt-6 pt-2">
                <div>
                  <h2 className="font-black text-lg text-slate-900 tracking-tight">{school.name}</h2>
                  <p className="text-xs text-slate-600">{school.address} • {school.city}</p>
                  <p className="text-xs text-slate-600">Tél : {school.phone} • Email : {school.email}</p>
                  <p className="text-xs font-mono font-semibold text-blue-700 mt-1">Code Établissement : {school.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Fait à {school.city},</p>
                  <p className="text-xs font-bold text-slate-900">{todayStr}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Réf : {docType.substring(0, 3)}/{new Date().getFullYear()}/0842</p>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="my-10 text-center">
                <h1 className="inline-block px-8 py-3 rounded-xl bg-slate-100 text-slate-900 font-black text-xl tracking-wider uppercase border border-slate-300">
                  {docType === 'CERTIFICAT_SCOLARITE' && 'CERTIFICAT DE SCOLARITÉ'}
                  {docType === 'ATTESTATION_INSCRIPTION' && 'ATTESTATION D\'INSCRIPTION'}
                  {docType === 'CERTIFICAT_RADIATION' && 'CERTIFICAT DE RADIATION'}
                  {docType === 'ATTESTATION_SOLDE' && 'ATTESTATION DE RÈGLEMENT & NON-DETTE'}
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-2">
                  Année Scolaire {school.academicYear}
                </p>
              </div>

              {/* Document Body Text */}
              {selectedStudent && (
                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-800 text-justify">
                  <p>
                    Le Directeur de l'établissement soussigné certifie par la présente que l'élève :
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Prénom(s) et Nom :</span>
                      <span className="font-black text-slate-900 text-base">
                        {selectedStudent.firstName} {selectedStudent.lastName.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Matricule National :</span>
                      <span className="font-mono font-bold text-blue-700">{selectedStudent.matricule}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Date et lieu de naissance :</span>
                      <span className="font-semibold">{selectedStudent.dateOfBirth} à {selectedStudent.placeOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Classe & Cycle :</span>
                      <span className="font-bold text-slate-900">{selectedStudent.className} ({selectedStudent.level})</span>
                    </div>
                  </div>

                  {docType === 'CERTIFICAT_SCOLARITE' && (
                    <p>
                      Est régulièrement inscrit(e) sur les registres de l'établissement et suit assidûment les cours dispensés durant l'année scolaire <strong>{school.academicYear}</strong>.
                      Sa conduite et son assiduité générale sont jugées satisfaisantes.
                    </p>
                  )}

                  {docType === 'ATTESTATION_INSCRIPTION' && (
                    <p>
                      A accompli avec succès toutes les formalités d'inscription administrative et pédagogique pour la classe de <strong>{selectedStudent.className}</strong>. Le dossier scolaire a été vérifié et archivé conformément aux directives du Ministère.
                    </p>
                  )}

                  {docType === 'CERTIFICAT_RADIATION' && (
                    <p>
                      A quitté définitivement l'établissement en date de ce jour pour convenance familiale ou changement d'académie. L'élève est quitte de toute obligation matérielle et financière envers l'établissement à ce jour.
                    </p>
                  )}

                  {docType === 'ATTESTATION_SOLDE' && (
                    <p>
                      A intégralement honoré les frais de scolarité, droits d'inscription et charges associées pour la période considérée de l'année scolaire <strong>{school.academicYear}</strong>. Aucune dette n'est enregistrée au grand livre de l'économat.
                    </p>
                  )}

                  <p className="pt-2">
                    En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit auprès des administrations, consulats, ou organismes compétents.
                  </p>
                </div>
              )}
            </div>

            {/* Document Signature & Official Stamp */}
            <div className="pt-12 mt-8 border-t border-slate-200 grid grid-cols-2 gap-8 items-end">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-semibold">Le Secrétaire Général,</p>
                <div className="h-16 flex items-center">
                  <p className="font-serif italic text-sm text-slate-600">Pour ordre et enregistrement</p>
                </div>
                <p className="text-xs font-bold text-slate-800">M. Ibrahima Diagne</p>
              </div>

              <div className="text-right space-y-2">
                <p className="text-xs text-slate-500 font-semibold">Le Directeur de l'Établissement,</p>
                <div className="h-16 flex items-center justify-end">
                  {includeSeal && (
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-600 text-blue-700 flex flex-col items-center justify-center text-[9px] font-bold uppercase leading-tight rotate-[-12deg] p-1 bg-blue-50/50">
                      <span>RÉPUBLIQUE DU SÉNÉGAL</span>
                      <ShieldCheck className="w-4 h-4 my-0.5 text-blue-600" />
                      <span>{school.logoText} • DIRECTION</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900">Dr. Cheikh Tidiane Wade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
