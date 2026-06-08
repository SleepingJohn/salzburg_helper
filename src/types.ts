export type RootStackParamList = {
  Welcome: undefined;
  Record: undefined;
  Processing: {
    nativeLanguage: string;
    mockTranscript: string;
    voiceUri?: string;
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
};

export type ReportSummary = {
  issue: string;
  location: string;
  department: string;
};
