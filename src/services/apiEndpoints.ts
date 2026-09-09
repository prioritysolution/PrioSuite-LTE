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
  getLoanOtherInfo: (
    orgId: number,
    schemeId: number,
    loanDate: string,
    memId: number,
    applAmt: number,
  ) =>
    `${createApi}/Org/ProcessLoan/GetLoanOtherInfo?org_id=${orgId}&schem_id=${schemeId}&loan_date=${loanDate}&mem_id=${memId}&appl_amt=${applAmt}`,
  postApplication: `${createApi}/Org/ProcessLoan/PostApplication`,

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
  postCollection: `${createApi}/Org/ProcessLoan/PostCollection`,

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
  ) =>
    `${createApi}/Org/ProcessLoan/GetLoanIssueRegister?org_id=${orgId}&branch_id=${branchId}&from_date=${fromDate}&to_date=${toDate}`,

  // Loan Reports — Collection Register (trans_loanappl_collection by Coll_Date)
  // Branch-wide: group/member/cycle left as 0 so backend returns the full register.
  getCollectionRegister: (
    orgId: number,
    branchId: number,
    fromDate: string,
    toDate: string,
  ) =>
    `${createApi}/Org/ManageProfile/GetLoanCollectionReport?org_id=${orgId}&group_id=0&member_id=0&from_date=${fromDate}&to_date=${toDate}&branch_id=${branchId}&loan_cycle=0`,
};
