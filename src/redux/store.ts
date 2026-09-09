import { configureStore } from "@reduxjs/toolkit";
import detailedListReducer from "@/container/loan-reports/detailed-list/DetailedListReducer";
import purposeMasterReducer from "@/container/setup/purpose-master/PurposeMasterReducer";
import schemeMasterReducer from "@/container/setup/scheme-master/SchemeMasterReducer";
import holidayCalendarReducer from "@/container/setup/holiday-calendar/HolidayCalendarReducer";
import areaMasterReducer from "@/container/setup/area-master/AreaMasterReducer";
import moduleReducer from "@/container/module/ModuleReducer";
import coProfileReducer from "@/container/manage-profile/sahayika-co-profile/CoProfileReducer";
import memberProfileReducer from "@/container/manage-profile/member-profile/MemberProfileReducer";
import groupAdmissionReducer from "@/container/manage-profile/group-admission/GroupAdmissionReducer";
import newApplicationReducer from "@/container/loan-entry/new-application/NewApplicationReducer";
import dashboardReducer from "@/container/dashboard/DashboardReducer";
import loginReducer from "@/container/auth/login/LoginReducer";
import forgotPasswordReducer from "@/container/auth/forgot-password/ForgotPasswordReducer";
import personalLedgerReducer from "@/container/loan-reports/personal-ledger/PersonalLedgerReducer";
import loanIssueReducer from "@/container/loan-entry/loan-issue/LoanIssueReducer";
import loanCollectionReducer from "@/container/loan-entry/loan-collection/LoanCollectionReducer";
import voucherReducer from "@/container/voucher/VoucherReducer";
import cashAccountReducer from "@/container/financialReports/cashAccount/cashAccountReducer";
import groupRegisterReducer from "@/container/customer-reports/group-register/GroupRegisterReducer";
import memberRegisterReducer from "@/container/customer-reports/member-register/MemberRegisterReducer";
import issueRegisterReducer from "@/container/loan-reports/issue-register/IssueRegisterReducer";
import collectionRegisterReducer from "@/container/loan-reports/collection-register/CollectionRegisterReducer";

export const store = configureStore({
  reducer: {
    detailedList: detailedListReducer,
    purposeMaster: purposeMasterReducer,
    schemeMaster: schemeMasterReducer,
    holidayCalendar: holidayCalendarReducer,
    areaMaster: areaMasterReducer,
    module: moduleReducer,
    coProfile: coProfileReducer,
    memberProfile: memberProfileReducer,
    groupAdmission: groupAdmissionReducer,
    newApplication: newApplicationReducer,
    loanIssue: loanIssueReducer,
    loanCollection: loanCollectionReducer,
    dashboard: dashboardReducer,
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
    personalLedger: personalLedgerReducer,
    voucher: voucherReducer,
    cashAccount: cashAccountReducer,
    groupRegister: groupRegisterReducer,
    memberRegister: memberRegisterReducer,
    issueRegister: issueRegisterReducer,
    collectionRegister: collectionRegisterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
