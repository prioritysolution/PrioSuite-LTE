export const pickCoValue = (source: any, keys: string[]) => {
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

export const getCoGuardianName = (source: any) =>
  pickCoValue(source, [
    "Guardian_Name",
    "Gurd_Name",
    "Gurdain_Name",
    "Gurdian_Name",
    "CO_Gurd",
    "CO_Guardian",
    "Father_Name",
    "FatHusb_Name",
    "co_gurd",
    "gurd_name",
    "guardian_name",
  ]);

export const getCoAddress = (source: any) =>
  pickCoValue(source, [
    "Address",
    "CO_Add",
    "CO_Address",
    "CO_Addr",
    "Addr",
    "co_add",
    "co_address",
    "address",
  ]);

export const getCoPass = (source: any) =>
  pickCoValue(source, [
    "Coll_Pwd",
    "coll_pwd",
    "COLL_PWD",
    "CO_Pass",
    "co_pass",
    "Security_Pin",
    "Pin",
    "CO_Pin",
  ]);

export const extractCoRecord = (
  res: any,
  match?: { co_id?: number; co_code?: string },
) => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];

  let list: any[] = [];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      list = candidate;
      break;
    }
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      (candidate.CO_Id ||
        candidate.Co_Id ||
        candidate.CO_Name ||
        candidate.Co_Name ||
        candidate.CO_Code ||
        candidate.co_name ||
        candidate.gurd_name ||
        candidate.contact_no)
    ) {
      list = [candidate];
      break;
    }
  }

  if (!list.length) return null;

  if (match?.co_id || match?.co_code) {
    const found = list.find((item) => {
      const id = String(item?.CO_Id ?? item?.Co_Id ?? item?.co_id ?? "");
      const code = String(item?.CO_Code ?? item?.Co_Code ?? item?.co_code ?? "");
      return (
        (match.co_id && id && id === String(match.co_id)) ||
        (match.co_code && code && code === String(match.co_code))
      );
    });
    if (found) return found;
    if (list.length > 1) return null;
  }

  return list[0];
};

export const getCoContactNo = (source: any) => {
  const knownValue = pickCoValue(source, [
    "Contact_No",
    "ContactNo",
    "contact_no",
    "CO_Contact",
    "Co_Contact",
    "CO_Cont",
    "Cont_No",
    "CO_Phone",
    "Co_Phone",
    "CO_Ph",
    "Co_Ph",
    "CO_Phn",
    "Co_Phn",
    "CO_PhNo",
    "CO_Phn_No",
    "Phn_No",
    "Tel_No",
    "CO_Tel",
    "CO_Mob",
    "Co_Mob",
    "CO_Mobile",
    "Co_Mobile",
    "Mobile_No",
    "MobileNo",
    "Mob_No",
    "Phone_No",
    "PhoneNo",
    "Phone",
    "Mobile",
    "co_ph",
    "co_mob",
    "co_contact",
  ]);

  if (knownValue) return knownValue;

  if (!source || typeof source !== "object") return "";

  for (const [key, value] of Object.entries(source)) {
    if (
      /ph|mob|contact|cont/i.test(key) &&
      !/id|code|name|gurd|add|pass|pin|org|branch/i.test(key) &&
      isFilled(value)
    ) {
      return String(value).trim();
    }
  }

  return "";
};

const isFilled = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "" &&
  String(value).trim() !== "0";
