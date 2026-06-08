export type RootStackParamList = {
  Welcome: undefined;
  Record: undefined;
  Processing: {
    nativeLanguage: string;
    mockTranscript: string;
  };
  Success: {
    citizenMessage: string;
    germanMessage: string;
    issue: string;
    location: string;
    department: string;
    nativeLanguage: string;
  };
  Tracking: undefined;
  AuthorityDashboard: undefined;
};

export type ReportSummary = {
  issue: string;
  location: string;
  department: string;
};
