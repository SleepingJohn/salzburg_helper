export type ReportStatus = 'received' | 'resolved' | 'rejected';

export type CitizenReport = {
  id: string;
  title: string;
  issue: string;
  location: string;
  department: string;
  status: ReportStatus;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  citizenName: string;
  citizenEmail: string;
  citizenMessage: string;
  translatedMessage: string;
  internalComment: string;
  publicUpdates: {
    id: string;
    message: string;
    createdAt: string;
  }[];
  attachments: string[];
};

export const statusLabels: Record<ReportStatus, string> = {
  received: 'Received',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const reports: CitizenReport[] = [
  {
    id: 'SAL - 2026 - 00124',
    title: 'General message from citizen',
    issue: 'General message',
    location: 'Faberstrasse 10, 5020 Salzburg',
    department: 'Citizen Service Center',
    status: 'received',
    priority: 'low',
    confidence: 88,
    createdAt: 'Today, 10:24',
    updatedAt: 'Today, 10:44',
    citizenName: 'Johann Halber',
    citizenEmail: 'j.halber@gmail.com',
    citizenMessage: 'pls help i lost my show. Address: Salzburg',
    translatedMessage: 'Bitte helfen Sie mir, ich habe meine Show verloren. Adresse: Salzburg',
    internalComment: 'Check if this needs more citizen detail before forwarding.',
    publicUpdates: [
      {
        id: 'update-00124-1',
        message: 'Your report has been received and is waiting for assignment.',
        createdAt: 'Today, 10:44',
      },
    ],
    attachments: ['voice memo'],
  },
  {
    id: 'SAL - 2026 - 00102',
    title: 'Overflowing bin at Mirabellplatz',
    issue: 'Waste',
    location: 'Mirabellplatz',
    department: 'Waste Management',
    status: 'resolved',
    priority: 'medium',
    confidence: 93,
    createdAt: 'Jun 2, 2026',
    updatedAt: 'Jun 4, 2026',
    resolvedAt: 'Jun 4, 2026',
    citizenName: 'Mira S.',
    citizenEmail: 'mira@example.com',
    citizenMessage: 'The bin at the bus stop is overflowing and waste is spreading onto the sidewalk.',
    translatedMessage: 'Der Mistkübel an der Haltestelle ist überfüllt und Müll verteilt sich am Gehsteig.',
    internalComment: 'Bin was emptied and the surrounding sidewalk was cleaned.',
    publicUpdates: [
      {
        id: 'update-00102-1',
        message: 'The bin was emptied and the area was cleaned.',
        createdAt: 'Jun 4, 2026',
      },
    ],
    attachments: ['photo'],
  },
  {
    id: 'SAL - 2026 - 00094',
    title: 'Flickering street light',
    issue: 'Street lighting',
    location: 'Linzer Gasse 12',
    department: 'Public Lighting',
    status: 'resolved',
    priority: 'high',
    confidence: 96,
    createdAt: 'May 24, 2026',
    updatedAt: 'May 27, 2026',
    resolvedAt: 'May 27, 2026',
    citizenName: 'Jonas M.',
    citizenEmail: 'jonas@example.com',
    citizenMessage: 'Street light outside house 12 switches off every few minutes after sunset.',
    translatedMessage: 'Die Straßenlampe vor Haus 12 schaltet sich nach Sonnenuntergang alle paar Minuten aus.',
    internalComment: 'Lamp unit was inspected and the faulty connector was replaced.',
    publicUpdates: [
      {
        id: 'update-00094-1',
        message: 'The faulty connector was replaced by Public Lighting.',
        createdAt: 'May 27, 2026',
      },
    ],
    attachments: [],
  },
  {
    id: 'SAL - 2026 - 00081',
    title: 'Loose paving stone',
    issue: 'Roads',
    location: 'Mozartplatz',
    department: 'Road Maintenance',
    status: 'resolved',
    priority: 'medium',
    confidence: 91,
    createdAt: 'May 10, 2026',
    updatedAt: 'May 13, 2026',
    resolvedAt: 'May 13, 2026',
    citizenName: 'Anna K.',
    citizenEmail: 'anna@example.com',
    citizenMessage: 'A paving stone is rocking near the crossing and people keep stepping around it.',
    translatedMessage: 'Ein Pflasterstein wackelt nahe der Kreuzung und Menschen weichen ihm aus.',
    internalComment: 'Paving stone was reset and the surrounding surface was secured.',
    publicUpdates: [
      {
        id: 'update-00081-1',
        message: 'The paving stone was reset and the area is secured.',
        createdAt: 'May 13, 2026',
      },
    ],
    attachments: ['photo'],
  },
  {
    id: 'SAL - 2026 - 00076',
    title: 'Bike lane blocked by sign',
    issue: 'Transport',
    location: 'Elisabethkai',
    department: 'Traffic Management',
    status: 'received',
    priority: 'high',
    confidence: 89,
    createdAt: 'Jun 12, 2026',
    updatedAt: 'Today, 09:15',
    citizenName: 'David R.',
    citizenEmail: 'david@example.com',
    citizenMessage: 'Temporary sign forces cyclists into car traffic during morning rush.',
    translatedMessage: 'Ein temporäres Schild zwingt Radfahrende im Morgenverkehr in den Autoverkehr.',
    internalComment: 'Field crew scheduled to move signage.',
    publicUpdates: [
      {
        id: 'update-00076-1',
        message: 'Your report has been received and is waiting for assignment.',
        createdAt: 'Today, 09:15',
      },
    ],
    attachments: ['photo'],
  },
];

const listeners = new Set<() => void>();

function emitReportsChanged() {
  listeners.forEach(listener => listener());
}

export function subscribeReports(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listReports() {
  return reports.map(report => ({
    ...report,
    attachments: [...report.attachments],
    publicUpdates: report.publicUpdates.map(update => ({ ...update })),
  }));
}

export function getReportById(id: string) {
  const report = reports.find(item => item.id === id);
  return report
    ? {
        ...report,
        attachments: [...report.attachments],
        publicUpdates: report.publicUpdates.map(update => ({ ...update })),
      }
    : undefined;
}

export function getCurrentReport() {
  const report = reports.find(item => item.id === 'SAL - 2026 - 00124') ?? reports[0];
  return {
    ...report,
    attachments: [...report.attachments],
    publicUpdates: report.publicUpdates.map(update => ({ ...update })),
  };
}

export function updateReport(id: string, patch: Partial<CitizenReport>) {
  const index = reports.findIndex(report => report.id === id);

  if (index === -1) {
    return;
  }

  const nextStatus = patch.status;
  reports[index] = {
    ...reports[index],
    ...patch,
    updatedAt: patch.updatedAt ?? 'Just now',
    resolvedAt: nextStatus === 'resolved' ? patch.resolvedAt ?? 'Just now' : patch.resolvedAt ?? reports[index].resolvedAt,
  };
  emitReportsChanged();
}

export function addReportUpdate(id: string, message: string) {
  const index = reports.findIndex(report => report.id === id);
  const trimmedMessage = message.trim();

  if (index === -1 || !trimmedMessage) {
    return;
  }

  reports[index] = {
    ...reports[index],
    updatedAt: 'Just now',
    publicUpdates: [
      {
        id: `update-${id}-${Date.now()}`,
        message: trimmedMessage,
        createdAt: 'Just now',
      },
      ...reports[index].publicUpdates,
    ],
  };
  emitReportsChanged();
}

export function getResolvedReports() {
  return listReports().filter(report => report.status === 'resolved');
}

export function getTrackingSteps(report: CitizenReport) {
  const isClosed = report.status === 'resolved' || report.status === 'rejected';

  return [
    {
      label: 'Received',
      completed: true,
      description: 'Your report has been registered.',
      timestamp: report.createdAt,
    },
    {
      label: report.status === 'rejected' ? 'Closed' : 'Resolved',
      completed: isClosed,
      description:
        report.status === 'rejected'
          ? 'This report was closed by the authority.'
          : 'The report will close when the authority marks it as resolved.',
      timestamp: report.resolvedAt ?? 'Pending',
    },
  ];
}
