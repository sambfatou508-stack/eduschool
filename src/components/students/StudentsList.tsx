import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Eye, 
  Phone, 
  CreditCard, 
  GraduationCap, 
  Calendar, 
  X, 
  FileText, 
  FileSpreadsheet, 
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Award,
  TrendingUp,
  Printer,
  ChevronRight,
  Download,
  Check,
  School as SchoolIcon,
  Loader2
} from 'lucide-react';
import { Student, UserRole, Teacher } from '../../types';
import { formatFCFA, getGradeBadgeClass } from '../../utils/formatters';
import { INITIAL_CLASSES } from '../../data/mockData';
import { exportElementToPdf } from '../../utils/printUtils';

interface StudentsListProps {
  students: Student[];
  teacherClasses?: string[];
  initialClassFilter?: string;
  onClearClassFilter?: () => void;
  onOpenEnrollment: () => void;
  onOpenReportCard: (student: Student) => void;
  onOpenImport?: () => void;
  userRole?: UserRole;
  activeTeacher?: Teacher;
  allTeachers?: Teacher[];
  onSelectTeacher?: (teacherId: string) => void;
}

export type SchoolCycle = 'Primaire' | 'Collège' | 'Lycée';

export type SortField = 
  | 'CLASS' 
  | 'CATEGORY' 
  | 'NAME' 
  | 'FIRST_NAME' 
  | 'GRADE' 
  | 'ATTENDANCE' 
  | 'FEE' 
  | 'MATRICULE';

export type SortDirection = 'asc' | 'desc';

export type GroupingMode = 'NONE' | 'BY_CLASS' | 'BY_CATEGORY';

export type AcademicCategory = 'ALL' | 'EXCELLENCE' | 'BIEN' | 'PASSABLE' | 'DIFFICULTE';

// Helper: Determine school cycle / category for any student
export function getStudentCycle(student: Student): SchoolCycle {
  const lvl = (student.level || '').toLowerCase();
  if (lvl.includes('lycée') || lvl.includes('bac') || lvl.includes('secondaire')) return 'Lycée';
  if (lvl.includes('collège') || lvl.includes('bfem') || lvl.includes('moyen')) return 'Collège';
  if (lvl.includes('primaire') || lvl.includes('élémentaire')) return 'Primaire';

  const cls = (student.className || '').toLowerCase();
  if (cls.includes('terminale') || cls.includes('tle') || cls.includes('première') || cls.includes('1ère') || cls.includes('seconde') || cls.includes('2nde')) {
    return 'Lycée';
  }
  if (cls.includes('6ème') || cls.includes('5ème') || cls.includes('4ème') || cls.includes('3ème')) {
    return 'Collège';
  }
  if (cls.includes('ci') || cls.includes('cp') || cls.includes('ce1') || cls.includes('ce2') || cls.includes('cm1') || cls.includes('cm2')) {
    return 'Primaire';
  }
  return 'Collège';
}

