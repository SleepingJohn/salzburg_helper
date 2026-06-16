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
    issueTitle: string;
  };
  Success: {
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
