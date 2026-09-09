import api from "@/lib/axios";

export const loginAPI = async (payload: FormData) => {
  const response = await api.post("/Org/User/PushLogin", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
