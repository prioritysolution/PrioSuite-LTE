export interface ICoProfile {
    CO_Id: number;
    CO_Code: string;
    CO_Name: string;
    Guardian_Name?: string;
    Gurd_Name?: string;
    Gurdain_Name?: string;
    CO_Gurd?: string;
    Address?: string;
    CO_Add?: string;
    CO_Address?: string;
    Contact_No?: string;
    CO_Phone?: string;
    CO_Mob?: string;
    Phone?: string;
    [key: string]: any;
}

export interface ICoFormInput {
    co_id?: number;
    co_code?: string;
    co_name: string;
    gurd_name: string;
    co_add?: string;
    contact_no: string;
    co_pass?: string;
}