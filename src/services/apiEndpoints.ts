const createApi =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

export const endPoints = {
  // Auth
  login: `${createApi}/Org/User/PushLogin`,
  getFinancialYear: `${createApi}/Org/GetFinancialYear`,
  getActiveYear: (org_id: number) =>
    `${createApi}/Org/GetActiveYear?org_id=${org_id}`,
  getSidebar: `${createApi}/Org/User/GetSidebar`,
  // Profile (head office: includes sub-branch list)
  getProfile: `${createApi}/Org/User/GetProfile`,
  updateProfile: `${createApi}/Org/User/UpdateProfile`,
  // Dashboard (branch-aware: expands head branch to all sub-branches)
  getDashboard: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
  ) =>
    `${createApi}/Org/User/GetDashboard?org_id=${orgId}&branch_id=${branchId}&from_date=${fromDate}&to_date=${toDate}`,
  // Branch-specific dashboard (single branch only)
  getDashboardItem: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
  ) =>
    `${createApi}/Org/User/GetDashboard_item?org_id=${orgId}&branch_id=${branchId}&from_date=${fromDate}&to_date=${toDate}`,

  // Process/Setup Master
  getAreaList: (orgId: number, branchId: number) =>
    `${createApi}/Org/ProcessMaster/GetAreaList?org_id=${orgId}&branch_id=${branchId}`,
  addArea: `${createApi}/Org/ProcessMaster/AddArea`,
  updateArea: `${createApi}/Org/ProcessMaster/UpdateArea`,
  deleteArea: `${createApi}/Org/ProcessMaster/DeleteArea`,
  getApplicationOption: (groupId: number) =>
    `${createApi}/Org/ProcessMaster/GetApplicationOption?group_id=${groupId}`,

  getHolidayList: (orgId: number) =>
    `${createApi}/Org/ProcessMaster/GetHolidayList?org_id=${orgId}`,
  addHoliday: `${createApi}/Org/ProcessMaster/AddHoliday`,
  updateHoliday: `${createApi}/Org/ProcessMaster/UpdateHoliday`,
  deleteHoliday: `${createApi}/Org/ProcessMaster/DeleteHoliday`,

  getLoanPurpose: (orgId: number) =>
    `${createApi}/Org/ProcessMaster/GetLoanPurpose?org_id=${orgId}`,
  addLoanPurpose: `${createApi}/Org/ProcessMaster/AddLoanPurpose`,
  updateLoanPurpose: `${createApi}/Org/ProcessMaster/UpdateLoanPurpose`,
  deleteLoanPurpose: `${createApi}/Org/ProcessMaster/DeleteLoanPurpose`,

  getSchemeList: (orgId: number) =>
    `${createApi}/Org/ProcessLoan/GetScheme?org_id=${orgId}`,
  addScheme: `${createApi}/Org/ProcessMaster/AddScheme`,
  updateScheme: `${createApi}/Org/ProcessMaster/UpdateScheme`,
  deleteScheme: `${createApi}/Org/ProcessMaster/DeleteScheme`,

  // Manage Profile
  getCoList: (orgId: number, branch_id: number, keyword?: string) =>
    keyword
      ? `${createApi}/Org/ManageProfile/GetCoList?org_id=${orgId}&branch_id=${branch_id}&keyword=${encodeURIComponent(keyword)}`
      : `${createApi}/Org/ManageProfile/GetCoList?org_id=${orgId}&branch_id=${branch_id}`,
  searchCo: (orgId: number, keyword: string, branchId: number) =>
    `${createApi}/Org/ManageProfile/SearchCo?org_id=${orgId}&keyword=${encodeURIComponent(keyword)}&branch_id=${branchId}`,
  getCoData: (
    orgId: number,
    branchId: number,
    coId?: number,
    coCode?: string,
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
    });
    if (coId) params.set("co_id", String(coId));
    if (coCode) params.set("co_code", coCode);
    return `${createApi}/Org/ManageProfile/GetCoData?${params.toString()}`;
  },
  addCo: `${createApi}/Org/ManageProfile/AddCo`,
  updateCo: `${createApi}/Org/ManageProfile/UpdateCo`,

  // dhd
  getGroupList: (orgId: number, branchId: number) =>
    `${createApi}/Org/ManageProfile/GetGroupList?org_id=${orgId}&branch_id=${branchId}`,
  searchGroup: (orgId: number, keyword: string, branchId: number) =>
    `${createApi}/Org/ManageProfile/SearchGroup?org_id=${orgId}&keyword=${encodeURIComponent(keyword)}&branch_id=${branchId}`,
  getGroupData: (orgId: number, groupNo: string, branchId: number) =>
    `${createApi}/Org/ManageProfile/GetGroupData?org_id=${orgId}&group_no=${groupNo}&branch_id=${branchId}`,
  addGroup: `${createApi}/Org/ManageProfile/AddGroup`,
  updateGroup: `${createApi}/Org/ManageProfile/UpdateGroup`,
  getMiscConfig: (orgId: number, branchId: number) =>
    `${createApi}/Org/ManageProfile/GetMiscConfig?org_id=${orgId}&branch_id=${branchId}`,

  searchMember: (
    orgId: number,
    keyword: string,
    branchId: number,
    page: number,
  ) =>
    `${createApi}/Org/ManageProfile/SearchMember?org_id=${orgId}&keyword=${encodeURIComponent(keyword)}&branch_id=${branchId}&page=${page}`,
  getMemberList: (orgId: number, branchId: number) =>
    `${createApi}/Org/ManageProfile/GetMemberList?org_id=${orgId}&branch_id=${branchId}`,
  getMemberData: (orgId: number, memNo: string, branchId: number) =>
    `${createApi}/Org/ManageProfile/GetMemberData?org_id=${orgId}&mem_no=${memNo}&branch_id=${branchId}`,
  addMember: `${createApi}/Org/ManageProfile/AddMember`,
  updateMember: `${createApi}/Org/ManageProfile/UpdateMember`,

  // Process Loan
  getScheme: (orgId: number) =>
    `${createApi}/Org/ProcessLoan/GetScheme?org_id=${orgId}`,
  getGroupMember: (orgId: number, grpId: number | string) =>
    `${createApi}/Org/ProcessLoan/GetGroupMember?org_id=${orgId}&grp_id=${grpId}`,
  getLoanEligibleMember: (orgId: number, grpId: number | string) =>
    `${createApi}/Org/ProcessLoan/GetLoanEligibleMember?org_id=${orgId}&grp_id=${grpId}`,
  getLoanOtherInfo: (
    orgId: number,
    schemeId: number,
    loanDate: string,
    memId: number,
    applAmt: number,
  ) =>
    `${createApi}/Org/ProcessLoan/GetLoanOtherInfo?org_id=${orgId}&schem_id=${schemeId}&loan_date=${loanDate}&mem_id=${memId}&appl_amt=${applAmt}`,
  postApplication: `${createApi}/Org/ProcessLoan/PostApplication`,
  getSahayikaList: (orgId: number, branchId: number) =>
    `${createApi}/Org/ProcessLoan/GetSahayikaList?org_id=${orgId}&branch_id=${branchId}`,
  getSahayikaGroupList: (orgId: number, branchId: number, coId: number) =>
    `${createApi}/Org/ProcessLoan/GetSahayikaGroupList?org_id=${orgId}&branch_id=${branchId}&co_id=${coId}`,
  generateDemand: `${createApi}/Org/ProcessLoan/GenerateDemand`,
  previewDemand: `${createApi}/Org/ProcessLoan/PreviewDemand`,
  getDemandCoWise: (query: string) =>
    `${createApi}/Org/ProcessLoan/GetDemandCoWise?${query}`,
  getDemandGroupWise: (query: string) =>
    `${createApi}/Org/ProcessLoan/GetDemandGroupWise?${query}`,
  getDemandMemberWise: (query: string) =>
    `${createApi}/Org/ProcessLoan/GetDemandMemberWise?${query}`,
  getDemandInstallments: (query: string) =>
    `${createApi}/Org/ProcessLoan/GetDemandInstallments?${query}`,
  getDemandCollectionDetails: (query: string) =>
    `${createApi}/Org/ProcessLoan/GetDemandCollectionDetails?${query}`,
  postDemandCollection: `${createApi}/Org/ProcessLoan/PostDemandCollection`,

  // Branch List
  getBranchList: (orgId: number) =>
    `${createApi}/Org/ProcessMaster/GetBranchList?org_id=${orgId}`,

  // DetailedList
  getGroupLoanReport: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    schemeId?: number | string | null,
  ) => {
    const base = `${createApi}/Org/ManageProfile/GetGroupLoanReport?branch_id=${branchId}&org_id=${orgId}&from_date=${fromDate}&to_date=${toDate}`;
    if (
      schemeId !== undefined &&
      schemeId !== null &&
      String(schemeId).trim() !== "" &&
      Number(schemeId) !== 0
    ) {
      return `${base}&scheme_id=${schemeId}`;
    }
    return base;
  },

  //collection-register
  getAllGroupList: (orgId: number, branchId?: string | number) =>
    `${createApi}/Org/ManageProfile/GetAllGroupList?org_id=${orgId}&branch_id=${branchId}`,
  getAllMemberList: (orgId: number, groupId: string) =>
    `${createApi}/Org/ManageProfile/GetAllMemberList?org_id=${orgId}&group_id=${groupId}`,
  getGroupMemberList: (orgId: number, groupId: string | number) =>
    `${createApi}/Org/ManageProfile/GetGroupMemberList?org_id=${orgId}&group_id=${groupId}`,
  getLoanCollectionReport: (
    orgId: number,
    groupId: string,
    memberId: string,
    fromDate: string,
    toDate: string,
    branchId: string,
    loancycleId: string,
  ) =>
    `${createApi}/Org/ManageProfile/GetLoanCollectionReport?org_id=${orgId}&group_id=${groupId}&member_id=${memberId}&from_date=${fromDate}&to_date=${toDate}&branch_id=${branchId}&loan_cycle=${loancycleId}`,
  getLoanCycleList: (
    orgId: number,
    branchId: number,
    groupId: string,
    memberId: string,
  ) =>
    `${createApi}/Org/ProcessLoan/GetLoanCycleList?org_id=${orgId}&branch_id=${branchId}&group_id=${groupId}&member_id=${memberId}`,

  // Voucher page
  getLedgerList: (orgId: number) =>
    `${createApi}/Org/ProcessVoucher/GetLedgerList?org_id=${orgId}`,
  postVoucher: `${createApi}/Org/ProcessVoucher/PostVoucher`,

  // cashAccount
  cashAccount: (
    org_id: number,
    from_date: string,
    to_date: string,
    branch_id: string,
  ) =>
    `${createApi}/Org/FinancialReport/CashAccount?org_id=${org_id}&from_date=${from_date}&to_date=${to_date}&branch_id=${branch_id}`,

  getDisbursementList: (orgId: number, branchId: number) =>
    `${createApi}/Org/ProcessLoan/GetDisbursementList?org_id=${orgId}&branch_id=${branchId}`,
  getDisbursementDetails: (org_id: number, grp_id: number, loan_date: string) =>
    `${createApi}/Org/ProcessLoan/GetDisbursementDetails?org_id=${org_id}&grp_id=${grp_id}&loan_date=${loan_date}`,
  postDisbursement: `${createApi}/Org/ProcessLoan/PostDisbursement`,

  // Loan Collection
  getCollectionLoanList: (params: {
    orgId: number;
    branchId: number;
    groupId: string | number;
    collDate?: string;
    memberIds?: Array<string | number>;
    accountIds?: Array<string | number>;
  }) => {
    const query = new URLSearchParams({
      org_id: String(params.orgId),
      branch_id: String(params.branchId),
      group_id: String(params.groupId),
    });
    if (params.collDate) query.set("coll_date", params.collDate);
    if (params.memberIds?.length) query.set("member_ids", params.memberIds.join(","));
    if (params.accountIds?.length) query.set("account_ids", params.accountIds.join(","));
    return `${createApi}/Org/ProcessLoan/GetLoanCycleList?${query.toString()}`;
  },
  calcCollectionSplit: `${createApi}/Org/ProcessLoan/CalcCollectionSplit`,
  postCollection: `${createApi}/Org/ProcessLoan/PostCollection`,

  // Rectify — Collection Repayment
  getCollRectifyList: (query: string) =>
    `${createApi}/Org/Rectify/GetCollectionList?${query}`,
  getCollRectifyDetails: (query: string) =>
    `${createApi}/Org/Rectify/GetCollectionDetails?${query}`,
  getCollRectifyLoans: (query: string) =>
    `${createApi}/Org/Rectify/GetTargetLoans?${query}`,
  postCollRectify: `${createApi}/Org/Rectify/PostCollectionRectify`,
  deleteCollRectify: `${createApi}/Org/Rectify/DeleteCollection`,
  getRectifyHistory: (query: string) =>
    `${createApi}/Org/Rectify/GetRectifyHistory?${query}`,
  getRectifyLog: (query: string) =>
    `${createApi}/Org/Rectify/GetRectifyLog?${query}`,
  getRectifyLogDetails: (query: string) =>
    `${createApi}/Org/Rectify/GetRectifyLogDetails?${query}`,

  // Rectify — Loan Issue
  getLoanRectifyList: (query: string) =>
    `${createApi}/Org/Rectify/GetLoanIssueList?${query}`,
  getLoanRectifyDetails: (query: string) =>
    `${createApi}/Org/Rectify/GetLoanIssueDetails?${query}`,
  calcLoanRectifyTerms: (query: string) =>
    `${createApi}/Org/Rectify/CalcLoanIssueTerms?${query}`,
  postLoanRectify: `${createApi}/Org/Rectify/PostLoanIssueRectify`,
  deleteLoanRectify: `${createApi}/Org/Rectify/DeleteLoanIssue`,
  getLoanRectifyHistory: (query: string) =>
    `${createApi}/Org/Rectify/GetLoanIssueRectifyHistory?${query}`,
  getLoanRectifyLog: (query: string) =>
    `${createApi}/Org/Rectify/GetLoanIssueRectifyLog?${query}`,
  getLoanRectifyLogDetails: (query: string) =>
    `${createApi}/Org/Rectify/GetLoanIssueRectifyLogDetails?${query}`,

  // Rectify — Loan Opening Entry (date is always 2026-03-31)
  getOpeningEntry: (query: string) =>
    `${createApi}/Org/Rectify/GetOpeningEntry?${query}`,
  postOpeningEntry: `${createApi}/Org/Rectify/PostOpeningEntry`,
  getOpeningEntryLog: (query: string) =>
    `${createApi}/Org/Rectify/GetOpeningEntryLog?${query}`,
  getOpeningEntryLogDetails: (query: string) =>
    `${createApi}/Org/Rectify/GetOpeningEntryLogDetails?${query}`,

  // Customer Reports — Group Register
  getGroupRegister: (
    orgId: number,
    branchId: number,
    fromDate?: string,
    toDate?: string,
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
    });
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    return `${createApi}/Org/ManageProfile/GetGroupList?${params.toString()}`;
  },

  // Customer Reports — Member Register
  getMemberRegister: (
    orgId: number,
    branchId: number,
    fromDate?: string,
    toDate?: string,
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
    });
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    return `${createApi}/Org/ManageProfile/GetMemberList?${params.toString()}`;
  },

  // Loan Reports — Issue Register
  getIssueRegister: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    groupId?: number,
  ) =>
    `${createApi}/Org/ProcessLoan/GetLoanIssueRegister?org_id=${orgId}&branch_id=${branchId}&from_date=${fromDate}&to_date=${toDate}${groupId ? `&group_id=${groupId}` : ""}`,

  // Loan Reports — Collection Register (trans_loanappl_collection by Coll_Date)
  // group_id=0 means all groups in the branch; member/cycle left as 0 for the full register.
  getCollectionRegister: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    groupId?: number,
  ) =>
    `${createApi}/Org/ManageProfile/GetLoanCollectionReport?org_id=${orgId}&group_id=${groupId || 0}&member_id=0&from_date=${fromDate}&to_date=${toDate}&branch_id=${branchId}&loan_cycle=0`,

  // MIS Reports — Daily Sheet
  getDailySheet: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    reportBranchId?: number | null,
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
      from_date: fromDate,
    });
    if (toDate) params.set("to_date", toDate);
    if (reportBranchId !== undefined && reportBranchId !== null) {
      params.set("report_branch_id", String(reportBranchId));
    }
    return `${createApi}/Org/MisReport/DailySheet?${params.toString()}`;
  },
  getDailySheetDetails: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    reportBranchId?: number | null,
    accountId?: number | null,
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
      from_date: fromDate,
    });
    if (toDate) params.set("to_date", toDate);
    if (reportBranchId !== undefined && reportBranchId !== null) {
      params.set("report_branch_id", String(reportBranchId));
    }
    if (accountId !== undefined && accountId !== null) {
      params.set("account_id", String(accountId));
    }
    return `${createApi}/Org/MisReport/DailySheetDetails?${params.toString()}`;
  },
  getMonthlyStatementOfAccounts: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    reportBranchId?: number | null,
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
      from_date: fromDate,
      to_date: toDate,
    });
    if (reportBranchId !== undefined && reportBranchId !== null && reportBranchId > 0) {
      params.set("report_branch_id", String(reportBranchId));
    }
    return `${createApi}/Org/MisReport/MonthlyStatementOfAccounts?${params.toString()}`;
  },

  getDefaultParCalculation: (query: {
    orgId: number; branchId: number; fromDate: string; toDate: string;
    reportBranchId?: number; coId?: number; view: string; page: number; perPage: number;
  }) => {
    const params = new URLSearchParams({ org_id: String(query.orgId), branch_id: String(query.branchId), from_date: query.fromDate, to_date: query.toDate, view: query.view, page: String(query.page), per_page: String(query.perPage) });
    if (query.reportBranchId !== undefined && query.reportBranchId > 0) params.set("report_branch_id", String(query.reportBranchId));
    if (query.coId !== undefined) params.set("co_id", String(query.coId));
    return `${createApi}/Org/MisReport/DefaultParCalculation?${params.toString()}`;
  },

  getLoanPortfolioAnalysis: (query: {
    orgId: number; branchId: number; fromDate: string; toDate: string;
    reportBranchId?: number; coId?: number; view: string; page: number; perPage: number;
  }) => {
    const params = new URLSearchParams({ org_id: String(query.orgId), branch_id: String(query.branchId), from_date: query.fromDate, to_date: query.toDate, view: query.view, page: String(query.page), per_page: String(query.perPage) });
    if (query.reportBranchId !== undefined && query.reportBranchId > 0) params.set("report_branch_id", String(query.reportBranchId));
    if (query.coId !== undefined) params.set("co_id", String(query.coId));
    return `${createApi}/Org/MisReport/LoanPortfolioAnalysis?${params.toString()}`;
  },

  // MIS Reports — Receipt Payment Scroll
  getReceiptPaymentScroll: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
    options?: {
      reportBranchId?: number | string | null;
      coId?: number | string | null;
      scrollType?: string | null;
      view?: string | null;
      page?: number | null;
      perPage?: number | null;
    },
  ) => {
    const params = new URLSearchParams({
      org_id: String(orgId),
      branch_id: String(branchId),
      from_date: fromDate,
      to_date: toDate,
    });
    if (
      options?.reportBranchId !== undefined &&
      options?.reportBranchId !== null &&
      options.reportBranchId !== "" &&
      Number(options.reportBranchId) > 0
    ) {
      params.set("report_branch_id", String(options.reportBranchId));
    }
    if (
      options?.coId !== undefined &&
      options?.coId !== null &&
      options.coId !== ""
    ) {
      params.set("co_id", String(options.coId));
    }
    if (options?.scrollType && options.scrollType !== "all") {
      params.set("scroll_type", String(options.scrollType).toLowerCase());
    }
    if (options?.view) {
      params.set("view", String(options.view).toLowerCase());
    }
    if (options?.page && options.page > 1) {
      params.set("page", String(options.page));
    }
    if (options?.perPage) {
      params.set("per_page", String(options.perPage));
    }
    return `${createApi}/Org/MisReport/ReceiptPaymentScroll?${params.toString()}`;
  },

  // MIS Reports — Demand vs Collection
  getDemandVsCollection: (query: {
    orgId: number;
    branchId: number;
    fromDate: string;
    toDate: string;
    view: string;
    reportBranchId?: number | null;
    coId?: number | null;
    groupId?: number | null;
  }) => {
    const params = new URLSearchParams({
      org_id: String(query.orgId),
      branch_id: String(query.branchId),
      from_date: query.fromDate,
      to_date: query.toDate,
      view: query.view,
    });
    if (query.reportBranchId !== undefined && query.reportBranchId !== null) {
      params.set("report_branch_id", String(query.reportBranchId));
    }
    if (query.coId !== undefined && query.coId !== null) {
      params.set("co_id", String(query.coId));
    }
    if (query.groupId !== undefined && query.groupId !== null) {
      params.set("group_id", String(query.groupId));
    }
    return `${createApi}/Org/MisReport/DemandVsCollection?${params.toString()}`;
  },

  // MIS Reports — CO Performance
  getCoPerformance: (query: {
    orgId: number;
    branchId: number;
    fromDate: string;
    toDate: string;
    view: string;
    reportBranchId?: number | null;
    coId?: number | null;
  }) => {
    const params = new URLSearchParams({
      org_id: String(query.orgId),
      branch_id: String(query.branchId),
      from_date: query.fromDate,
      to_date: query.toDate,
      view: query.view,
    });
    if (query.reportBranchId !== undefined && query.reportBranchId !== null) {
      params.set("report_branch_id", String(query.reportBranchId));
    }
    if (query.coId !== undefined && query.coId !== null) {
      params.set("co_id", String(query.coId));
    }
    return `${createApi}/Org/MisReport/CoPerformance?${params.toString()}`;
  },

  // Support Tickets
  getSupportTickets: (orgId: number, branchId: number) =>
    `${createApi}/Org/Support/GetSupportTickets?org_id=${orgId}&branch_id=${branchId}`,
  addSupportTicket: `${createApi}/Org/Support/AddSupportTicket`,
};