// Helper: Pedagogical weight for natural Senegalese class ordering
export function getClassPedagogicalWeight(className: string): number {
  const lower = className.trim().toLowerCase();
  // Primaire
  if (lower.startsWith('ci')) return 10;
  if (lower.startsWith('cp')) return 20;
  if (lower.startsWith('ce1')) return 30;
  if (lower.startsWith('ce2')) return 40;
  if (lower.startsWith('cm1')) return 50;
  if (lower.startsWith('cm2')) return 60;
  // Collège
  if (lower.startsWith('6ème')) return 100 + (lower.includes('b') ? 2 : 1);
  if (lower.startsWith('5ème')) return 200 + (lower.includes('b') ? 2 : 1);
  if (lower.startsWith('4ème')) return 300 + (lower.includes('b') ? 2 : 1);
  if (lower.startsWith('3ème')) return 400 + (lower.includes('b') ? 2 : 1);
  // Lycée
  if (lower.startsWith('seconde') || lower.startsWith('2nde')) return 500 + (lower.includes('l') ? 2 : 1);
  if (lower.startsWith('première') || lower.startsWith('1ère')) return 600 + (lower.includes('s2') ? 2 : 1);
  if (lower.startsWith('terminale') || lower.startsWith('tle')) return 700 + (lower.includes('s2') ? 2 : 1);
  return 999;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  initialClassFilter = 'ALL',
  onClearClassFilter,
  onOpenEnrollment,
  onOpenReportCard,
  onOpenImport,
  userRole,
  activeTeacher,
  allTeachers,
  onSelectTeacher
}) => {
  const isTeacher = userRole === 'ENSEIGNANT';

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | SchoolCycle>('ALL');
  const [selectedClass, setSelectedClass] = useState(initialClassFilter);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');
  const [selectedAcademicCategory, setSelectedAcademicCategory] = useState<AcademicCategory>('ALL');

  // Sorting States
  const [sortBy, setSortBy] = useState<SortField>('CLASS');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Display Mode: Continuous List or Grouped by Class/Category
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('NONE');

  // Details Modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // "Sortir une classe" Modal State
  const [showExportClassModal, setShowExportClassModal] = useState(false);
  const [classToExport, setClassToExport] = useState<string>('6ème A');
  const [exportDocType, setExportDocType] = useState<'APPEL' | 'EFFECTIF' | 'BILAN'>('APPEL');

  // Synchronize when initialClassFilter changes from parent
  useEffect(() => {
    setSelectedClass(initialClassFilter || 'ALL');
    if (initialClassFilter && initialClassFilter !== 'ALL') {
      // Find matching student to set matching category if applicable
      const match = students.find(s => s.className === initialClassFilter);
      if (match) {
        setSelectedCategory(getStudentCycle(match));
      }
    }
  }, [initialClassFilter, students]);

  // Handle Class Change
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    if (newClass === 'ALL' && onClearClassFilter) {
      onClearClassFilter();
    }
  };

  // Handle Category Change (Filter classes matching that category)
  const handleCategoryChange = (category: 'ALL' | SchoolCycle) => {
    setSelectedCategory(category);
    if (category !== 'ALL' && selectedClass !== 'ALL') {
      // Check if selected class belongs to the new category
      const classBelongsToCategory = students.some(
        s => s.className === selectedClass && getStudentCycle(s) === category
      );
      if (!classBelongsToCategory) {
        setSelectedClass('ALL');
        if (onClearClassFilter) onClearClassFilter();
      }
    }
  };

  // Column header click sorting handler
  const handleSortColumnClick = (field: SortField) => {
    if (sortBy === field) {
      // Toggle direction
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      // Default to desc for metrics (grade, attendance, fee), asc for text
      if (field === 'GRADE' || field === 'ATTENDANCE' || field === 'FEE') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  // Reset all filters & sorting to default
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedClass('ALL');
    setSelectedPaymentStatus('ALL');
    setSelectedAcademicCategory('ALL');
    setSortBy('CLASS');
    setSortDirection('asc');
    setGroupingMode('NONE');
    if (onClearClassFilter) onClearClassFilter();
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: students.length, Primaire: 0, Collège: 0, Lycée: 0 };
    students.forEach(s => {
      const cycle = getStudentCycle(s);
      counts[cycle] = (counts[cycle] || 0) + 1;
    });
    return counts;
  }, [students]);

  // Available classes, optionally filtered by selected category
  const availableClasses = useMemo(() => {
    const filteredByCat = selectedCategory === 'ALL' 
      ? students 
      : students.filter(s => getStudentCycle(s) === selectedCategory);
    
    const map = new Map<string, { name: string; count: number; cycle: SchoolCycle }>();
    filteredByCat.forEach(s => {
      const cycle = getStudentCycle(s);
      if (!map.has(s.className)) {
        map.set(s.className, { name: s.className, count: 1, cycle });
      } else {
        map.get(s.className)!.count += 1;
      }
    });

    // Sort classes pedagogically
    return Array.from(map.values()).sort((a, b) => 
      getClassPedagogicalWeight(a.name) - getClassPedagogicalWeight(b.name)
    );
  }, [students, selectedCategory]);

  // All unique classes across all students & school registry
  const allUniqueClasses = useMemo(() => {
    const map = new Map<string, { name: string; count: number; cycle: SchoolCycle }>();
    students.forEach(s => {
      const cycle = getStudentCycle(s);
      if (!map.has(s.className)) {
        map.set(s.className, { name: s.className, count: 1, cycle });
      } else {
        map.get(s.className)!.count += 1;
      }
    });

    // Also ensure all registered classes from school structure appear even if empty (admin only)
    if (!isTeacher) {
      INITIAL_CLASSES.forEach(cls => {
        if (!map.has(cls.name)) {
          const cycle: SchoolCycle = cls.level.includes('Primaire') ? 'Primaire' : cls.level.includes('Lycée') ? 'Lycée' : 'Collège';
          map.set(cls.name, { name: cls.name, count: 0, cycle });
        }
      });
    }

    return Array.from(map.values()).sort((a, b) => 
      getClassPedagogicalWeight(a.name) - getClassPedagogicalWeight(b.name)
    );
  }, [students, isTeacher]);

  // Students belonging to selected class for export
  const classStudentsForExport = useMemo(() => {
    if (!classToExport) return [];
    return students
      .filter(s => s.className.toLowerCase() === classToExport.toLowerCase())
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'fr'));
  }, [students, classToExport]);

  // Metadata for current class to export
  const currentClassMeta = useMemo(() => {
    const found = INITIAL_CLASSES.find(c => c.name.toLowerCase() === classToExport.toLowerCase());
    const cycle = classStudentsForExport[0] 
      ? getStudentCycle(classStudentsForExport[0]) 
      : (found?.level.includes('Primaire') ? 'Primaire' : found?.level.includes('Lycée') ? 'Lycée' : 'Collège');
    return {
      mainTeacher: found?.mainTeacherName || 'M. Ousmane Diédhiou',
      room: found?.room || 'Bâtiment Principal - Salle 101',
      level: found?.level || cycle,
      cycle
    };
  }, [classToExport, classStudentsForExport]);

  // Gender counts for exported class
  const classGenderCounts = useMemo(() => {
    const boys = classStudentsForExport.filter(s => s.gender === 'M').length;
    const girls = classStudentsForExport.filter(s => s.gender === 'F').length;
    return { boys, girls, total: classStudentsForExport.length };
  }, [classStudentsForExport]);

  // CSV Export for class
  const handleExportClassCSV = () => {
    if (classStudentsForExport.length === 0) return;
    const headers = [
      'N°',
      'Matricule',
      'Nom',
      'Prénom',
      'Sexe',
      'Classe',
      'Cycle',
      'Date de Naissance',
      'Lieu de Naissance',
      'Parent / Tuteur',
      'Téléphone Parent',
      'Moyenne Générale (/20)',
      'Taux Assiduité (%)',
      'Scolarité Payée (FCFA)',
      'Reste à Payer (FCFA)'
    ];

    const rows = classStudentsForExport.map((s, idx) => [
      idx + 1,
      `"${s.matricule}"`,
      `"${s.lastName}"`,
      `"${s.firstName}"`,
      `"${s.gender}"`,
      `"${s.className}"`,
      `"${getStudentCycle(s)}"`,
      `"${s.dateOfBirth}"`,
      `"${s.placeOfBirth}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      s.averageGrade,
      `${s.attendanceRate}%`,
      s.paidFee,
      s.remainingFee
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Liste_Officielle_${classToExport.replace(/\s+/g, '_')}_2026-2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main filtered & sorted student list
  const filteredAndSortedStudents = useMemo(() => {
    // 1. Filter
    const list = students.filter(student => {
      const studentCycle = getStudentCycle(student);

      const matchesSearch = 
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentPhone.includes(searchTerm) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'ALL' || studentCycle === selectedCategory;

      const matchesClass = 
        selectedClass === 'ALL' || student.className === selectedClass;

      const matchesPayment = 
        selectedPaymentStatus === 'ALL' ||
        (selectedPaymentStatus === 'SOLDE' && student.remainingFee === 0) ||
        (selectedPaymentStatus === 'IMPAYE' && student.remainingFee > 0);

      const matchesAcademic = 
        selectedAcademicCategory === 'ALL' ||
        (selectedAcademicCategory === 'EXCELLENCE' && student.averageGrade >= 16) ||
        (selectedAcademicCategory === 'BIEN' && student.averageGrade >= 14 && student.averageGrade < 16) ||
        (selectedAcademicCategory === 'PASSABLE' && student.averageGrade >= 10 && student.averageGrade < 14) ||
        (selectedAcademicCategory === 'DIFFICULTE' && student.averageGrade < 10);

      return matchesSearch && matchesCategory && matchesClass && matchesPayment && matchesAcademic;
    });

    // 2. Sort
    return list.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'CLASS': {
          const weightA = getClassPedagogicalWeight(a.className);
          const weightB = getClassPedagogicalWeight(b.className);
          if (weightA !== weightB) {
            comparison = weightA - weightB;
          } else {
            // Secondary sort: Last Name
            comparison = a.lastName.localeCompare(b.lastName);
          }
          break;
        }
        case 'CATEGORY': {
          const cycleOrder: Record<SchoolCycle, number> = { 'Primaire': 1, 'Collège': 2, 'Lycée': 3 };
          const orderA = cycleOrder[getStudentCycle(a)];
          const orderB = cycleOrder[getStudentCycle(b)];
          if (orderA !== orderB) {
            comparison = orderA - orderB;
          } else {
            // Secondary sort: Class then Name
            const weightA = getClassPedagogicalWeight(a.className);
            const weightB = getClassPedagogicalWeight(b.className);
            if (weightA !== weightB) {
              comparison = weightA - weightB;
            } else {
              comparison = a.lastName.localeCompare(b.lastName);
            }
          }
          break;
        }
        case 'NAME': {
          comparison = a.lastName.localeCompare(b.lastName);
          if (comparison === 0) {
            comparison = a.firstName.localeCompare(b.firstName);
          }
          break;
        }
        case 'FIRST_NAME': {
          comparison = a.firstName.localeCompare(b.firstName);
          break;
        }
        case 'GRADE': {
          comparison = a.averageGrade - b.averageGrade;
          break;
        }
        case 'ATTENDANCE': {
          comparison = a.attendanceRate - b.attendanceRate;
          break;
        }
        case 'FEE': {
          comparison = a.remainingFee - b.remainingFee;
          break;
        }
        case 'MATRICULE': {
          comparison = a.matricule.localeCompare(b.matricule);
          break;
        }
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    students, 
    searchTerm, 
    selectedCategory, 
    selectedClass, 
    selectedPaymentStatus, 
    selectedAcademicCategory, 
    sortBy, 
    sortDirection
  ]);

  // Grouped structures if groupingMode !== 'NONE'
  const groupedByClass = useMemo(() => {
    if (groupingMode !== 'BY_CLASS') return [];
    const groupsMap = new Map<string, { className: string; cycle: SchoolCycle; students: Student[] }>();
    
    filteredAndSortedStudents.forEach(s => {
      if (!groupsMap.has(s.className)) {
        groupsMap.set(s.className, {
          className: s.className,
          cycle: getStudentCycle(s),
          students: [s]
        });
      } else {
        groupsMap.get(s.className)!.students.push(s);
      }
    });

    return Array.from(groupsMap.values()).sort((a, b) => {
      const weightA = getClassPedagogicalWeight(a.className);
      const weightB = getClassPedagogicalWeight(b.className);
      return sortDirection === 'asc' ? weightA - weightB : weightB - weightA;
    });
  }, [filteredAndSortedStudents, groupingMode, sortDirection]);

  const groupedByCategory = useMemo(() => {
    if (groupingMode !== 'BY_CATEGORY') return [];
    const order: SchoolCycle[] = ['Primaire', 'Collège', 'Lycée'];
    if (sortDirection === 'desc') order.reverse();

    return order.map(cycle => {
      const items = filteredAndSortedStudents.filter(s => getStudentCycle(s) === cycle);
      return {
        cycle,
        students: items
      };
    }).filter(g => g.students.length > 0);
  }, [filteredAndSortedStudents, groupingMode, sortDirection]);

  // Active filters count for reset badge
  const activeFiltersCount = 
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (selectedClass !== 'ALL' ? 1 : 0) +
    (selectedPaymentStatus !== 'ALL' ? 1 : 0) +
    (selectedAcademicCategory !== 'ALL' ? 1 : 0) +
    (searchTerm.trim() !== '' ? 1 : 0);

  // Cycle badge helper
  const getCycleBadge = (cycle: SchoolCycle) => {
    switch (cycle) {
      case 'Primaire':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Primaire
          </span>
        );
      case 'Collège':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Collège
          </span>
        );
      case 'Lycée':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Lycée
          </span>
        );
    }
  };

  // Sort label display helper
  const getSortLabel = () => {
    switch (sortBy) {
      case 'CLASS':
        return `Classe (${sortDirection === 'asc' ? 'Primaire → Lycée' : 'Lycée → Primaire'})`;
      case 'CATEGORY':
        return `Catégorie (${sortDirection === 'asc' ? 'Primaire → Lycée' : 'Lycée → Primaire'})`;
      case 'NAME':
        return `Nom (${sortDirection === 'asc' ? 'A → Z' : 'Z → A'})`;
      case 'FIRST_NAME':
        return `Prénom (${sortDirection === 'asc' ? 'A → Z' : 'Z → A'})`;
      case 'GRADE':
        return `Moyenne (${sortDirection === 'desc' ? 'Plus haute d\'abord' : 'Plus basse d\'abord'})`;
      case 'ATTENDANCE':
        return `Assiduité (${sortDirection === 'desc' ? 'Plus assidu d\'abord' : 'Moins assidu'})`;
      case 'FEE':
        return `Scolarité (${sortDirection === 'desc' ? 'Reste à payer le plus élevé' : 'Soldé d\'abord'})`;
      case 'MATRICULE':
        return `Matricule (${sortDirection === 'asc' ? 'Croissant' : 'Décroissant'})`;
    }
  };

  // Render a student row
  const renderStudentRow = (student: Student) => {
    const cycle = getStudentCycle(student);

    return (
      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
        {/* Matricule & Student Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-[11px] text-slate-400 font-mono font-medium mt-0.5">
                {student.matricule}
              </p>
            </div>
          </div>
        </td>

        {/* Category & Class */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getCycleBadge(cycle)}
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
              {student.className}
            </span>
          </div>
        </td>

        {/* Parent / Guardian (Hidden for Teachers) */}
        {!isTeacher && (
          <td className="px-4 py-3">
            <p className="font-medium text-slate-800 leading-tight">{student.parentName}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{student.parentPhone}</span>
            </p>
          </td>
        )}

        {/* Average Grade */}
        <td className="px-4 py-3 text-center">
          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black border ${getGradeBadgeClass(student.averageGrade)}`}>
            {student.averageGrade.toFixed(1)} / 20
          </span>
        </td>

        {/* Attendance */}
        <td className="px-4 py-3 text-center">
          <span className={`font-black text-xs ${student.attendanceRate >= 95 ? 'text-emerald-700' : student.attendanceRate >= 90 ? 'text-blue-700' : 'text-amber-700'}`}>
            {student.attendanceRate}%
          </span>
        </td>

        {/* School Fees or Pedagogical Appreciation */}
        <td className="px-4 py-3">
          {isTeacher ? (
            <div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${
                student.averageGrade >= 16 ? 'bg-emerald-100 text-emerald-800' :
                student.averageGrade >= 14 ? 'bg-blue-100 text-blue-800' :
                student.averageGrade >= 12 ? 'bg-indigo-100 text-indigo-800' :
                student.averageGrade >= 10 ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {student.averageGrade >= 16 ? 'Excellence' :
                 student.averageGrade >= 14 ? 'Tableau d\'Honneur' :
                 student.averageGrade >= 12 ? 'Encouragements' :
                 student.averageGrade >= 10 ? 'Passable' : 'Besoin de soutien'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Rang estimé en classe</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-900">{formatFCFA(student.paidFee)}</p>
              {student.remainingFee > 0 ? (
                <span className="text-[11px] text-rose-600 font-medium block">
                  Reste : {formatFCFA(student.remainingFee)}
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 font-semibold block">
                  ✓ Soldé
                </span>
              )}
            </div>
          )}
        </td>

        {/* Actions (Hidden for Teachers) */}
        {!isTeacher && (
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                id={`btn-fiche-${student.id}`}
                type="button"
                onClick={() => setSelectedStudent(student)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Fiche 360°"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Fiche</span>
              </button>
              <button
                id={`btn-bulletin-${student.id}`}
                type="button"
                onClick={() => onOpenReportCard(student)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Voir Bulletin Officiel"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isTeacher ? 'Mes Élèves par Classe' : 'Gestion des Élèves'}
            </h1>
            {isTeacher && (
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider">
                Espace Enseignant
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isTeacher ? (
              <span>
                <strong>{students.length}</strong> élève{students.length > 1 ? 's' : ''} sous votre responsabilité • Classes assignées : <strong>{activeTeacher?.classNames?.join(', ') || 'Assignées'}</strong>
              </span>
            ) : (
              <span>
                Effectif total : <strong>{students.length}</strong> élèves inscrits • Triés par {getSortLabel()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            id="btn-sortir-classe"
            onClick={() => {
              if (selectedClass && selectedClass !== 'ALL') {
                setClassToExport(selectedClass);
              } else if (allUniqueClasses.length > 0) {
                setClassToExport(allUniqueClasses[0].name);
              } else {
                setClassToExport('6ème A');
              }
              setShowExportClassModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            title="Sortir la liste officielle d'une classe (Appel, Effectif, Export Excel, Impression)"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>{isTeacher ? 'Fiche d\'appel / Liste classe' : 'Sortir une classe'}</span>
          </button>
          {!isTeacher && onOpenImport && (
            <button
              id="btn-import-eleves-list"
              type="button"
              onClick={onOpenImport}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Importer Excel / CSV</span>
            </button>
          )}
          {!isTeacher && (
            <button
              id="btn-inscrire-eleve-list"
              type="button"
              onClick={onOpenEnrollment}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscrire un élève</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SORTING CONTROL PANEL */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {/* ROW 1: CATEGORY TABS (Primaire, Collège, Lycée) & GROUPING TOGGLE */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* Cycle Category Quick Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Catégorie :</span>
            </span>

            {/* All Categories */}
            <button
              type="button"
              id="btn-category-all"
              onClick={() => handleCategoryChange('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Toutes les catégories</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                {categoryCounts.ALL}
              </span>
            </button>

            {/* Collège */}
            <button
              type="button"
              id="btn-category-college"
              onClick={() => handleCategoryChange('Collège')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'Collège'
                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <span>Collège</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'Collège' ? 'bg-blue-500 text-white' : 'bg-blue-200/80 text-blue-900'}`}>
                {categoryCounts.Collège}
              </span>
            </button>

            {/* Lycée */}
            <button
              type="button"
              id="btn-category-lycee"
              onClick={() => handleCategoryChange('Lycée')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'Lycée'
                  ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <span>Lycée</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'Lycée' ? 'bg-purple-500 text-white' : 'bg-purple-200/80 text-purple-900'}`}>
                {categoryCounts.Lycée}
              </span>
            </button>

            {/* Primaire */}
            <button
              type="button"
              id="btn-category-primaire"
              onClick={() => handleCategoryChange('Primaire')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'Primaire'
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <span>Primaire</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'Primaire' ? 'bg-emerald-500 text-white' : 'bg-emerald-200/80 text-emerald-900'}`}>
                {categoryCounts.Primaire}
              </span>
            </button>
          </div>

          {/* Grouping View Switcher (Liste / Par Classe / Par Catégorie) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Affichage :</span>
            </span>

            <button
              type="button"
              id="btn-view-continuous"
              onClick={() => setGroupingMode('NONE')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                groupingMode === 'NONE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Afficher tous les élèves dans un grand tableau continu"
            >
              Liste continue
            </button>

            <button
              type="button"
              id="btn-view-group-class"
              onClick={() => setGroupingMode('BY_CLASS')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                groupingMode === 'BY_CLASS'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Organiser les élèves par sections de classe"
            >
              Grouper par Classe
            </button>

            <button
              type="button"
              id="btn-view-group-category"
              onClick={() => setGroupingMode('BY_CATEGORY')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                groupingMode === 'BY_CATEGORY'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Organiser les élèves par sections de cycle (Primaire, Collège, Lycée)"
            >
              Grouper par Catégorie
            </button>
          </div>
        </div>

        {/* ROW 2: SEARCH, CLASS SELECTOR, CRITÈRE DE TRI & ORDRE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="search-students-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Recherche par nom, prénom, matricule, téléphone..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Class Selector */}
          <div className="lg:col-span-3">
            <select
              id="filter-class-select"
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-blue-500 font-semibold cursor-pointer"
            >
              <option value="ALL">
                {selectedCategory === 'ALL' 
                  ? 'Toutes les classes' 
                  : `Toutes les classes (${selectedCategory})`}
              </option>
              {availableClasses.map(cls => (
                <option key={cls.name} value={cls.name}>
                  {cls.name} ({cls.count} élève{cls.count > 1 ? 's' : ''} • {cls.cycle})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Selector (Trier par...) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 shrink-0 hidden sm:inline">
                Trier :
              </span>
              <select
                id="select-sort-students-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-200 bg-blue-50/50 text-blue-950 font-bold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="CLASS">Ordre par Classe (Niveau Pédagogique)</option>
                <option value="CATEGORY">Ordre par Catégorie de Cycle (Primaire → Lycée)</option>
                <option value="NAME">Nom de famille (Alphabétique A-Z)</option>
                <option value="FIRST_NAME">Prénom de l'élève (A-Z)</option>
                <option value="GRADE">Moyenne Générale (/20)</option>
                <option value="ATTENDANCE">Taux d'Assiduité (%)</option>
                <option value="FEE">Scolarité (Reste à payer)</option>
                <option value="MATRICULE">Numéro Matricule</option>
              </select>
            </div>
          </div>

          {/* Sort Direction Toggle Button */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-sort-direction"
              onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
              title="Inverser le sens du tri"
            >
              {sortDirection === 'asc' ? (
                <>
                  <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Croissant (A-Z)</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Décroissant (Z-A)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ROW 3: SECONDARY FILTERS (Mentions / Tranches académiques & Paiement) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Academic Performance Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Moyenne :</span>
              <select
                id="filter-academic-category-select"
                value={selectedAcademicCategory}
                onChange={(e) => setSelectedAcademicCategory(e.target.value as AcademicCategory)}
                className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                <option value="ALL">Toutes les mentions</option>
                <option value="EXCELLENCE">Excellence (≥ 16/20)</option>
                <option value="BIEN">Très Bien & Bien (14 - 15.9/20)</option>
                <option value="PASSABLE">Passable (10 - 13.9/20)</option>
                <option value="DIFFICULTE">En difficulté (&lt; 10/20)</option>
              </select>
            </div>

            {/* Payment Filter (Hidden for Teachers) */}
            {!isTeacher && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Finances :</span>
                <select
                  id="filter-payment-select"
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="ALL">Tous les statuts financiers</option>
                  <option value="SOLDE">Soldé (À jour)</option>
                  <option value="IMPAYE">Impayé en cours</option>
                </select>
              </div>
            )}
          </div>

          {/* Right side: Active Filters Notice and Reset button */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                id="btn-reset-all-filters"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                title="Effacer les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser les filtres ({activeFiltersCount})</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {filteredAndSortedStudents.length} résultat{filteredAndSortedStudents.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* SUMMARY BADGES BAR */}
      <div className="p-3 bg-slate-100/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700">Tri actif :</span>
          <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-blue-900 font-extrabold shadow-2xs">
            {getSortLabel()}
          </span>
          {selectedCategory !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
              Catégorie : {selectedCategory}
            </span>
          )}
          {selectedClass !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
              Classe : {selectedClass}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>
            Effectif affiché : <strong className="text-slate-900 font-black">{filteredAndSortedStudents.length}</strong> / {students.length}
          </span>
          <span>•</span>
          <span>
            Moyenne du groupe :{' '}
            <strong className="text-blue-900 font-black">
              {filteredAndSortedStudents.length > 0
                ? (filteredAndSortedStudents.reduce((acc, s) => acc + s.averageGrade, 0) / filteredAndSortedStudents.length).toFixed(2)
                : '0.00'} / 20
            </strong>
          </span>
        </div>
      </div>

      {/* STUDENTS DISPLAY (Continuous Table or Grouped) */}
      {filteredAndSortedStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Aucun élève ne correspond aux critères de sélection
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Essayez de modifier la catégorie de cycle, la classe sélectionnée ou le terme de recherche.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser tous les filtres</span>
          </button>
        </div>
      ) : groupingMode === 'BY_CLASS' ? (
        /* ================= VUE GROUPÉE PAR CLASSE ================= */
        <div className="space-y-6">
          {groupedByClass.map((group) => {
            const classAvg = (group.students.reduce((acc, s) => acc + s.averageGrade, 0) / group.students.length).toFixed(2);
            const totalRemaining = group.students.reduce((acc, s) => acc + s.remainingFee, 0);

            return (
              <div key={group.className} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-inner">
                      {group.className.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black tracking-tight">{group.className}</h3>
                        {getCycleBadge(group.cycle)}
                      </div>
                      <p className="text-xs text-slate-300">
                        Division officielle • {group.students.length} élève{group.students.length > 1 ? 's' : ''} dans cette classe
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px] font-bold">Moyenne Classe</span>
                      <span className="text-amber-300 font-black text-sm">{classAvg} / 20</span>
                    </div>
                    {!isTeacher && (
                      <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold">Impayés Groupe</span>
                        <span className={`font-black text-xs ${totalRemaining > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {totalRemaining > 0 ? formatFCFA(totalRemaining) : 'À jour ✓'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Matricule & Élève</th>
                        <th className="px-4 py-3">Classe & Cycle</th>
                        {!isTeacher && <th className="px-4 py-3">Parent / Tuteur</th>}
                        <th className="px-4 py-3 text-center">Moyenne</th>
                        <th className="px-4 py-3 text-center">Présence</th>
                        <th className="px-4 py-3">{isTeacher ? 'Appréciation' : 'Scolarité (FCFA)'}</th>
                        {!isTeacher && <th className="px-4 py-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.students.map(renderStudentRow)}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : groupingMode === 'BY_CATEGORY' ? (
        /* ================= VUE GROUPÉE PAR CATÉGORIE / CYCLE ================= */
        <div className="space-y-6">
          {groupedByCategory.map((catGroup) => {
            const cycleAvg = (catGroup.students.reduce((acc, s) => acc + s.averageGrade, 0) / catGroup.students.length).toFixed(2);
            const cycleTotalRemaining = catGroup.students.reduce((acc, s) => acc + s.remainingFee, 0);

            return (
              <div key={catGroup.cycle} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 text-white font-black text-sm flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight">Cycle {catGroup.cycle}</h3>
                      <p className="text-xs text-blue-200">
                        {catGroup.students.length} élève{catGroup.students.length > 1 ? 's' : ''} inscrits dans ce cycle
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-800">
                      <span className="text-blue-300 block text-[10px] font-bold">Moyenne Cycle</span>
                      <span className="text-white font-black text-sm">{cycleAvg} / 20</span>
                    </div>
                    {!isTeacher && (
                      <div className="bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-800">
                        <span className="text-blue-300 block text-[10px] font-bold">Solde Global</span>
                        <span className={`font-black text-xs ${cycleTotalRemaining > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                          {cycleTotalRemaining > 0 ? formatFCFA(cycleTotalRemaining) : 'Soldé ✓'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table for Category */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Matricule & Élève</th>
                        <th className="px-4 py-3">Classe & Cycle</th>
                        {!isTeacher && <th className="px-4 py-3">Parent / Tuteur</th>}
                        <th className="px-4 py-3 text-center">Moyenne</th>
                        <th className="px-4 py-3 text-center">Présence</th>
                        <th className="px-4 py-3">{isTeacher ? 'Appréciation' : 'Scolarité (FCFA)'}</th>
                        {!isTeacher && <th className="px-4 py-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {catGroup.students.map(renderStudentRow)}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VUE CONTINUE INTERACTIVE ================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  {/* Column 1: Matricule & Student (Click to sort by Name) */}
                  <th 
                    id="th-sort-student-name"
                    onClick={() => handleSortColumnClick('NAME')}
                    className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                    title="Cliquez pour trier par nom"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Matricule & Élève</span>
                      {sortBy === 'NAME' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Column 2: Catégorie & Classe (Click to sort by Class / Category) */}
                  <th 
                    id="th-sort-student-class"
                    onClick={() => handleSortColumnClick('CLASS')}
                    className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                    title="Cliquez pour trier par classe et niveau"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Catégorie & Classe</span>
                      {sortBy === 'CLASS' || sortBy === 'CATEGORY' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Column 3: Parent / Tuteur (Hidden for Teachers) */}
                  {!isTeacher && <th className="px-4 py-3">Parent / Tuteur</th>}

                  {/* Column 4: Moyenne (Click to sort by Grade) */}
                  <th 
                    id="th-sort-student-grade"
                    onClick={() => handleSortColumnClick('GRADE')}
                    className="px-4 py-3 text-center cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                    title="Cliquez pour trier par moyenne générale"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Moyenne</span>
                      {sortBy === 'GRADE' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Column 5: Présence (Click to sort by Attendance) */}
                  <th 
                    id="th-sort-student-attendance"
                    onClick={() => handleSortColumnClick('ATTENDANCE')}
                    className="px-4 py-3 text-center cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                    title="Cliquez pour trier par taux de présence"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Présence</span>
                      {sortBy === 'ATTENDANCE' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Column 6: Scolarité (Click to sort by Fee debt) or Appréciation Pédagogique */}
                  <th 
                    id="th-sort-student-fee"
                    onClick={() => !isTeacher && handleSortColumnClick('FEE')}
                    className={`px-4 py-3 select-none transition-colors group ${
                      isTeacher ? '' : 'cursor-pointer hover:bg-slate-100'
                    }`}
                    title={isTeacher ? "Appréciation pédagogique du trimestre" : "Cliquez pour trier par reste à payer"}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{isTeacher ? 'Appréciation' : 'Scolarité (FCFA)'}</span>
                      {!isTeacher && (
                        sortBy === 'FEE' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                        )
                      )}
                    </div>
                  </th>

                  {/* Column 7: Actions (Hidden for Teachers) */}
                  {!isTeacher && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedStudents.map(renderStudentRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FICHE ÉLÈVE MODALE 360° */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-inner">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    {getCycleBadge(getStudentCycle(selectedStudent))}
                  </div>
                  <p className="text-xs text-blue-200 font-mono mt-0.5">
                    Matricule Officiel : {selectedStudent.matricule} • Classe : {selectedStudent.className}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: État civil */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Informations Personnelles & État Civil
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Date de Naissance</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.dateOfBirth}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Lieu de Naissance</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.placeOfBirth}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Sexe & Nationalité</span>
                    <span className="font-semibold text-slate-800">
                      {selectedStudent.gender === 'M' ? 'Masculin' : 'Féminin'} • {selectedStudent.nationality}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Cycle & Classe Pédagogique</span>
                    <span className="font-bold text-slate-900">
                      {selectedStudent.className} ({getStudentCycle(selectedStudent)}) — Inscription active 2026-2027
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Parents */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Parents / Tuteurs Légaux
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-slate-500 block mb-0.5">Nom du Parent</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedStudent.parentName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Téléphone / WhatsApp</span>
                      <span className="font-bold text-emerald-800">{selectedStudent.parentPhone}</span>
                    </div>
                    <a 
                      href={`https://wa.me/${selectedStudent.parentPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-500 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 3: Situation Financière FCFA (Administration uniquement) */}
              {!isTeacher && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Situation Financière & Frais Scolaires (FCFA)
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Frais Annuels</span>
                      <span className="font-black text-slate-900 text-sm">{formatFCFA(selectedStudent.annualFee)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[11px] text-emerald-700 block">Total Payé</span>
                      <span className="font-black text-emerald-700 text-sm">{formatFCFA(selectedStudent.paidFee)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[11px] text-rose-700 block">Reste à Payer</span>
                      <span className="font-black text-rose-700 text-sm">{formatFCFA(selectedStudent.remainingFee)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Résultats & Assiduité */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Parcours Scolaire Actuel
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Moyenne Générale</span>
                      <span className="font-black text-indigo-900 text-base">{selectedStudent.averageGrade.toFixed(1)} / 20</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const studentToOpen = selectedStudent;
                        setSelectedStudent(null);
                        onOpenReportCard(studentToOpen);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      Voir Bulletin T1 & T2
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Taux d'Assiduité</span>
                      <span className="font-black text-emerald-700 text-base">{selectedStudent.attendanceRate} %</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">Assiduité conforme</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SORTIR LA LISTE OFFICIELLE D'UNE CLASSE             */}
      {/* ========================================================= */}
      {showExportClassModal && (
        <div 
          id="modal-sortir-classe"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-2">
                    <span>Sortir une Classe — Édition Scolaire Officielle</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Année 2026-2027
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Générez la feuille d'appel, l'effectif nominatif complet ou le bilan de performance de la classe choisie.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-sortir-classe-modal"
                type="button"
                onClick={() => setShowExportClassModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection Toolbar inside Modal */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Class Selector Dropdown & Quick Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <SchoolIcon className="w-4 h-4 text-indigo-600" />
                  <span>Classe à sortir :</span>
                </span>
                <select
                  id="select-classe-a-sortir"
                  value={classToExport}
                  onChange={(e) => setClassToExport(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-indigo-300 bg-white text-slate-900 font-black text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  {allUniqueClasses.map(cls => (
                    <option key={cls.name} value={cls.name}>
                      {cls.name} ({cls.count} élève{cls.count > 1 ? 's' : ''} • {cls.cycle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type Selector Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                <button
                  type="button"
                  id="tab-doc-appel"
                  onClick={() => setExportDocType('APPEL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    exportDocType === 'APPEL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Feuille d'Appel & Présences
                </button>
                <button
                  type="button"
                  id="tab-doc-effectif"
                  onClick={() => setExportDocType('EFFECTIF')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    exportDocType === 'EFFECTIF'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Effectif Officiel Détaillé
                </button>
                <button
                  type="button"
                  id="tab-doc-bilan"
                  onClick={() => setExportDocType('BILAN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    exportDocType === 'BILAN'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Relevé des Performances
                </button>
              </div>
            </div>

            {/* Document Preview Sheet Container */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100/80 border-b border-slate-200 flex-1">
              {classStudentsForExport.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <SchoolIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-800 text-base">Aucun élève inscrit dans cette classe ({classToExport})</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sélectionnez une autre classe avec des effectifs inscrits pour éditer le document.
                  </p>
                </div>
              ) : (
                <div 
                  id="printable-class-roster"
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-900 space-y-6 max-w-3xl mx-auto"
                >
                  {/* Official Senegalese Header */}
                  <div className="border-b-2 border-slate-900 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-center sm:text-left">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                          RÉPUBLIQUE DU SÉNÉGAL
                        </p>
                        <p className="text-[9px] italic text-slate-500">Un Peuple - Un But - Une Foi</p>
                        <p className="text-[10px] font-bold text-slate-700 mt-1 uppercase">
                          MINISTÈRE DE L'ÉDUCATION NATIONALE
                        </p>
                        <p className="text-[9px] text-slate-500">Inspection d'Académie de Dakar • IEF Almadies</p>
                      </div>

                      <div className="sm:text-right">
                        <h4 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                          GROUPE SCOLAIRE EXCELLENCE DAKAR
                        </h4>
                        <p className="text-[10px] text-slate-500">Complexe Pédagogique Privé • Mermoz Pyrotechnie</p>
                        <p className="text-[10px] font-mono text-slate-600 font-bold mt-0.5">
                          Année Scolaire : 2026 - 2027
                        </p>
                      </div>
                    </div>

                    {/* Class Main Title */}
                    <div className="mt-5 text-center bg-slate-50 py-3 px-4 rounded-xl border border-slate-200">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                        {exportDocType === 'APPEL' && `FEUILLE D'APPEL OFFICIELLE & CONTRÔLE DE PRÉSENCE`}
                        {exportDocType === 'EFFECTIF' && `LISTE NOMINATIVE OFFICIELLE DE L'EFFECTIF`}
                        {exportDocType === 'BILAN' && `RELEVÉ DE RENDEMENT SCOLAIRE & ASSIDUITÉ`}
                      </h2>
                      <div className="flex items-center justify-center gap-3 text-xs font-bold text-indigo-900 mt-1 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          Classe : {classToExport}
                        </span>
                        <span>•</span>
                        <span>Cycle : {currentClassMeta.cycle}</span>
                        <span>•</span>
                        <span>Salle : {currentClassMeta.room}</span>
                        <span>•</span>
                        <span>Prof. Principal : {currentClassMeta.mainTeacher}</span>
                      </div>
                    </div>

                    {/* Summary Counters Bar */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Effectif Total</span>
                        <span className="font-black text-slate-900 text-sm">{classGenderCounts.total} élèves</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Garçons</span>
                        <span className="font-black text-blue-700 text-sm">{classGenderCounts.boys}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Filles</span>
                        <span className="font-black text-purple-700 text-sm">{classGenderCounts.girls}</span>
                      </div>
                    </div>
                  </div>

                  {/* STUDENTS TABLE BASED ON SELECTED DOCUMENT TYPE */}
                  {exportDocType === 'APPEL' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 text-center w-8">N°</th>
                            <th className="p-2 border-r border-slate-300 w-28">Matricule</th>
                            <th className="p-2 border-r border-slate-300">Nom & Prénom</th>
                            <th className="p-2 border-r border-slate-300 text-center w-10">Sexe</th>
                            <th className="p-1 border-r border-slate-300 text-center w-12 font-semibold text-[10px]">Lun</th>
                            <th className="p-1 border-r border-slate-300 text-center w-12 font-semibold text-[10px]">Mar</th>
                            <th className="p-1 border-r border-slate-300 text-center w-12 font-semibold text-[10px]">Mer</th>
                            <th className="p-1 border-r border-slate-300 text-center w-12 font-semibold text-[10px]">Jeu</th>
                            <th className="p-1 border-r border-slate-300 text-center w-12 font-semibold text-[10px]">Ven</th>
                            <th className="p-2 text-center w-28">Observations</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudentsForExport.map((st, idx) => (
                            <tr key={st.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
                                {st.matricule}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                                {st.lastName.toUpperCase()} {st.firstName}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                                {st.gender}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center bg-slate-50/40"></td>
                              <td className="p-2 border-r border-slate-200 text-center bg-slate-50/40"></td>
                              <td className="p-2 border-r border-slate-200 text-center bg-slate-50/40"></td>
                              <td className="p-2 border-r border-slate-200 text-center bg-slate-50/40"></td>
                              <td className="p-2 border-r border-slate-200 text-center bg-slate-50/40"></td>
                              <td className="p-2 text-center text-[10px] text-slate-400"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {exportDocType === 'EFFECTIF' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 text-center w-8">N°</th>
                            <th className="p-2 border-r border-slate-300 w-28">Matricule</th>
                            <th className="p-2 border-r border-slate-300">Nom & Prénom</th>
                            <th className="p-2 border-r border-slate-300 text-center w-10">Sexe</th>
                            <th className="p-2 border-r border-slate-300">Date & Lieu Naiss.</th>
                            <th className="p-2 border-r border-slate-300">Parent / Tuteur</th>
                            <th className="p-2 border-r border-slate-300">Téléphone</th>
                            <th className="p-2 text-right">Scolarité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudentsForExport.map((st, idx) => (
                            <tr key={st.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
                                {st.matricule}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                                {st.lastName.toUpperCase()} {st.firstName}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                                {st.gender}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-[11px] text-slate-600">
                                {st.dateOfBirth} ({st.placeOfBirth})
                              </td>
                              <td className="p-2 border-r border-slate-200 font-medium text-slate-800">
                                {st.parentName}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-600">
                                {st.parentPhone}
                              </td>
                              <td className="p-2 text-right font-semibold">
                                {st.remainingFee === 0 ? (
                                  <span className="text-emerald-700 font-bold text-[11px]">✓ Soldé</span>
                                ) : (
                                  <span className="text-rose-600 text-[11px]">{formatFCFA(st.paidFee)}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {exportDocType === 'BILAN' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 text-center w-8">N°</th>
                            <th className="p-2 border-r border-slate-300 w-28">Matricule</th>
                            <th className="p-2 border-r border-slate-300">Nom & Prénom</th>
                            <th className="p-2 border-r border-slate-300 text-center w-10">Sexe</th>
                            <th className="p-2 border-r border-slate-300 text-center w-24">Moyenne (/20)</th>
                            <th className="p-2 border-r border-slate-300 text-center w-20">Assiduité</th>
                            <th className="p-2 text-center w-36">Appréciation Conseil</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudentsForExport.map((st, idx) => (
                            <tr key={st.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
                                {st.matricule}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                                {st.lastName.toUpperCase()} {st.firstName}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                                {st.gender}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center font-black">
                                <span className={st.averageGrade >= 14 ? 'text-emerald-700' : st.averageGrade >= 10 ? 'text-blue-700' : 'text-rose-600'}>
                                  {st.averageGrade.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-2 border-r border-slate-200 text-center font-semibold text-slate-700">
                                {st.attendanceRate}%
                              </td>
                              <td className="p-2 text-center text-[11px] font-medium text-slate-600">
                                {st.averageGrade >= 16 ? 'Tableau d\'Honneur & Félicitations' :
                                 st.averageGrade >= 14 ? 'Tableau d\'Honneur & Encouragements' :
                                 st.averageGrade >= 12 ? 'Tableau d\'Honneur' :
                                 st.averageGrade >= 10 ? 'Travail Passable' : 'Doit redoubler d\'efforts'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Official Signatures & Seal Section */}
                  <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Le Professeur Principal</p>
                      <p className="text-[10px] text-slate-500 mb-8 mt-0.5">{currentClassMeta.mainTeacher}</p>
                      <div className="w-28 mx-auto border-b border-dotted border-slate-400"></div>
                      <span className="text-[9px] text-slate-400 block mt-1">Date & Signature</span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Le Censeur des Études</p>
                      <p className="text-[10px] text-slate-500 mb-8 mt-0.5">Surveillance & Discipline</p>
                      <div className="w-28 mx-auto border-b border-dotted border-slate-400"></div>
                      <span className="text-[9px] text-slate-400 block mt-1">Visa Pédagogique</span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">La Direction Générale</p>
                      <p className="text-[10px] text-slate-500 mb-8 mt-0.5">Cachet & Signature Officielle</p>
                      <div className="w-28 mx-auto border-b border-dotted border-slate-400"></div>
                      <span className="text-[9px] text-slate-400 block mt-1">Dakar, le {new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                id="btn-filter-this-class-now"
                onClick={() => {
                  setSelectedClass(classToExport);
                  setShowExportClassModal(false);
                }}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Afficher la classe {classToExport} dans la liste principale</span>
              </button>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
                <button
                  type="button"
                  id="btn-download-class-csv"
                  onClick={handleExportClassCSV}
                  disabled={classStudentsForExport.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Télécharger un fichier CSV / Excel avec tous les élèves de cette classe"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Exporter CSV / Excel</span>
                </button>

                <button
                  type="button"
                  id="btn-print-class-roster-final"
                  onClick={() => {
                    try {
                      window.print();
                    } catch {
                      exportElementToPdf('printable-class-roster', {
                        filename: `liste_${classToExport.toLowerCase().replace(/\s+/g, '_')}.pdf`,
                        orientation: 'landscape'
                      });
                    }
                  }}
                  disabled={classStudentsForExport.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  title="Lancer l'impression via le navigateur"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>

                <button
                  type="button"
                  id="btn-download-class-roster-pdf"
                  onClick={async () => {
                    await exportElementToPdf('printable-class-roster', {
                      filename: `liste_${classToExport.toLowerCase().replace(/\s+/g, '_')}.pdf`,
                      orientation: 'landscape'
                    });
                  }}
                  disabled={classStudentsForExport.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  title="Télécharger directement la liste de classe en format PDF Paysage"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger PDF</span>
                </button>

                <button
                  type="button"
                  id="btn-close-sortir-classe-bottom"
                  onClick={() => setShowExportClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
