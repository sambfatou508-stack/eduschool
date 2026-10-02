/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ParentContextBanner } from './components/parent/ParentContextBanner';
import { TeacherContextBanner } from './components/teacher/TeacherContextBanner';
import { DirectorDashboard } from './components/dashboard/DirectorDashboard';
import { StudentsList } from './components/students/StudentsList';
import { EnrollmentWizard } from './components/enrollment/EnrollmentWizard';
import { PaymentsModule } from './components/finance/PaymentsModule';
import { DebtsModule } from './components/finance/DebtsModule';
import { ExpensesModule } from './components/finance/ExpensesModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { GradesModule } from './components/grades/GradesModule';
import { ReportCardView } from './components/bulletins/ReportCardView';
import { TimetableModule } from './components/timetable/TimetableModule';
import { CommunicationModule } from './components/communication/CommunicationModule';
import { ClassesModule } from './components/academic/ClassesModule';
import { TeachersModule } from './components/academic/TeachersModule';
import { ParentsModule } from './components/students/ParentsModule';
import { SubjectsModule } from './components/academic/SubjectsModule';
import { DocumentsModule } from './components/documents/DocumentsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { DataImportModule } from './components/import/DataImportModule';
import { SchoolCalendarModule } from './components/calendar/SchoolCalendarModule';


import { 
  MOCK_SCHOOLS, 
  INITIAL_STUDENTS, 
  INITIAL_PAYMENTS, 
  INITIAL_EXPENSES, 
  INITIAL_CLASSES, 
  INITIAL_TEACHERS, 
  INITIAL_PARENTS,
  INITIAL_SUBJECTS, 
  INITIAL_TIMETABLE,
  INITIAL_COMMUNICATIONS 
} from './data/mockData';

import { 
  UserRole, 
  School, 
  Student, 
  PaymentRecord, 
  ExpenseRecord, 
  CommunicationLog,
  Teacher,
  Parent,
  TimetableSlot,
  GradeEntry,
  AttendanceRecord,
  Subject
} from './types';

