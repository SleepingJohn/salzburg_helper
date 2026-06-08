import { ReportSummary } from '../types';

export type TrackingStatus = {
  label: string;
  completed: boolean;
  description: string;
};

const MOCK_REPORT = {
  transcript: 'Graffiti on the building near Kapitelberg 5.',
  germanMessage: 'Graffiti am Gebäude nahe Kapitelberg 5.',
  confirmation: 'Your report has been received. Appropriate action will be taken.',
  germanConfirmation: 'Ihre Meldung wurde empfangen. Es werden geeignete Maßnahmen ergriffen.',
  summary: {
    issue: 'Graffiti',
    location: 'Auto-detected',
    department: 'Public Cleaning Services',
  },
};

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

function getSummaryForText(text: string): ReportSummary {
  const normalized = normalizeText(text);

  if (normalized.includes('graffiti')) {
    return MOCK_REPORT.summary;
  }

  return {
    issue: 'General message',
    location: 'Auto-detected',
    department: 'Citizen Service Center',
  };
}

function wait<T>(value: T, delayMs: number): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delayMs);
  });
}

export async function transcribeVoice(mockTranscript: string): Promise<string> {
  return wait(mockTranscript.trim() || MOCK_REPORT.transcript, 1200);
}

export async function translateToGerman(text: string): Promise<string> {
  const normalized = normalizeText(text);

  if (normalized === 'hello' || normalized === 'hello.') {
    return wait('Hallo.', 900);
  }

  if (normalized.includes('graffiti')) {
    return wait(MOCK_REPORT.germanMessage, 900);
  }

  return wait(text, 900);
}

export async function routeToAuthority(reportText: string): Promise<ReportSummary> {
  return wait(getSummaryForText(reportText), 1100);
}

export async function sendCitizenConfirmation(_summary: ReportSummary) {
  return wait(
    {
      citizenMessage: MOCK_REPORT.confirmation,
      germanMessage: MOCK_REPORT.germanConfirmation,
    },
    500,
  );
}

export async function fetchTrackingStatus(): Promise<TrackingStatus[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { label: 'Received', completed: true, description: 'Your report has been registered.' },
        { label: 'Assigned', completed: true, description: 'A team has been notified.' },
        { label: 'In Progress', completed: false, description: 'Cleanup is underway.' },
        { label: 'Completed', completed: false, description: 'The issue will be closed soon.' },
      ]);
    }, 600);
  });
}
