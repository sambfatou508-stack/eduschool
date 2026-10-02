export type UserRole = 
  | 'DIRECTEUR' 
  | 'ENSEIGNANT' 
  | 'PARENT' 
  | 'ELEVE' 
  | 'COMPTABLE' 
  | 'SECRETAIRE';

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'ESPECES' | 'VIREMENT' | 'CHEQUE';

export type PaymentStatus = 'PAYE' | 'PARTIEL' | 'IMPAYE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE';

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  academicYear: string;
  currency: string;
  logoText: string;
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: 'M' | 'F';
  address: string;
  phone?: string;
  nationality: string;
  classId: string;
  className: string;
  level: string; // e.g., 'Collège', 'Lycée'
  academicYear: string;
  enrollmentDate: string;
  status: 'ACTIF' | 'SUSPENDU' | 'TRANSFERE';
  parentId: string;
  parentName: string;
  parentPhone: string;
  annualFee: number; // in FCFA
  paidFee: number;
  remainingFee: number;
  attendanceRate: number; // percentage
  averageGrade: number; // /20
  avatarUrl?: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  profession: string;
  studentIds: string[];
}

export interface Teacher {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialty?: string;
  subjects?: string[];
  assignedClasses?: string[];
  classNames?: string[];
  weeklyHours?: number;
  status: 'ACTIF' | 'CONGE';
  isMainTeacherFor?: string; // e.g. "6ème A"
}


export interface SchoolClass {
  id: string;
  name: string; // e.g., "6ème A", "3ème B", "Terminale S2"
  level: string;
  room: string;
  capacity: number;
  studentCount: number;
  mainTeacherName: string;
  averageClassGrade: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  level: string;
  category?: string;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  hour: string;
  status: AttendanceStatus;
  comment?: string;
  minutesLate?: number;
  isJustified?: boolean;
  justificationReason?: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  subjectName: string;
  evaluationType: 'DEVOIR_1' | 'DEVOIR_2' | 'COMPOSITION' | 'INTERROGATION';
  score: number; // over 20
  coefficient: number;
  period: 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3' | 'SEMESTRE_1' | 'SEMESTRE_2';
  date: string;
  teacherComment?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number; // in FCFA
  method: PaymentMethod;
  reference: string;
  period: string; // e.g., "Inscription", "Octobre 2026"
  date: string;
  cashierName: string;
  status: 'VALIDE' | 'ANNULE';
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'SALAIRES' | 'SENELEC_ELECTRICITE' | 'SENEAU_EAU' | 'INTERNET_TELECOM' | 'FOURNITURES' | 'MAINTENANCE' | 'AUTRE';
  amount: number; // in FCFA
  date: string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  status: 'PAYE' | 'EN_ATTENTE';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  target: 'TOUS' | 'PARENTS' | 'ENSEIGNANTS' | 'CLASSE';
  targetDetail?: string;
  author: string;
  priority: 'NORMALE' | 'URGENTE';
}

export interface TimetableSlot {
  id: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  timeSlot: string; // e.g. "08h00 - 10h00"
  subject: string;
  teacherName: string;
  className: string;
  room: string;
}

export type ClassRoom = SchoolClass;

export interface CommunicationLog {
  id: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  recipientGroup: string;
  message: string;
  sentAt: string;
  status: 'DELIVRE' | 'EN_COURS' | 'ECHOUE';
  recipientCount: number;
}

export type CalendarEventCategory = 
  | 'JOUR_FERIE' 
  | 'EXAMEN_NATIONAL' 
  | 'EVENEMENT_ECOLE' 
  | 'VACANCES_SCOLAIRES' 
  | 'REUNION_PEDAGOGIQUE';

export interface CalendarEvent {
  id: string;
  title: string;
  category: CalendarEventCategory;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  description?: string;
  location?: string;
  targetAudience?: 'TOUS' | 'ELEMENTAIRE' | 'COLLEGE' | 'LYCEE' | 'ENSEIGNANTS' | 'PARENTS' | 'TERMINALE';
  isOfficialHoliday?: boolean;
  isNationalExam?: boolean;
  colorBadge?: string;
}

