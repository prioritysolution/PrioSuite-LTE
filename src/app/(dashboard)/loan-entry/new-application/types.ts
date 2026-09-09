export interface IGroupLoanForm {
    loan_date: string | Date;
    branch_id: number | string | "";
    group_id: number | null;
    group_no: string;
    group_name: string;
    group_address: string;
    group_area: string;
    scheme_id: number;
    roi: number;
    repay_mode: number;
    repay_name: string;
    sanction_limit: number;
    appl_amt: number;
    members: IMemberLoanEntry[];
    co_id: string;
}

export interface IMemberLoanEntry {
    mem_id: number;
    member_no: string;
    member_name: string;
    gurdain_name: string;
    area: string;
    loan_amount: number;
    purpose: number | "";
    guranter_name: string;
    ln_cycle?: number;
    inst_no?: number;
    inst_amt?: number;
    resil_amt?: number;
    final_date?: string;
}

export interface IScheme {
    Scheme_Id: number;
    Scheme_Name: string;
    RoI: string;
    Repay_Mode: number;
    Repay_Name: string;
    Sanction_Limit: string;
}