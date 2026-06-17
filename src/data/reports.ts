export type ReportStatus =
  | 'received'
  | 'in_review'
  | 'forwarded'
  | 'in_progress'
  | 'needs_more_information'
  | 'resolved'
  | 'rejected';

export type ConversationAttachment = {
  name: string;
  type: 'image' | 'document';
  uri?: string;
};

export type ConversationMessage = {
  id: string;
  sender: 'authority' | 'citizen';
  message: string;
  createdAt: string;
  status?: ReportStatus;
  attachments?: ConversationAttachment[];
};

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
  publicUpdates: ConversationMessage[];
  attachments: string[];
};

export const statusLabels: Record<ReportStatus, string> = {
  received: 'Received',
  in_review: 'In review',
  forwarded: 'Forwarded',
  in_progress: 'In progress',
  needs_more_information: 'Needs more information',
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
    publicUpdates: [
      {
        id: 'update-00124-1',
        sender: 'authority',
        message: 'Your report has been received by Stadt Salzburg.',
        createdAt: 'Today, 10:44',
        status: 'received',
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
    publicUpdates: [
      {
        id: 'update-00102-1',
        sender: 'authority',
        message: 'The bin was emptied and the area was cleaned.',
        createdAt: 'Jun 4, 2026',
        status: 'resolved',
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
    publicUpdates: [
      {
        id: 'update-00094-1',
        sender: 'authority',
        message: 'The faulty connector was replaced by Public Lighting.',
        createdAt: 'May 27, 2026',
        status: 'resolved',
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
    publicUpdates: [
      {
        id: 'update-00081-1',
        sender: 'authority',
        message: 'The paving stone was reset and the area is secured.',
        createdAt: 'May 13, 2026',
        status: 'resolved',
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
    status: 'in_review',
    priority: 'high',
    confidence: 89,
    createdAt: 'Jun 12, 2026',
    updatedAt: 'Today, 09:15',
    citizenName: 'David R.',
    citizenEmail: 'david@example.com',
    citizenMessage: 'Temporary sign forces cyclists into car traffic during morning rush.',
    translatedMessage: 'Ein temporäres Schild zwingt Radfahrende im Morgenverkehr in den Autoverkehr.',
    publicUpdates: [
      {
        id: 'update-00076-1',
        sender: 'authority',
        message: 'Traffic Management is reviewing the report and checking the location.',
        createdAt: 'Today, 09:15',
        status: 'in_review',
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
    publicUpdates: report.publicUpdates.map(update => ({
      ...update,
      attachments: update.attachments?.map(attachment => ({ ...attachment })),
    })),
  }));
}

export function getReportById(id: string) {
  const report = reports.find(item => item.id === id);
  return report
    ? {
        ...report,
        attachments: [...report.attachments],
        publicUpdates: report.publicUpdates.map(update => ({
          ...update,
          attachments: update.attachments?.map(attachment => ({ ...attachment })),
        })),
      }
    : undefined;
}

export function getCurrentReport() {
  const report = reports.find(item => item.id === 'SAL - 2026 - 00124') ?? reports[0];
  return {
    ...report,
    attachments: [...report.attachments],
    publicUpdates: report.publicUpdates.map(update => ({
      ...update,
      attachments: update.attachments?.map(attachment => ({ ...attachment })),
    })),
  };
}

export function updateReport(id: string, patch: Partial<CitizenReport>) {
  const index = reports.findIndex(report => report.id === id);

  if (index === -1) {
    return;
  }

  const nextStatus = patch.status;
  const shouldClearResolvedAt = Boolean(nextStatus && nextStatus !== 'resolved');

  reports[index] = {
    ...reports[index],
    ...patch,
    updatedAt: patch.updatedAt ?? 'Just now',
    resolvedAt: nextStatus === 'resolved'
      ? patch.resolvedAt ?? 'Just now'
      : shouldClearResolvedAt
        ? undefined
        : patch.resolvedAt ?? reports[index].resolvedAt,
  };
  emitReportsChanged();
}

export function addReportUpdate(
  id: string,
  message: string,
  status: ReportStatus,
  attachments: ConversationAttachment[] = [],
) {
  const index = reports.findIndex(report => report.id === id);
  const trimmedMessage = message.trim();

  if (index === -1 || !trimmedMessage) {
    return;
  }

  const shouldClearResolvedAt = status !== 'resolved';

  reports[index] = {
    ...reports[index],
    status,
    updatedAt: 'Just now',
    resolvedAt: status === 'resolved' ? 'Just now' : shouldClearResolvedAt ? undefined : reports[index].resolvedAt,
    publicUpdates: [
      {
        id: `update-${id}-${Date.now()}`,
        sender: 'authority',
        message: trimmedMessage,
        createdAt: 'Just now',
        status,
        attachments: attachments.map(attachment => ({ ...attachment })),
      },
      ...reports[index].publicUpdates,
    ],
  };
  emitReportsChanged();
}

export function addCitizenReply(id: string, message: string, attachments: ConversationAttachment[] = []) {
  const index = reports.findIndex(report => report.id === id);
  const trimmedMessage = message.trim();

  if (index === -1 || (!trimmedMessage && attachments.length === 0)) {
    return;
  }

  reports[index] = {
    ...reports[index],
    updatedAt: 'Just now',
    publicUpdates: [
      {
        id: `reply-${id}-${Date.now()}`,
        sender: 'citizen',
        message: trimmedMessage || 'Attachment added.',
        createdAt: 'Just now',
        attachments: attachments.map(attachment => ({ ...attachment })),
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
  const hasAuthorityUpdate = report.status !== 'received';
  const currentStatusLabel =
    report.status === 'received' ? 'Authority review' : isClosed ? 'Final decision' : statusLabels[report.status];

  return [
    {
      label: 'Received',
      completed: true,
      description: 'Your report has been registered.',
      timestamp: report.createdAt,
    },
    {
      label: currentStatusLabel,
      completed: hasAuthorityUpdate,
      description: `${report.department} is handling the report.`,
      timestamp: hasAuthorityUpdate ? report.updatedAt : 'Pending',
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
