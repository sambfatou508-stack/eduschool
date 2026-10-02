import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Database, 
  Users, 
  Award, 
  HeartHandshake, 
  GraduationCap, 
  CalendarDays, 
  UserCheck, 
  CreditCard,
  FileText,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  Student, 
  GradeEntry, 
  Parent, 
  Teacher, 
  TimetableSlot, 
  AttendanceRecord, 
  PaymentRecord, 
  SchoolClass,
  School
} from '../../types';

export type ImportCategory = 
  | 'ELEVES' 
  | 'NOTES' 
  | 'PARENTS' 
  | 'ENSEIGNANTS' 
  | 'EMPLOI_DU_TEMPS' 
  | 'PRESENCES' 
  | 'PAIEMENTS';

interface DataImportModuleProps {
  school: School;
  initialCategory?: ImportCategory;
  students: Student[];
  onImportStudents: (newStudents: Student[]) => void;
  onImportGrades: (newGrades: GradeEntry[]) => void;
  onImportParents: (newParents: Parent[]) => void;
  onImportTeachers: (newTeachers: Teacher[]) => void;
  onImportTimetable: (newSlots: TimetableSlot[]) => void;
  onImportAttendance: (newRecords: AttendanceRecord[]) => void;
  onImportPayments: (newPayments: PaymentRecord[]) => void;
}

