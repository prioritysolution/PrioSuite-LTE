import Cookies from "./secureCookieHelper";


type CookiesKey =
  | "priobank-lite-org_id"
  | "priobank-lite-branch_id"
  | "priobank-lite-user_id"
  | "priobank-lite-financial_Id"
  | "priobank-lite-user_name"
  | "priobank-lite-token"
  | "priobank-lite-User_Name"
  | "priobank-lite-org_name"
  | "priobank-lite-branch_name"
  | "priobank-lite-branch_code"
  | "priobank-lite-shg_inv"
  | "priobank-lite-user_status"
  | "priobank-lite-fin_end_date"
  | "priobank-lite-fin_start_date"
  | "priobank-lite-userBranchName"
  | "priobank-lite-branch_address"
  | "priobank-lite-branch_mobile"
  | "priobank-lite-branch_mail"
  | "priobank-lite-is_head"
  | "priobank-lite-branch_status"
  | "priobank-lite-financialYearLabel";

const getCookieData = <T = any>(key: CookiesKey): T | null => {
  const cookieValue = Cookies.get(key);

  if (!cookieValue) return null;

  try {
    return JSON.parse(cookieValue) as T;
  } catch {
    return cookieValue as unknown as T;
  }
};

export default getCookieData;