export default function App() {
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [activeSchool, setActiveSchool] = useState<School>(MOCK_SCHOOLS[0]);
  const [activeRole, setActiveRole] = useState<UserRole>('DIRECTEUR');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'PARENT') {
      const allowedParentTabs = ['emploi-du-temps', 'notes', 'bulletins', 'paiements', 'communication'];
      if (!allowedParentTabs.includes(currentTab)) {
        setCurrentTab('bulletins');
      }
    } else if (role === 'ENSEIGNANT') {
      const forbiddenTeacherTabs = ['inscriptions', 'depenses', 'impayes', 'import', 'paiements', 'documents', 'rapports', 'parents', 'enseignants'];
      if (forbiddenTeacherTabs.includes(currentTab)) {
        setCurrentTab('eleves');
      }
    } else if (role === 'ELEVE') {
      const allowedStudentTabs = ['emploi-du-temps', 'notes', 'bulletins'];
      if (!allowedStudentTabs.includes(currentTab)) {
        setCurrentTab('notes');
      }
    }
  };

  // Core Data States
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(INITIAL_COMMUNICATIONS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [parents, setParents] = useState<Parent[]>(INITIAL_PARENTS);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects(prev => [newSubject, ...prev]);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  // Active Parent & Child state for PARENT role
  const [activeParentId, setActiveParentId] = useState<string>('par-1');
  const [selectedChildId, setSelectedChildId] = useState<string>('stu-1');

  // Currently active Parent profile
  const currentParent = parents.find(p => p.id === activeParentId) || parents[0];

  // Attached students strictly belonging to currentParent
  const attachedStudents = useMemo(() => {
    return students.filter(s => 
      s.parentId === currentParent.id || 
      (currentParent.studentIds && currentParent.studentIds.includes(s.id))
    );
  }, [students, currentParent]);

  // Active child for consultation
  const activeChild = useMemo(() => {
    return attachedStudents.find(s => s.id === selectedChildId) || attachedStudents[0] || students[0];
  }, [attachedStudents, selectedChildId]);

  const handleSelectParent = (parentId: string) => {
    setActiveParentId(parentId);
    const par = parents.find(p => p.id === parentId);
    if (par) {
      const firstChild = students.find(s => s.parentId === par.id || (par.studentIds && par.studentIds.includes(s.id)));
      if (firstChild) {
        setSelectedChildId(firstChild.id);
      }
    }
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  // Active Teacher state for ENSEIGNANT role
  const [activeTeacherId, setActiveTeacherId] = useState<string>('tea-1');

  // Currently active Teacher profile
  const currentTeacher = useMemo(() => {
    return teachers.find(t => t.id === activeTeacherId) || teachers[0];
  }, [teachers, activeTeacherId]);

  // Classes assigned to currentTeacher
  const teacherClasses = useMemo(() => {
    return currentTeacher.classNames || currentTeacher.assignedClasses || ['6ème A', '5ème A', '4ème A'];
  }, [currentTeacher]);

  // Students belonging exclusively to active teacher's assigned classes
  const teacherStudents = useMemo(() => {
    return students.filter(s => teacherClasses.includes(s.className));
  }, [students, teacherClasses]);
  
  // Active Student for Bulletin view
  const [bulletinStudent, setBulletinStudent] = useState<Student>(INITIAL_STUDENTS[0]);

  // Active class filter when navigating to Students list (e.g. from ClassesModule)
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Handler to register new student from wizard
  const handleEnrollmentSuccess = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    // Add initial payment record
    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: newStudent.id,
      studentName: `${newStudent.firstName} ${newStudent.lastName}`,
      className: newStudent.className,
      amount: newStudent.paidFee,
      method: 'WAVE',
      reference: 'WV-REG-' + Date.now().toString().slice(-5),
      period: 'Frais Inscription & Assurance',
      date: new Date().toISOString().split('T')[0],
      cashierName: 'Guichet Inscriptions',
      status: 'VALIDE'
    };
    setPayments(prev => [newPay, ...prev]);
    setCurrentTab('eleves');
  };

  const handleAddPayment = (newPayment: PaymentRecord) => {
    setPayments(prev => [newPayment, ...prev]);
    // Update student remaining balance
    setStudents(prev => prev.map(s => {
      if (s.id === newPayment.studentId) {
        const updatedPaid = s.paidFee + newPayment.amount;
        const updatedRemaining = Math.max(0, s.annualFee - updatedPaid);
        return {
          ...s,
          paidFee: updatedPaid,
          remainingFee: updatedRemaining
        };
      }
      return s;
    }));
  };

  const handleAddExpense = (newExpense: ExpenseRecord) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleSendMessage = (newLog: CommunicationLog) => {
    setCommunicationLogs(prev => [newLog, ...prev]);
  };

  // Bulk Import Handlers
  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => [...newStudents, ...prev]);
  };

  const handleImportGrades = (newGrades: GradeEntry[]) => {
    setStudents(prev => prev.map(s => {
      const studentGrades = newGrades.filter(g => 
        g.studentId === s.matricule || 
        g.studentId === s.id || 
        (g.studentName.toLowerCase().includes(s.firstName.toLowerCase()) && g.studentName.toLowerCase().includes(s.lastName.toLowerCase()))
      );
      if (studentGrades.length > 0) {
        const sum = studentGrades.reduce((acc, g) => acc + g.score, 0);
        const avg = parseFloat((sum / studentGrades.length).toFixed(2));
        return { ...s, averageGrade: avg };
      }
      return s;
    }));
  };

  const handleImportParents = (newParents: Parent[]) => {
    setParents(prev => [...newParents, ...prev]);
  };

  const handleImportTeachers = (newTeachers: Teacher[]) => {
    setTeachers(prev => [...newTeachers, ...prev]);
  };

  const handleImportTimetable = (newSlots: TimetableSlot[]) => {
    setTimetableSlots(prev => [...newSlots, ...prev]);
  };

  const handleImportAttendance = (newRecords: AttendanceRecord[]) => {
    setStudents(prev => prev.map(s => {
      const studentRecs = newRecords.filter(r => 
        r.studentId === s.matricule || 
        r.studentId === s.id || 
        (r.studentName.toLowerCase().includes(s.firstName.toLowerCase()) && r.studentName.toLowerCase().includes(s.lastName.toLowerCase()))
      );
      if (studentRecs.length > 0) {
        const presents = studentRecs.filter(r => r.status === 'PRESENT').length;
        const rate = Math.round((presents / studentRecs.length) * 100);
        return { ...s, attendanceRate: rate };
      }
      return s;
    }));
  };

  const handleImportPayments = (newPayments: PaymentRecord[]) => {
    setPayments(prev => [...newPayments, ...prev]);
    setStudents(prev => prev.map(s => {
      const matchingPayments = newPayments.filter(p => 
        p.studentId === s.matricule || 
        p.studentId === s.id || 
        (p.studentName.toLowerCase().includes(s.firstName.toLowerCase()) && p.studentName.toLowerCase().includes(s.lastName.toLowerCase()))
      );
      if (matchingPayments.length > 0) {
        const addedAmount = matchingPayments.reduce((acc, p) => acc + p.amount, 0);
        const updatedPaid = s.paidFee + addedAmount;
        const updatedRemaining = Math.max(0, s.annualFee - updatedPaid);
        return {
          ...s,
          paidFee: updatedPaid,
          remainingFee: updatedRemaining
        };
      }
      return s;
    }));
  };

  const handleOpenReportCard = (st: Student) => {
    setBulletinStudent(st);
    setCurrentTab('bulletins');
  };

  const handleSelectClassStudents = (className: string) => {
    setSelectedClassFilter(className);
    setCurrentTab('eleves');
  };

  // Calculated revenues
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      {/* Responsive Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'eleves') {
            setSelectedClassFilter('ALL');
          }
          setCurrentTab(tab);
        }}
        activeRole={activeRole}
        activeSchool={activeSchool}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:h-auto">
        {/* Top Header */}
        <Header
          activeSchool={activeSchool}
          schools={schools}
          onSelectSchool={setActiveSchool}
          activeRole={activeRole}
          onChangeRole={handleRoleChange}
          onOpenMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0 print:m-0 print:h-auto print:max-w-none">
          <div className="max-w-7xl mx-auto space-y-6 print:max-w-none print:space-y-0">
            {/* Context Banner for Parents */}
            {activeRole === 'PARENT' && (
              <div className="print:hidden">
                <ParentContextBanner
                  activeParent={currentParent}
                  parent={currentParent}
                  parents={parents}
                  allParents={parents}
                  attachedStudents={attachedStudents}
                  selectedChild={activeChild}
                  activeChild={activeChild}
                  onSelectParent={handleSelectParent}
                  onSelectChild={handleSelectChild}
                />
              </div>
            )}

            {/* Context Banner for Teachers */}
            {activeRole === 'ENSEIGNANT' && (
              <div className="print:hidden">
                <TeacherContextBanner
                  activeTeacher={currentTeacher}
                  allTeachers={teachers}
                  teacherStudents={teacherStudents}
                  onSelectTeacher={setActiveTeacherId}
                  currentTab={currentTab}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              </div>
            )}

            {/* If Teacher attempts to view inscriptions or forbidden admin tabs */}
            {activeRole === 'ENSEIGNANT' && ['inscriptions', 'depenses', 'impayes', 'import', 'paiements', 'documents', 'rapports', 'parents', 'enseignants'].includes(currentTab) ? (
              <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-indigo-200 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {currentTab === 'inscriptions' ? "Inscriptions Réservées à la Direction" : "Section Administrative Réservée"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {currentTab === 'inscriptions' 
                      ? "En tant qu'enseignant, vous n'êtes pas habilité à inscrire de nouveaux élèves. Vous avez accès en consultation et gestion pédagogique à la liste exclusive de vos élèves et de vos classes."
                      : "Cette section administrative n'est pas accessible au profil Enseignant."}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentTab('eleves')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Consulter la liste de mes élèves
                  </button>
                </div>
              </div>
            ) : activeRole === 'PARENT' && !['bulletins', 'notes', 'paiements', 'emploi-du-temps', 'emploidutemps', 'communication'].includes(currentTab) ? (
              <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Accès Réservé au Personnel de l'Établissement</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Votre profil Parent est strictement configuré pour consulter les données scolaires de vos enfants rattachés ({attachedStudents.map(s => s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '').filter(Boolean).join(', ') || 'aucun élève'}). Cette section administrative n'est pas accessible aux familles.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentTab('bulletins')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Consulter le Bulletin
                  </button>
                  <button
                    onClick={() => setCurrentTab('notes')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Consulter les Notes
                  </button>
                </div>
              </div>
            ) : activeRole === 'ELEVE' && !['bulletins', 'notes', 'emploi-du-temps', 'emploidutemps'].includes(currentTab) ? (
              <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-sky-200 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center border border-sky-100">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {currentTab === 'communication' ? "Accès à la Communication Non Autorisé" : "Section Non Autorisée"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {currentTab === 'communication' 
                      ? "Le module de communication officielle (SMS, alertes administratives, avis aux parents) est strictement réservé aux parents d'élèves et à l'administration de l'établissement. En tant qu'élève, vous avez accès à vos notes, vos bulletins et votre emploi du temps."
                      : "En tant qu'élève, votre profil est configuré pour consulter exclusivement votre emploi du temps, vos notes et vos bulletins scolaires."}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentTab('notes')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Consulter mes Notes
                  </button>
                  <button
                    onClick={() => setCurrentTab('bulletins')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Consulter mon Bulletin
                  </button>
                </div>
              </div>
            ) : (
              <>
                {currentTab === 'dashboard' && (
                  <DirectorDashboard
                    school={activeSchool}
                    students={students}
                    payments={payments}
                    expenses={expenses}
                    onNavigate={(tab) => {
                      if (tab === 'eleves') {
                        setSelectedClassFilter('ALL');
                      }
                      setCurrentTab(tab);
                    }}
                  />
                )}

                {currentTab === 'eleves' && (
                  <StudentsList
                    students={activeRole === 'ENSEIGNANT' ? teacherStudents : students}
                    initialClassFilter={selectedClassFilter}
                    onClearClassFilter={() => setSelectedClassFilter('ALL')}
                    onOpenEnrollment={() => {
                      if (activeRole !== 'ENSEIGNANT') {
                        setCurrentTab('inscriptions');
                      }
                    }}
                    onOpenReportCard={handleOpenReportCard}
                    onOpenImport={() => {
                      if (activeRole !== 'ENSEIGNANT') {
                        setCurrentTab('import');
                      }
                    }}
                    userRole={activeRole}
                    activeTeacher={activeRole === 'ENSEIGNANT' ? currentTeacher : undefined}
                    allTeachers={teachers}
                    onSelectTeacher={setActiveTeacherId}
                  />
                )}

                {currentTab === 'inscriptions' && (
                  <EnrollmentWizard
                    onSuccess={handleEnrollmentSuccess}
                    onCancel={() => setCurrentTab('eleves')}
                  />
                )}

                {currentTab === 'paiements' && (
                  <PaymentsModule
                    payments={payments}
                    students={students}
                    userRole={activeRole}
                    activeParent={activeRole === 'PARENT' ? currentParent : undefined}
                    attachedStudents={activeRole === 'PARENT' ? attachedStudents : undefined}
                    onAddPayment={handleAddPayment}
                  />
                )}

                {currentTab === 'impayes' && (
                  <DebtsModule
                    students={students}
                  />
                )}

                {currentTab === 'depenses' && (
                  <ExpensesModule
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    totalRevenue={totalRevenue}
                  />
                )}

                {currentTab === 'presences' && (
                  <AttendanceModule
                    students={activeRole === 'ENSEIGNANT' ? teacherStudents : students}
                    parents={parents}
                    school={activeSchool}
                    onSendAlert={handleSendMessage}
                    onNavigateToCommunication={() => setCurrentTab('communication')}
                  />
                )}

                {currentTab === 'notes' && (
                  <GradesModule
                    students={activeRole === 'PARENT' ? attachedStudents : (activeRole === 'ENSEIGNANT' ? teacherStudents : students)}
                    subjects={subjects}
                    userRole={activeRole}
                    attachedStudents={activeRole === 'PARENT' ? attachedStudents : undefined}
                    activeChild={activeRole === 'PARENT' ? activeChild : undefined}
                    teacherSubjects={activeRole === 'ENSEIGNANT' && currentTeacher ? currentTeacher.subjects : undefined}
                    teacherClasses={activeRole === 'ENSEIGNANT' ? teacherClasses : undefined}
                    teacherName={activeRole === 'ENSEIGNANT' && currentTeacher?.firstName ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : undefined}
                  />
                )}

                {currentTab === 'bulletins' && (
                  <ReportCardView
                    student={activeRole === 'PARENT' ? activeChild : (activeRole === 'ENSEIGNANT' ? (teacherStudents.find(s => s.id === bulletinStudent.id) || teacherStudents[0] || bulletinStudent) : bulletinStudent)}
                    school={activeSchool}
                    userRole={activeRole}
                    attachedStudents={activeRole === 'PARENT' ? attachedStudents : undefined}
                    allStudents={activeRole === 'ENSEIGNANT' ? teacherStudents : students}
                    onSelectStudent={(st) => {
                      if (activeRole === 'PARENT') {
                        setSelectedChildId(st.id);
                      } else {
                        setBulletinStudent(st);
                      }
                    }}
                  />
                )}

                {currentTab === 'calendrier' && (
                  <SchoolCalendarModule
                    userRole={activeRole}
                  />
                )}

                {(currentTab === 'emploi-du-temps' || currentTab === 'emploidutemps') && (
                  <TimetableModule
                    initialSlots={timetableSlots}
                    userRole={activeRole}
                    allowedClasses={activeRole === 'PARENT' ? Array.from(new Set(attachedStudents.map(s => s.className))) : (activeRole === 'ENSEIGNANT' ? teacherClasses : undefined)}
                    activeChildName={activeRole === 'PARENT' && activeChild?.firstName ? `${activeChild.firstName} ${activeChild.lastName}` : undefined}
                    teacherName={activeRole === 'ENSEIGNANT' && currentTeacher?.firstName ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : undefined}
                    teacherSubjects={activeRole === 'ENSEIGNANT' && currentTeacher ? currentTeacher.subjects : undefined}
                  />
                )}

                {currentTab === 'parents' && (
                  <ParentsModule
                    parents={parents}
                    students={students}
                    onOpenReportCard={handleOpenReportCard}
                  />
                )}

                {currentTab === 'matieres' && (
                  <SubjectsModule
                    subjects={subjects}
                    onAddSubject={handleAddSubject}
                    onDeleteSubject={handleDeleteSubject}
                  />
                )}

                {currentTab === 'communication' && (
                  <CommunicationModule
                    logs={communicationLogs}
                    userRole={activeRole}
                    activeParent={activeRole === 'PARENT' ? currentParent : undefined}
                    attachedStudents={activeRole === 'PARENT' ? attachedStudents : undefined}
                    onSendMessage={handleSendMessage}
                  />
                )}

                {currentTab === 'classes' && (
                  <ClassesModule
                    classes={INITIAL_CLASSES}
                    students={students}
                    onSelectClassStudents={handleSelectClassStudents}
                    userRole={activeRole}
                    teacherClasses={activeRole === 'ENSEIGNANT' ? teacherClasses : undefined}
                  />
                )}

                {currentTab === 'enseignants' && (
                  <TeachersModule
                    teachers={teachers}
                  />
                )}

                {currentTab === 'documents' && (
                  <DocumentsModule
                    school={activeSchool}
                    students={students}
                  />
                )}

                {(currentTab === 'rapports' || currentTab === 'rapport') && (
                  <ReportsModule
                    school={activeSchool}
                    students={students}
                    payments={payments}
                    expenses={expenses}
                    classes={INITIAL_CLASSES}
                  />
                )}

                {(currentTab === 'import' || currentTab === 'importation') && (
                  <DataImportModule
                    school={activeSchool}
                    students={students}
                    onImportStudents={handleImportStudents}
                    onImportGrades={handleImportGrades}
                    onImportParents={handleImportParents}
                    onImportTeachers={handleImportTeachers}
                    onImportTimetable={handleImportTimetable}
                    onImportAttendance={handleImportAttendance}
                    onImportPayments={handleImportPayments}
                  />
                )}

                {currentTab === 'parametres' && (
                  <SettingsModule
                    school={activeSchool}
                    onUpdateSchool={(updated) => {
                      setActiveSchool(updated);
                      setSchools(prev => prev.map(s => s.id === updated.id ? updated : s));
                    }}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