export const DataImportModule: React.FC<DataImportModuleProps> = ({
  school,
  initialCategory = 'ELEVES',
  students,
  onImportStudents,
  onImportGrades,
  onImportParents,
  onImportTeachers,
  onImportTimetable,
  onImportAttendance,
  onImportPayments,
}) => {
  const [activeCategory, setActiveCategory] = useState<ImportCategory>(initialCategory);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: { id: ImportCategory; label: string; icon: any; desc: string }[] = [
    { id: 'ELEVES', label: 'Élèves', icon: Users, desc: 'Inscriptions massives, classes, matricules' },
    { id: 'NOTES', label: 'Notes & Évaluations', icon: Award, desc: 'Devoirs, compositions, moyennes' },
    { id: 'PARENTS', label: 'Parents / Tuteurs', icon: HeartHandshake, desc: 'Contacts WhatsApp, domiciles, professions' },
    { id: 'ENSEIGNANTS', label: 'Enseignants', icon: GraduationCap, desc: 'Corps professoral, matières, téléphones' },
    { id: 'EMPLOI_DU_TEMPS', label: 'Emploi du temps', icon: CalendarDays, desc: 'Créneaux horaires, salles, cours' },
    { id: 'PRESENCES', label: 'Présences', icon: UserCheck, desc: 'Pointages journaliers, retards, absences' },
    { id: 'PAIEMENTS', label: 'Paiements', icon: CreditCard, desc: 'Règlements de scolarité Wave, OM, espèces' },
  ];

  // Helper template generators
  const getTemplateData = (cat: ImportCategory) => {
    switch (cat) {
      case 'ELEVES':
        return [
          {
            Prenom: 'Moussa',
            Nom: 'Diagne',
            Sexe: 'M',
            DateNaissance: '2012-04-15',
            LieuNaissance: 'Dakar',
            Classe: '6ème A',
            Cycle: 'Collège',
            Adresse: 'Grand Yoff, Dakar',
            NomParent: 'Alioune Diagne',
            TelephoneParent: '+221 77 123 45 67',
            FraisScolarite: 225000,
            FraisPayes: 100000
          },
          {
            Prenom: 'Awa',
            Nom: 'Sow',
            Sexe: 'F',
            DateNaissance: '2011-09-22',
            LieuNaissance: 'Thiès',
            Classe: '5ème A',
            Cycle: 'Collège',
            Adresse: 'Sacré-Cœur 3',
            NomParent: 'Khady Sow',
            TelephoneParent: '+221 78 456 78 90',
            FraisScolarite: 225000,
            FraisPayes: 225000
          }
        ];
      case 'NOTES':
        return [
          {
            MatriculeEleve: 'EDS-2026-0842',
            NomEleve: 'Amadou Ndiaye',
            Classe: '6ème A',
            Matiere: 'Mathématiques',
            TypeEvaluation: 'DEVOIR_1',
            NoteSur20: 16.5,
            Coefficient: 4,
            Trimestre: 'TRIMESTRE_1',
            Appreciation: 'Très bon travail, régulier'
          },
          {
            MatriculeEleve: 'EDS-2026-0843',
            NomEleve: 'Fatou Diop',
            Classe: '6ème A',
            Matiere: 'Français',
            TypeEvaluation: 'COMPOSITION',
            NoteSur20: 15.0,
            Coefficient: 5,
            Trimestre: 'TRIMESTRE_1',
            Appreciation: 'Excellente rédaction'
          }
        ];
      case 'PARENTS':
        return [
          {
            Prenom: 'Mamadou',
            Nom: 'Faye',
            Telephone: '+221 77 888 99 00',
            WhatsApp: '+221 77 888 99 00',
            Email: 'm.faye@gmail.com',
            Profession: 'Commerçant',
            Adresse: 'Médina, Dakar',
            MatriculeEnfant: 'EDS-2026-0842'
          },
          {
            Prenom: 'Aminata',
            Nom: 'Toure',
            Telephone: '+221 76 111 22 33',
            WhatsApp: '+221 76 111 22 33',
            Email: 'aminata.toure@orange.sn',
            Profession: 'Enseignante',
            Adresse: 'Point E, Dakar',
            MatriculeEnfant: 'EDS-2026-0843'
          }
        ];
      case 'ENSEIGNANTS':
        return [
          {
            Matricule: 'ENS-2026-01',
            Prenom: 'Cheikh',
            Nom: 'Fall',
            Matiere: 'Mathématiques',
            Telephone: '+221 77 555 44 33',
            Email: 'cheikh.fall@edu-school.sn',
            Classes: '6ème A, 5ème A, Terminale S2',
            HeuresHebdo: 18,
            ProfPrincipalDe: 'Terminale S2'
          },
          {
            Matricule: 'ENS-2026-02',
            Prenom: 'Aïda',
            Nom: 'Gueye',
            Matiere: 'Français',
            Telephone: '+221 78 222 33 44',
            Email: 'aida.gueye@edu-school.sn',
            Classes: '4ème A, 3ème A',
            HeuresHebdo: 16,
            ProfPrincipalDe: '4ème A'
          }
        ];
      case 'EMPLOI_DU_TEMPS':
        return [
          {
            Jour: 'Lundi',
            CreneauHoraire: '08h00 - 10h00',
            Classe: '6ème A',
            Matiere: 'Mathématiques',
            Professeur: 'M. Cheikh Fall',
            Salle: 'Salle 101'
          },
          {
            Jour: 'Lundi',
            CreneauHoraire: '10h15 - 12h15',
            Classe: '6ème A',
            Matiere: 'Français',
            Professeur: 'Mme Aïda Gueye',
            Salle: 'Salle 101'
          },
          {
            Jour: 'Mardi',
            CreneauHoraire: '08h00 - 10h00',
            Classe: 'Terminale S2',
            Matiere: 'Sciences Physiques',
            Professeur: 'Dr. Cheikh Tidiane Wade',
            Salle: 'Labo 1'
          }
        ];
      case 'PRESENCES':
        return [
          {
            Date: new Date().toISOString().split('T')[0],
            MatriculeEleve: 'EDS-2026-0842',
            NomEleve: 'Amadou Ndiaye',
            Classe: '6ème A',
            Heure: '08h00',
            Statut: 'PRESENT',
            Commentaire: 'À l\'heure'
          },
          {
            Date: new Date().toISOString().split('T')[0],
            MatriculeEleve: 'EDS-2026-0843',
            NomEleve: 'Fatou Diop',
            Classe: '6ème A',
            Heure: '08h15',
            Statut: 'RETARD',
            MinutesRetard: 15,
            Commentaire: 'Problème de transport'
          }
        ];
      case 'PAIEMENTS':
        return [
          {
            MatriculeEleve: 'EDS-2026-0842',
            NomEleve: 'Amadou Ndiaye',
            Classe: '6ème A',
            MontantFCFA: 50000,
            ModePaiement: 'WAVE',
            ReferenceTransaction: 'WAVE-DKR-9842',
            MoisOuMotif: 'Octobre 2026',
            Caissier: 'Comptable Principal'
          },
          {
            MatriculeEleve: 'EDS-2026-0843',
            NomEleve: 'Fatou Diop',
            Classe: '6ème A',
            MontantFCFA: 35000,
            ModePaiement: 'ORANGE_MONEY',
            ReferenceTransaction: 'OM-SN-7723',
            MoisOuMotif: 'Octobre 2026',
            Caissier: 'Comptable Principal'
          }
        ];
      default:
        return [];
    }
  };

  // Download Sample Template (Excel or CSV)
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    const data = getTemplateData(activeCategory);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modele');

    const filePrefix = `modele_${activeCategory.toLowerCase()}_edu_school`;
    if (format === 'xlsx') {
      XLSX.writeFile(workbook, `${filePrefix}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `${filePrefix}.csv`, { bookType: 'csv' });
    }
  };

  // File parsing (supports .xlsx, .xls, .csv)
  const processFile = (file: File) => {
    setErrorMsg(null);
    setSuccessCount(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          setErrorMsg("Le fichier sélectionné est vide ou ne contient aucune ligne de données.");
          setParsedData([]);
          return;
        }

        setParsedData(json);
      } catch (err: any) {
        setErrorMsg("Impossible de lire ce fichier. Veuillez utiliser un format Excel (.xlsx, .xls) ou CSV valide.");
        setParsedData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Execute Import
  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;

    try {
      if (activeCategory === 'ELEVES') {
        const newStudents: Student[] = parsedData.map((row, idx) => {
          const annualFee = Number(row.FraisScolarite || row['Frais Scolarité'] || 225000);
          const paidFee = Number(row.FraisPayes || row['Frais Payés'] || 0);
          const matricule = row.Matricule || `EDS-2026-0${850 + idx}`;
          const firstName = row.Prenom || row['Prénom'] || `Élève ${idx + 1}`;
          const lastName = row.Nom || 'Inconnu';
          const className = row.Classe || '6ème A';

          return {
            id: `stu-import-${Date.now()}-${idx}`,
            matricule,
            firstName,
            lastName,
            dateOfBirth: row.DateNaissance || row['Date de naissance'] || '2013-01-01',
            placeOfBirth: row.LieuNaissance || row['Lieu de naissance'] || 'Dakar',
            gender: (row.Sexe === 'F' || row.Genre === 'F') ? 'F' : 'M',
            address: row.Adresse || 'Dakar',
            nationality: row.Nationalite || 'Sénégalaise',
            classId: `cls-${className.toLowerCase().replace(/\s+/g, '')}`,
            className,
            level: row.Cycle || (className.includes('Terminale') || className.includes('Première') || className.includes('Seconde') ? 'Lycée' : 'Collège'),
            academicYear: school.academicYear || '2026-2027',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'ACTIF',
            parentId: `par-import-${idx}`,
            parentName: row.NomParent || row['Nom Parent'] || `${firstName} Parent`,
            parentPhone: row.TelephoneParent || row['Téléphone Parent'] || '+221 77 000 00 00',
            annualFee,
            paidFee,
            remainingFee: Math.max(0, annualFee - paidFee),
            attendanceRate: 95,
            averageGrade: 12.5
          };
        });

        onImportStudents(newStudents);
        setSuccessCount(newStudents.length);
      } 
      else if (activeCategory === 'NOTES') {
        const newGrades: GradeEntry[] = parsedData.map((row, idx) => {
          const score = Number(row.NoteSur20 || row.Note || row['Note /20'] || 10);
          const coef = Number(row.Coefficient || row.Coef || 2);
          const rawType = (row.TypeEvaluation || row.Type || 'DEVOIR_1').toUpperCase();
          const validTypes = ['DEVOIR_1', 'DEVOIR_2', 'COMPOSITION', 'INTERROGATION'];
          const evaluationType = validTypes.includes(rawType) ? (rawType as any) : 'DEVOIR_1';

          return {
            id: `grd-import-${Date.now()}-${idx}`,
            studentId: row.MatriculeEleve || `stu-${idx}`,
            studentName: row.NomEleve || row['Nom Élève'] || `Élève ${idx + 1}`,
            subjectName: row.Matiere || row['Matière'] || 'Français',
            evaluationType,
            score: Math.min(20, Math.max(0, score)),
            coefficient: coef,
            period: (row.Trimestre || 'TRIMESTRE_1') as any,
            date: row.Date || new Date().toISOString().split('T')[0],
            teacherComment: row.Appreciation || row['Appréciation'] || 'Enregistré via import de fichier'
          };
        });

        onImportGrades(newGrades);
        setSuccessCount(newGrades.length);
      }
      else if (activeCategory === 'PARENTS') {
        const newParents: Parent[] = parsedData.map((row, idx) => ({
          id: `par-import-${Date.now()}-${idx}`,
          firstName: row.Prenom || row['Prénom'] || 'Parent',
          lastName: row.Nom || 'Tuteur',
          phone: row.Telephone || row['Téléphone'] || '+221 77 000 00 00',
          whatsapp: row.WhatsApp || row.Telephone || '+221 77 000 00 00',
          email: row.Email || 'parent@edu-school.sn',
          profession: row.Profession || 'Salarié',
          address: row.Adresse || 'Dakar',
          studentIds: row.MatriculeEnfant ? [row.MatriculeEnfant] : []
        }));

        onImportParents(newParents);
        setSuccessCount(newParents.length);
      }
      else if (activeCategory === 'ENSEIGNANTS') {
        const newTeachers: Teacher[] = parsedData.map((row, idx) => ({
          id: `tea-import-${Date.now()}-${idx}`,
          matricule: row.Matricule || `ENS-2026-${10 + idx}`,
          firstName: row.Prenom || row['Prénom'] || 'Professeur',
          lastName: row.Nom || 'Enseignant',
          phone: row.Telephone || row['Téléphone'] || '+221 77 000 00 00',
          email: row.Email || 'prof@edu-school.sn',
          specialty: row.Matiere || row['Matière'] || 'Général',
          subjects: [row.Matiere || row['Matière'] || 'Général'],
          weeklyHours: Number(row.HeuresHebdo || 18),
          status: 'ACTIF',
          isMainTeacherFor: row.ProfPrincipalDe || undefined
        }));

        onImportTeachers(newTeachers);
        setSuccessCount(newTeachers.length);
      }
      else if (activeCategory === 'EMPLOI_DU_TEMPS') {
        const newSlots: TimetableSlot[] = parsedData.map((row, idx) => ({
          id: `slot-import-${Date.now()}-${idx}`,
          day: (row.Jour || 'Lundi') as any,
          timeSlot: row.CreneauHoraire || row['Créneau Horaire'] || '08h00 - 10h00',
          className: row.Classe || '6ème A',
          subject: row.Matiere || row['Matière'] || 'Mathématiques',
          teacherName: row.Professeur || 'M. Fall',
          room: row.Salle || 'Salle 101'
        }));

        onImportTimetable(newSlots);
        setSuccessCount(newSlots.length);
      }
      else if (activeCategory === 'PRESENCES') {
        const newAttendance: AttendanceRecord[] = parsedData.map((row, idx) => {
          const rawStatus = (row.Statut || 'PRESENT').toUpperCase();
          const validStatus = ['PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE'];
          const status = validStatus.includes(rawStatus) ? (rawStatus as any) : 'PRESENT';

          return {
            id: `att-import-${Date.now()}-${idx}`,
            studentId: row.MatriculeEleve || `stu-${idx}`,
            studentName: row.NomEleve || row['Nom Élève'] || 'Élève',
            classId: row.Classe || '6ème A',
            date: row.Date || new Date().toISOString().split('T')[0],
            hour: row.Heure || '08h00',
            status,
            minutesLate: Number(row.MinutesRetard || 0),
            comment: row.Commentaire || 'Pointage importé'
          };
        });

        onImportAttendance(newAttendance);
        setSuccessCount(newAttendance.length);
      }
      else if (activeCategory === 'PAIEMENTS') {
        const newPayments: PaymentRecord[] = parsedData.map((row, idx) => {
          const amount = Number(row.MontantFCFA || row.Montant || 25000);
          const rawMethod = (row.ModePaiement || row.Mode || 'WAVE').toUpperCase();
          const validMethods = ['WAVE', 'ORANGE_MONEY', 'ESPECES', 'VIREMENT', 'CHEQUE'];
          const method = validMethods.includes(rawMethod) ? (rawMethod as any) : 'WAVE';

          return {
            id: `pay-import-${Date.now()}-${idx}`,
            receiptNumber: `REC-2026-IMP-${100 + idx}`,
            studentId: row.MatriculeEleve || `stu-${idx}`,
            studentName: row.NomEleve || row['Nom Élève'] || 'Élève Rattaché',
            className: row.Classe || '6ème A',
            amount,
            method,
            reference: row.ReferenceTransaction || row.Reference || `TRX-${Date.now()}-${idx}`,
            period: row.MoisOuMotif || row.Motif || 'Mensualité',
            date: row.Date || new Date().toISOString().split('T')[0],
            cashierName: row.Caissier || 'Agent Économat',
            status: 'VALIDE'
          };
        });

        onImportPayments(newPayments);
        setSuccessCount(newPayments.length);
      }

      setParsedData([]);
      setFileName(null);
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de l'enregistrement des données. Vérifiez la concordance des colonnes.");
    }
  };

  const handleReset = () => {
    setParsedData([]);
    setFileName(null);
    setErrorMsg(null);
    setSuccessCount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentCategoryObj = categories.find(c => c.id === activeCategory)!;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Centre d'Importation Automatique de Données
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Intégrez rapidement vos listes complètes via fichiers Excel (.xlsx, .xls) ou CSV
          </p>
        </div>

        {/* Templates Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadTemplate('xlsx')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
            title="Télécharger le modèle Excel pré-formaté"
          >
            <Download className="w-3.5 h-3.5" />
            Modèle Excel (.xlsx)
          </button>
          <button
            onClick={() => handleDownloadTemplate('csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold border border-slate-200 transition-colors"
            title="Télécharger le modèle CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Modèle CSV
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successCount !== null && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">
              Importation réussie !
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {successCount} enregistrement(s) ont été automatiquement injectés et enregistrés dans le module <strong>{currentCategoryObj.label}</strong>.
            </p>
          </div>
          <button
            onClick={() => setSuccessCount(null)}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Erreur lors de l'analyse du fichier</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-rose-700 font-bold hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Category Pills Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                handleReset();
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </div>
              <div>
                <span className="font-bold text-xs block leading-tight">{cat.label}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Upload Zone (Drag & Drop + File Selector) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-8 sm:p-10 rounded-2xl border-2 border-dashed text-center transition-all bg-white ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-100' 
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Importer votre fichier pour les <span className="text-blue-600">{currentCategoryObj.label}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Glissez-déposez votre fichier ici, ou parcourez vos dossiers (formats acceptés : Excel .xlsx, .xls ou CSV)
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <label
              htmlFor="file-upload-input"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-sm transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Sélectionner un fichier
            </label>

            <button
              type="button"
              onClick={() => handleDownloadTemplate('xlsx')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Modèle vierge
            </button>
          </div>
        </div>
      </div>

      {/* Data Verification & Preview Table */}
      {parsedData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Aperçu des données prêtes à être importées ({parsedData.length} lignes détectées)
                </h3>
                <p className="text-xs text-slate-500">
                  Fichier analysé : <span className="font-mono font-semibold text-slate-700">{fileName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                Annuler
              </button>

              <button
                onClick={handleConfirmImport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmer l'enregistrement ({parsedData.length} éléments)
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="px-4 py-3">#</th>
                  {Object.keys(parsedData[0] || {}).map((col) => (
                    <th key={col} className="px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {parsedData.slice(0, 50).map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                    {Object.keys(parsedData[0] || {}).map((col) => (
                      <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedData.length > 50 && (
            <p className="text-[11px] text-slate-400 text-center italic">
              Affichage des 50 premières lignes sur {parsedData.length}. Toutes les lignes seront enregistrées.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
