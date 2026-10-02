export type AlertChannel = 'SMS_AND_EMAIL' | 'SMS' | 'EMAIL';

export interface AttendanceAlertConfig {
  enabled: boolean;
  channel: AlertChannel;
  autoSendOnSave: boolean;
  senderName: string; // e.g., 'GS-EXCELLENCE'
  replyEmail: string; // e.g., 'viescolaire@excellence-dakar.sn'
  smsTemplate: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
}

export interface DispatchedAlert {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  channel: 'SMS' | 'EMAIL' | 'SMS_AND_EMAIL';
  sentAt: string;
  status: 'DELIVRE' | 'EN_COURS' | 'ECHOUE';
  smsContent?: string;
  emailContent?: string;
  reason: string;
  date: string;
  hour: string;
}

export const DEFAULT_ALERT_CONFIG: AttendanceAlertConfig = {
  enabled: true,
  channel: 'SMS_AND_EMAIL',
  autoSendOnSave: true,
  senderName: 'GS-EXCELLENCE',
  replyEmail: 'viescolaire@excellence-dakar.sn',
  smsTemplate: `[GS EXCELLENCE] Bonjour {PARENT}, nous vous informons que votre enfant {ELEVE} ({CLASSE}) est noté(e) ABSENT(E) ce {DATE} ({CRENEAU}). Motif: {MOTIF}. Vie Scolaire: {TELEPHONE_ECOLE}.`,
  emailSubjectTemplate: `Notification d'Absence Scolaire - {ELEVE} ({CLASSE}) - {DATE}`,
  emailBodyTemplate: `Madame, Monsieur {PARENT},

Nous vous informons par la présente que votre enfant {ELEVE}, élève en classe de {CLASSE} (Matricule: {MATRICULE}), a été enregistré(e) absent(e) lors de l'appel de ce jour :

• Date : {DATE}
• Créneau horaire : {CRENEAU}
• Statut constaté : Absence ({MOTIF})
• Établissement : {ETABLISSEMENT}

Conformément au règlement intérieur de l'établissement, toute absence doit faire l'objet d'un justificatif écrit (certificat médical, mot signé ou contact direct avec la Vie Scolaire) dans les 48 heures ouvrables.

Si cette absence a déjà été signalée auprès de nos services, veuillez ne pas tenir compte de ce rappel automatique.

Pour toute question ou régularisation, le bureau de la Vie Scolaire reste à votre entière disposition au {TELEPHONE_ECOLE} ou par retour de cet e-mail.

Bien cordialement,
Le Service de la Vie Scolaire & Direction des Études
{ETABLISSEMENT}`
};

export function interpolateAlertTemplate(
  template: string,
  params: {
    studentName: string;
    firstName: string;
    lastName: string;
    className: string;
    matricule: string;
    parentName: string;
    date: string;
    hour: string;
    reason: string;
    schoolName: string;
    schoolPhone: string;
  }
): string {
  return template
    .replace(/{ELEVE}/g, params.studentName)
    .replace(/{PRENOM}/g, params.firstName)
    .replace(/{NOM}/g, params.lastName)
    .replace(/{CLASSE}/g, params.className)
    .replace(/{MATRICULE}/g, params.matricule)
    .replace(/{PARENT}/g, params.parentName)
    .replace(/{DATE}/g, params.date)
    .replace(/{CRENEAU}/g, params.hour)
    .replace(/{MOTIF}/g, params.reason)
    .replace(/{ETABLISSEMENT}/g, params.schoolName)
    .replace(/{TELEPHONE_ECOLE}/g, params.schoolPhone);
}
