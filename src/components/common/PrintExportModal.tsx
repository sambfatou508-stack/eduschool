import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { exportElementToPdf, isInIframe } from '../../utils/printUtils';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentName: string;
  targetElementId: string;
  landscape?: boolean;
  children?: React.ReactNode;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  title,
  documentName,
  targetElementId,
  landscape = false,
  children
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inIframe = isInIframe();

  if (!isOpen) return null;

  const handleBrowserPrint = () => {
    setErrorMessage(null);
    try {
      window.print();
    } catch (e) {
      console.error('Print failed:', e);
      setErrorMessage(
        "L'impression native a été bloquée par le navigateur (environnement sandbox). Utilisez le bouton 'Télécharger en PDF' ci-dessous pour obtenir le document directement."
      );
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setExportSuccess(false);

    try {
      const filename = `${documentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const success = await exportElementToPdf(targetElementId, {
        filename,
        orientation: landscape ? 'landscape' : 'portrait',
        scale: 2
      });

      if (success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      } else {
        setErrorMessage("Impossible de générer le PDF. Veuillez réessayer ou utiliser l'impression directe.");
      }
    } catch (err) {
      console.error('PDF export error:', err);
      setErrorMessage("Une erreur est survenue lors de la création du PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in print:hidden">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Impression officielle ou téléchargement en format PDF haute définition (A4)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative banner for embedded sandbox preview */}
        {inIframe && (
          <div className="mx-5 sm:mx-7 mt-4 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Information sur l'environnement de prévisualisation :
              </p>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                L'application s'exécute dans une iframe sandboxée où le navigateur peut restreindre la boîte de dialogue native <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">window.print()</code>.
                Pour garantir un résultat parfait, cliquez sur <strong>« Télécharger en PDF (A4) »</strong> ci-dessous ou ouvrez l'application dans un onglet dédié.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {exportSuccess && (
          <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Document PDF officiel téléchargé avec succès sur votre appareil !</span>
          </div>
        )}

        {/* Scrollable Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Aperçu de la page imprimable</span>
            <span className="text-slate-400">Format A4 {landscape ? 'Paysage' : 'Portrait'}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-4 sm:p-6 overflow-x-auto">
            {children}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Document certifié conforme aux normes scolaires du Sénégal</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer w-1/3 sm:w-auto text-center"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleBrowserPrint}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer w-1/3 sm:w-auto shadow-2xs"
              title="Lancer l'impression via le navigateur"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer w-1/3 sm:w-auto disabled:opacity-50"
            >
              {isExporting ? (
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
      </div>
    </div>
  );
};
