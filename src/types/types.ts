export interface ILoginInput {
  financialYear: string;
  branch_code: string;
  user_name: string;
  password: string;
}
export interface Ilogin {
  branch_code: string;
  user_name: string;
  password: string;
}

export interface IUser {
  token: string;
  User_Name: string;
  org_id: number;
  org_name: string;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  shg_inv: string;
  user_status: number;
  co_id?: number;
  branch_address?: string;
  branch_mobile?: string;
  branch_mail?: string;
  is_head?: string;
  branch_status?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IApiResponse<T = any> {
  message?: string;
  details?: string;
  data?: T;
  Data?: T;
  Success?: boolean;
}
