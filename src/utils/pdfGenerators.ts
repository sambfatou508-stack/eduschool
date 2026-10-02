import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalendarEvent, Student, PaymentRecord, School } from '../types';

/**
 * Generates the official Senegalese School Calendar 2026-2027 PDF.
 * Uses native vector PDF primitives and autoTable for 100% reliable generation
 * with zero dependency on canvas or browser window.print() sandbox limitations.
 */
export const generateSchoolCalendarPdf = (
  events: CalendarEvent[],
  schoolName: string = 'Groupe Scolaire Excellence Dakar'
): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const todayStr = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    // Flag stripe at the top (Vert - Jaune - Rouge of Senegal)
    doc.setFillColor(0, 133, 63); // Green
    doc.rect(14, 8, 60, 2, 'F');
    doc.setFillColor(253, 239, 66); // Yellow
    doc.rect(74, 8, 60, 2, 'F');
    doc.setFillColor(235, 16, 38); // Red
    doc.rect(134, 8, 62, 2, 'F');

    // Header: Left (MEN) & Right (School)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('RÉPUBLIQUE DU SÉNÉGAL', 14, 15);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Un Peuple - Un But - Une Foi', 14, 19);
    doc.setFont('helvetica', 'normal');
    doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 14, 23);
    doc.text("Inspection d'Académie (IA) de Dakar", 14, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138); // Deep Navy
    doc.text(schoolName.toUpperCase(), 196, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("Enseignement Général & Technique Privé", 196, 19, { align: 'right' });
    doc.text("Année Scolaire Académique : 2026 - 2027", 196, 23, { align: 'right' });
    doc.text(`Document officiel édité le : ${todayStr}`, 196, 27, { align: 'right' });

    // Divider
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    // Title banner
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 32, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(
      'CALENDRIER SCOLAIRE ET ÉCHÉANCES NATIONALES OFFICIELLES (2026-2027)',
      105,
      38.5,
      { align: 'center' }
    );

    let startY = 46;

    // Filter events
    const examEvents = events.filter(e => e.category === 'EXAMEN_NATIONAL');
    const holidayEvents = events.filter(e => e.category === 'JOUR_FERIE');
    const vacationEvents = events.filter(e => e.category === 'VACANCES_SCOLAIRES');
    const schoolEvents = events.filter(e => e.category === 'EVENEMENT_ECOLE' || e.category === 'REUNION_PEDAGOGIQUE');

    const formatDate = (dStr: string) => {
      try {
        const d = new Date(dStr);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return dStr;
      }
    };

    // Table 1: Examens Nationaux
    if (examEvents.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 58, 138);
      doc.text("1. SESSIONS DES EXAMENS NATIONAUX D'ÉTAT & CONCOURS (MEN 2027)", 14, startY);
      startY += 3;

      autoTable(doc, {
        startY: startY,
        head: [['Examen / Concours', 'Période ou Dates', 'Public Concerné', 'Centres & Jurys']],
        body: examEvents.map(e => [
          e.title,
          e.endDate && e.endDate !== e.startDate
            ? `${formatDate(e.startDate)} au ${formatDate(e.endDate)}`
            : formatDate(e.startDate),
          e.targetAudience === 'TOUS' ? 'Tous les candidats' : e.targetAudience,
          e.location || 'Centres désignés par le MEN'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      startY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Table 2: Jours Fériés Légaux
    if (holidayEvents.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // Amber
      doc.text("2. FÊTES LÉGALES ET RELIGIEUSES CHÔMÉES AU SÉNÉGAL (Loi n° 74-52)", 14, startY);
      startY += 3;

      autoTable(doc, {
        startY: startY,
        head: [['Fête / Célébration', 'Date Officielle', 'Statut Légal & Observations']],
        body: holidayEvents.map(e => [
          e.title,
          formatDate(e.startDate),
          e.description || 'Jour férié légal chômé et payé sur toute l’étendue du territoire national'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [180, 83, 9],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [254, 252, 232]
        },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      startY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Table 3: Vacances Scolaires
    if (vacationEvents.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(4, 120, 87); // Emerald
      doc.text("3. CONGÉS ET VACANCES SCOLAIRES PÉDAGOGIQUES", 14, startY);
      startY += 3;

      autoTable(doc, {
        startY: startY,
        head: [['Période de Congés', 'Début des Vacances', 'Reprise des Cours']],
        body: vacationEvents.map(e => [
          e.title,
          formatDate(e.startDate),
          e.endDate ? formatDate(e.endDate) : '—'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [4, 120, 87],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59]
        },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      startY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Table 4: Événements École
    if (schoolEvents.length > 0 && startY < 230) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202); // Indigo
      doc.text("4. ACTIVITÉS PÉDAGOGIQUES ET VIE DE L'ÉCOLE", 14, startY);
      startY += 3;

      autoTable(doc, {
        startY: startY,
        head: [['Événement', 'Date', 'Lieu', 'Public Concerné']],
        body: schoolEvents.slice(0, 6).map(e => [
          e.title,
          formatDate(e.startDate),
          e.location || "Dans l'établissement",
          e.targetAudience || 'Tous'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [67, 56, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59]
        },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      startY = (doc as any).lastAutoTable.finalY + 8;
    }

    // Signatures Block
    const pageHeight = doc.internal.pageSize.height;
    const signY = Math.min(Math.max(startY, pageHeight - 35), pageHeight - 30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Pour la Direction des Études', 30, signY);
    doc.text("Le Chef d'Établissement / Proviseur", 140, signY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('(Signature & Visa)', 30, signY + 4);
    doc.text('[Cachet Officiel & Signature]', 140, signY + 4);

    // Footer note
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Document officiel édité pour impression via la plateforme EDU-SCHOOL Sénégal • Conforme aux arrêtés du Ministère de l’Éducation Nationale',
      105,
      pageHeight - 6,
      { align: 'center' }
    );

    // Save and download immediately
    doc.save('calendrier_scolaire_senegal_2026_2027.pdf');
    return true;
  } catch (error) {
    console.error('generateSchoolCalendarPdf error:', error);
    return false;
  }
};

/**
 * Generates official Student Report Card (Bulletin) PDF
 */
export const generateReportCardPdf = (
  student: Student,
  trimester: string,
  schoolName: string = 'Groupe Scolaire Excellence Dakar'
): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isT1 = trimester === 'TRIMESTRE_1' || trimester === 'T1' || trimester === '1er Trimestre';
    const trimTitle = isT1 ? '1ER TRIMESTRE' : '2ÈME TRIMESTRE';

    // Top Flag stripe
    doc.setFillColor(0, 133, 63);
    doc.rect(14, 8, 60, 2, 'F');
    doc.setFillColor(253, 239, 66);
    doc.rect(74, 8, 60, 2, 'F');
    doc.setFillColor(235, 16, 38);
    doc.rect(134, 8, 62, 2, 'F');

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('RÉPUBLIQUE DU SÉNÉGAL', 14, 15);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Un Peuple - Un But - Une Foi', 14, 19);
    doc.setFont('helvetica', 'normal');
    doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 14, 23);
    doc.text("Inspection d'Académie de Dakar", 14, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(schoolName.toUpperCase(), 196, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("BP 25410 Dakar • Tél: +221 33 825 40 50", 196, 19, { align: 'right' });
    doc.text("Année Scolaire : 2026 - 2027", 196, 23, { align: 'right' });

    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    // Bulletin Title
    doc.setFillColor(30, 58, 138);
    doc.rect(14, 33, 182, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`BULLETIN DE NOTES OFFICIEL — ${trimTitle}`, 105, 39, { align: 'center' });

    // Student Info Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 45, 182, 22, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 45, 182, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Nom & Prénom(s) : ${student.lastName.toUpperCase()} ${student.firstName}`, 18, 51);
    doc.text(`Classe : ${student.className}`, 18, 57);
    doc.text(`Matricule : ${student.matricule}`, 18, 63);

    doc.setFont('helvetica', 'normal');
    doc.text(`Date de Naissance : ${student.dateOfBirth || '14/03/2012'}`, 120, 51);
    doc.text(`Lieu : ${student.placeOfBirth || 'Dakar'}`, 120, 57);
    doc.text(`Parent / Tuteur : ${student.parentName} (${student.parentPhone})`, 120, 63);

    // Standard Curriculum Subjects for Senegal
    const baseAvg = student.averageGrade || 13.8;
    const subjectsList = [
      { name: 'Mathématiques', coef: 4, dev: Math.min(20, Math.max(8, Number((baseAvg + 0.4).toFixed(1)))), comp: Math.min(20, Math.max(7, Number((baseAvg - 0.2).toFixed(1)))) },
      { name: 'Français (Dictée & Expression)', coef: 4, dev: Math.min(20, Math.max(8, Number((baseAvg - 0.3).toFixed(1)))), comp: Math.min(20, Math.max(7, Number((baseAvg + 0.1).toFixed(1)))) },
      { name: 'Sciences de la Vie et de la Terre (SVT)', coef: 3, dev: Math.min(20, Math.max(8, Number((baseAvg + 0.8).toFixed(1)))), comp: Math.min(20, Math.max(8, Number((baseAvg + 0.5).toFixed(1)))) },
      { name: 'Physique-Chimie', coef: 3, dev: Math.min(20, Math.max(8, Number((baseAvg - 0.5).toFixed(1)))), comp: Math.min(20, Math.max(7, Number((baseAvg - 0.3).toFixed(1)))) },
      { name: 'Histoire-Géographie', coef: 2, dev: Math.min(20, Math.max(9, Number((baseAvg + 0.2).toFixed(1)))), comp: Math.min(20, Math.max(9, Number((baseAvg + 0.3).toFixed(1)))) },
      { name: 'Anglais LV1', coef: 2, dev: Math.min(20, Math.max(8, Number((baseAvg + 1.1).toFixed(1)))), comp: Math.min(20, Math.max(9, Number((baseAvg + 0.9).toFixed(1)))) },
      { name: 'Éducation Physique & Sportive (EPS)', coef: 1, dev: 16.5, comp: 16.0 }
    ];

    const gradesData = subjectsList.map(s => {
      const moy = ((s.dev + s.comp * 2) / 3).toFixed(2);
      const totalPoints = (parseFloat(moy) * s.coef).toFixed(2);

      let appreciation = 'Passable';
      const mNum = parseFloat(moy);
      if (mNum >= 16) appreciation = 'Très Bien';
      else if (mNum >= 14) appreciation = 'Bien';
      else if (mNum >= 12) appreciation = 'Assez Bien';
      else if (mNum >= 10) appreciation = 'Moyen';
      else if (mNum >= 8) appreciation = 'Insuffisant';
      else appreciation = 'Très Faible';

      return [
        s.name,
        s.coef.toString(),
        s.dev.toFixed(1),
        s.comp.toFixed(1),
        moy,
        totalPoints,
        appreciation
      ];
    });

    autoTable(doc, {
      startY: 71,
      head: [['Matière', 'Coef', 'Devoir /20', 'Compo /20', 'Moy /20', 'Points', 'Appréciation']],
      body: gradesData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [15, 23, 42]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Summary Box
    doc.setFillColor(241, 245, 249);
    doc.rect(14, finalY, 182, 20, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, finalY, 182, 20, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(`MOYENNE DU TRIMESTRE : ${(student.averageGrade || 14.5).toFixed(2)} / 20`, 20, finalY + 7);
    doc.setTextColor(15, 23, 42);
    doc.text('Rang : 2ème / 32 élèves', 20, finalY + 14);

    doc.text(`Assiduité : ${student.attendanceRate}%`, 110, finalY + 7);
    doc.text(`Mention : ${(student.averageGrade || 14.5) >= 14 ? 'Tableau d’Honneur avec Félicitations' : 'Encouragements'}`, 110, finalY + 14);

    // Signatures
    const signY = finalY + 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Le Professeur Principal', 25, signY);
    doc.text("Le Chef d'Établissement (Visa & Sceau)", 130, signY);

    const filename = `bulletin_${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}_${trimTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('generateReportCardPdf error:', err);
    return false;
  }
};

/**
 * Generates official Payment Receipt (Quittance) PDF
 */
export const generatePaymentReceiptPdf = (
  payment: PaymentRecord,
  schoolName: string = 'Groupe Scolaire Excellence Dakar'
): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [148, 210] // A5 format for receipts
    });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text(schoolName.toUpperCase(), 74, 15, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Avenue Cheikh Anta Diop, Dakar • Tél: +221 33 825 40 50', 74, 19, { align: 'center' });

    doc.setFillColor(30, 41, 59);
    doc.rect(10, 23, 128, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('QUITTANCE DE PAIEMENT SCOLAIRE', 74, 28, { align: 'center' });

    // Details Box
    doc.setDrawColor(203, 213, 225);
    doc.rect(10, 35, 128, 55, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    doc.text('N° de Reçu :', 14, 43);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.receiptNumber, 55, 43);

    doc.setFont('helvetica', 'bold');
    doc.text('Date d’encaissement :', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.date, 55, 50);

    doc.setFont('helvetica', 'bold');
    doc.text('Élève bénéficiaire :', 14, 57);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.studentName, 55, 57);

    doc.setFont('helvetica', 'bold');
    doc.text('Classe :', 14, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.className, 55, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Objet / Période :', 14, 71);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.period, 55, 71);

    doc.setFont('helvetica', 'bold');
    doc.text('Mode de règlement :', 14, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.method} (Réf: ${payment.reference})`, 55, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Caissier(e) :', 14, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.cashierName || 'Économe Principal', 55, 85);

    // Amount Box
    doc.setFillColor(240, 253, 244);
    doc.rect(10, 95, 128, 14, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(10, 95, 128, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    doc.text('MONTANT RÉGLÉ :', 20, 104);
    doc.setFontSize(11);
    doc.text(`${payment.amount.toLocaleString('fr-FR')} FCFA`, 115, 104, { align: 'right' });

    // Stamp
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('[Cachet Économat & Signature]', 95, 122);
    doc.text('Document certifié conforme • EDU-SCHOOL', 14, 135);

    doc.save(`quittance_${payment.receiptNumber.toLowerCase()}.pdf`);
    return true;
  } catch (err) {
    console.error('generatePaymentReceiptPdf error:', err);
    return false;
  }
};

/**
 * Generates official Administrative School Certificate / Attestation PDF
 */
export const generateDocumentPdf = (
  docType: 'CERTIFICAT_SCOLARITE' | 'ATTESTATION_INSCRIPTION' | 'CERTIFICAT_RADIATION' | 'ATTESTATION_SOLDE',
  student: Student,
  school: School,
  includeSeal: boolean = true
): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const todayStr = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    // Flag stripe
    doc.setFillColor(0, 133, 63);
    doc.rect(14, 8, 60, 2, 'F');
    doc.setFillColor(253, 239, 66);
    doc.rect(74, 8, 60, 2, 'F');
    doc.setFillColor(235, 16, 38);
    doc.rect(134, 8, 62, 2, 'F');

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('RÉPUBLIQUE DU SÉNÉGAL', 14, 16);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('Un Peuple — Un But — Une Foi', 14, 20);
    doc.setFont('helvetica', 'normal');
    doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 14, 24);
    doc.text("Inspection d'Académie de Dakar", 14, 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(school.name.toUpperCase(), 196, 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(school.address || "Avenue Cheikh Anta Diop, Dakar", 196, 20, { align: 'right' });
    doc.text(`Tél: ${school.phone || "+221 33 825 40 50"}`, 196, 24, { align: 'right' });
    doc.text(`Année Académique : ${school.academicYear || "2026-2027"}`, 196, 28, { align: 'right' });

    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    const title = docType === 'CERTIFICAT_SCOLARITE' 
      ? 'CERTIFICAT DE SCOLARITÉ'
      : docType === 'ATTESTATION_INSCRIPTION'
      ? "ATTESTATION D'INSCRIPTION"
      : docType === 'CERTIFICAT_RADIATION'
      ? 'CERTIFICAT DE RADIATION'
      : 'ATTESTATION DE NON-DETTE & SOLDE';

    doc.setFillColor(30, 58, 138);
    doc.rect(14, 38, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 105, 44.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Réf : EDS/${school.code || 'GSED'}/${new Date().getFullYear()}/DOC-${student.matricule}`, 14, 56);
    doc.text(`Fait à Dakar, le ${todayStr}`, 196, 56, { align: 'right' });

    // Body text
    const textY = 70;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text("Le Directeur Général du Groupe Scolaire soussigné certifie par la présente que :", 14, textY);

    // Box with student details
    doc.setFillColor(248, 250, 252);
    doc.rect(14, textY + 8, 182, 36, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, textY + 8, 182, 36, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`L'élève : ${student.lastName.toUpperCase()} ${student.firstName}`, 20, textY + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(`Né(e) le : ${student.dateOfBirth || '14/03/2012'} à ${student.placeOfBirth || 'Dakar'}`, 20, textY + 26);
    doc.text(`Matricule National : ${student.matricule}`, 20, textY + 34);
    doc.text(`Classe fréquentée : ${student.className}`, 110, textY + 18);
    doc.text(`Nationalité : ${student.nationality || 'Sénégalaise'}`, 110, textY + 26);
    doc.text(`Parent / Tuteur : ${student.parentName}`, 110, textY + 34);

    // Specific text based on document type
    let specificParagraph = "";
    if (docType === 'CERTIFICAT_SCOLARITE') {
      specificParagraph = `Est régulièrement inscrit(e) et poursuit avec assiduité ses études dans notre établissement au titre de l'année scolaire ${school.academicYear || '2026-2027'} en classe de ${student.className}. En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit auprès des autorités compétentes.`;
    } else if (docType === 'ATTESTATION_INSCRIPTION') {
      specificParagraph = `Est officiellement admis(e) et inscrit(e) sur les registres matricules de l'établissement pour l'année scolaire ${school.academicYear || '2026-2027'} en classe de ${student.className}, les droits d'inscription et de scolarité ayant été dûment acquittés.`;
    } else if (docType === 'CERTIFICAT_RADIATION') {
      specificParagraph = `A été régulièrement inscrit(e) dans notre établissement jusqu'à la date de ce jour. À la demande de son tuteur légal, l'élève est rayé(e) des contrôles de l'école pour transfert d'établissement. Il/Elle est libre de tout engagement envers l'école.`;
    } else {
      specificParagraph = `Est en situation financière parfaitement régulière. L'ensemble des frais de scolarité, droits d'examen et cotisations pour l'année scolaire ${school.academicYear || '2026-2027'} ont été intégralement soldés (Montant restant dû : 0 FCFA).`;
    }

    const splitText = doc.splitTextToSize(specificParagraph, 182);
    doc.text(splitText, 14, textY + 54);

    // Signatures block
    const signY = textY + 95;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text("Le Directeur des Études", 30, signY);
    doc.text("Le Chef d'Établissement", 140, signY);

    if (includeSeal) {
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.8);
      doc.circle(160, signY + 16, 12, 'S');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 58, 138);
      doc.text("GROUPE SCOLAIRE", 160, signY + 14, { align: 'center' });
      doc.text("EXCELLENCE DAKAR", 160, signY + 17, { align: 'center' });
      doc.text("DIRECTION", 160, signY + 20, { align: 'center' });
    }

    doc.save(`${docType.toLowerCase()}_${student.lastName.toLowerCase()}.pdf`);
    return true;
  } catch (err) {
    console.error('generateDocumentPdf error:', err);
    return false;
  }
};
