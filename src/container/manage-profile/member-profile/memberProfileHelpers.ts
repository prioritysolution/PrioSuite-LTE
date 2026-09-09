import { IMemberFormInput } from "@/app/(dashboard)/manage-profile/member-profile/types";

const isFilled = (value: any) =>
  value !== undefined && value !== null && String(value).trim() !== "";

export const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

export const pickMemberValue = (source: any, keys: string[]) => {
  if (!source || typeof source !== "object") return "";

  for (const key of keys) {
    const direct = source[key];
    if (isFilled(direct)) return String(direct).trim();

    const matchedKey = Object.keys(source).find(
      (item) => item.toLowerCase() === key.toLowerCase(),
    );
    if (matchedKey && isFilled(source[matchedKey])) {
      return String(source[matchedKey]).trim();
    }
  }

  return "";
};

export const pickMemberNumber = (source: any, keys: string[]): number | "" => {
  const value = pickMemberValue(source, keys);
  if (value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : n;
};

export const extractMemberRecord = (res: any) => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];

  const looksLikeMember = (item: any) =>
    item &&
    typeof item === "object" &&
    (item.Member_Id ||
      item.Mem_Id ||
      item.member_id ||
      item.Member_No ||
      item.Mem_No ||
      item.member_no ||
      item.Member_Name ||
      item.Mem_Name ||
      item.member_name);

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      return candidate.find(looksLikeMember) || candidate[0];
    }
    if (looksLikeMember(candidate)) {
      return candidate;
    }
  }

  return null;
};

export const mapMemberToForm = (memberData: any): IMemberFormInput => ({
  mem_id:
    pickMemberNumber(memberData, ["Member_Id", "Mem_Id", "mem_id", "Id"]) ||
    undefined,
  member_no: pickMemberValue(memberData, [
    "Member_No",
    "Mem_No",
    "member_no",
    "mem_no",
  ]),
  member_name: pickMemberValue(memberData, [
    "Member_Name",
    "Mem_Name",
    "member_name",
    "mem_name",
  ]),
  mem_fname: pickMemberValue(memberData, [
    "FatHusb_Name",
    "Father_Name",
    "Gurd_Name",
    "Guardian_Name",
    "Gurdain_Name",
    "mem_fname",
  ]),
  mem_add: pickMemberValue(memberData, [
    "Mem_Address",
    "Address",
    "Mem_Add",
    "mem_add",
  ]),
  mem_age: pickMemberNumber(memberData, ["Age", "Mem_Age", "mem_age"]) || 0,
  mem_gender: pickMemberNumber(memberData, [
    "Gender",
    "Mem_Gender",
    "Gender_Id",
    "mem_gender",
  ]),
  mem_caste: pickMemberNumber(memberData, ["Caste", "Mem_Caste", "mem_caste"]),
  mem_relig: pickMemberNumber(memberData, [
    "Religion",
    "Mem_Relig",
    "mem_relig",
  ]),
  mar_sts: pickMemberNumber(memberData, [
    "Marital_Status",
    "Mar_Sts",
    "mar_sts",
  ]),
  mem_spose: pickMemberValue(memberData, [
    "Spouse_Name",
    "Mem_Spose",
    "mem_spose",
  ]),
  mem_sage:
    pickMemberNumber(memberData, ["Gurd_Age", "Spouse_Age", "mem_sage"]) ||
    undefined,
  mem_quf: pickMemberValue(memberData, [
    "Qualification",
    "Mem_Quf",
    "mem_quf",
  ]),
  branch_id: pickMemberNumber(memberData, [
    "Branch_Id",
    "branch_id",
    "BranchId",
  ]),
  area_vill: pickMemberNumber(memberData, [
    "Vill_Area",
    "Area_Vill",
    "Area_Id",
    "area_vill",
  ]),
  mem_com: pickMemberNumber(memberData, [
    "Community_Cd",
    "Mem_Com",
    "mem_com",
  ]),
  grp_id: pickMemberNumber(memberData, ["Group_Id", "Grp_Id", "grp_id"]),
  mem_mob: pickMemberValue(memberData, [
    "Contact_No",
    "Mobile_No",
    "Mem_Mob",
    "Phone",
    "mem_mob",
  ]),
  mem_conct: pickMemberValue(memberData, [
    "Contact_No_Alt",
    "Alt_Contact",
    "Mem_Conct",
    "mem_conct",
  ]),
  mem_aadhar: pickMemberValue(memberData, [
    "Aadhar_No",
    "Mem_Aadhar",
    "mem_aadhar",
  ]),
  mem_epic: pickMemberValue(memberData, ["EPIC_No", "Voter_Id", "mem_epic"]),
  mem_pan: pickMemberValue(memberData, ["PAN_No", "Mem_Pan", "mem_pan"]),
  sp_aadhar: pickMemberValue(memberData, [
    "Aadhar_No_Spouse",
    "Spouse_Aadhar",
    "sp_aadhar",
  ]),
  sp_epic: pickMemberValue(memberData, [
    "EPIC_No_Spouse",
    "Spouse_EPIC",
    "sp_epic",
  ]),
  boy_count: pickMemberNumber(memberData, ["School_Boy", "Boy_Count", "boy_count"]) || 0,
  girl_count:
    pickMemberNumber(memberData, ["School_Girl", "Girl_Count", "girl_count"]) ||
    0,
  mem_ocop: pickMemberValue(memberData, [
    "Occupation",
    "Mem_Ocop",
    "mem_ocop",
  ]),
  mem_minc:
    pickMemberNumber(memberData, [
      "Monthly_Income",
      "Mem_Minc",
      "mem_minc",
    ]) || undefined,
  co_id: pickMemberNumber(memberData, ["Co_Id", "CO_Id", "co_id"]),
  adm_date: "",
  mem_status: pickMemberNumber(memberData, [
    "Status",
    "Mem_Sts",
    "Mem_Status_Id",
    "mem_status",
  ]),
  txn_mode: "Cash",
  with_date: pickMemberValue(memberData, [
    "Withdrwan_Date",
    "Withdrawn_Date",
    "with_date",
  ]),
  remarks: pickMemberValue(memberData, ["Remarks", "remarks"]),
});
