export type RootStackParamList = {
  Welcome: undefined;
  Record: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
  };
  Processing: {
    nativeLanguage: string;
    mockTranscript: string;
    citizenMessage: string;
    issueTitle?: string;
    fullName?: string;
    email?: string;
    address?: string;
    hasPhoto?: boolean;
    fileName?: string;
    voiceUri?: string;
  };
  Success: {
    reportId: string;
    citizenMessage: string;
    germanMessage: string;
    issue: string;
    location: string;
    department: string;
    nativeLanguage: string;
  };
  Tracking: { reportId?: string } | undefined;
  History: undefined;
  AuthorityDashboard: undefined;
};

export type ReportSummary = {
  issue: string;
  location: string;
  department: string;
};
