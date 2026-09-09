export interface IGroupFormInput {
    grp_id?: number;
    grp_no: string;
    grp_name: string;
    grp_add: string;
    branch_id: number | "";
    area_vill: number | "";
    mem_no: number | "";
    grp_type: number | "";
    co_id: number | "";
    adm_date: string;
    adm_amt: number | "";
    
    txn_mode?: "Cash" | "Bank";
    bank_id?: number | "";
    bank_ref?: string;

    grp_sts?: number | "";
    with_date?: string;
    remarks?: string;
}

export interface IGroupData {
    Group_Id: number;
    Group_No: string;
    Group_Name: string;
    Grp_Address: string;
    Vill_Area: number;
    Mem_No: number;
    Group_Type: number;
    CO_Id: number;
    Adm_Date: string;
    Admission_Fee: number;
    Status: number;
    Withdrwan_Date?: string;
    Remarks?: string;
    Area_Name?: string;
}