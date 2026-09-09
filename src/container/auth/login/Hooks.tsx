"use client"

import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ILoginInput } from "@/types/types";
import { masterService } from "@/services/master.service";
import { loginAPI } from "./LoginApi";
import { useGlobalContext } from "@/context/GlobalContext";
import Cookies from "@/lib/secureCookieHelper";
import { toast } from "sonner";
import { CookieKeys } from "@/constants/auth";
import { togglePassword as togglePasswordAction } from "./LoginReducer";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";

export interface IFyear {
    Id: string;
    Yr: string;
    Start_Date: string;
    End_Date: string;
}

const loginSchema = yup.object().shape({
    branch_code: yup.string().required("Branch code is required"),
    user_name: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
    financialYear: yup.string().required("Financial year is required"),
});

export const useLoginHook = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.login);
    const { login } = useGlobalContext();

    // Fetch Financial Year
    const { data: financialYear } = useQuery({
        queryKey: ["financialYear"],
        queryFn: () => masterService.getFinancialYear()
    });

    const mutation = useMutation({
        mutationFn: async (loginData: FormData) => {
            return await loginAPI(loginData);
        },
        onSuccess: (data) => {
            if (data?.message === "Error Found") {
                toast.error(data.details || "Login failed. Please check your credentials.");
                return;
            }
            const rawStatus = data?.user_status ?? data?.Status ?? data?.status;
            const userStatus = Number(rawStatus);
            if (Number.isNaN(userStatus) || userStatus !== 1) {
                // Inactive / unknown status — mutate callback shows the error toast
                return;
            }
            if (data) {
                toast.success("Login successful");
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Something went wrong. Please try again later.");
        }
    });

    const methods = useForm<ILoginInput>({
        resolver: yupResolver(loginSchema) as any,
    });
    const { register, handleSubmit, control, formState: { errors } } = methods;

    const onSubmit: SubmitHandler<ILoginInput> = (data) => {
        const selectedFY = financialYear?.details?.find((f: IFyear) => String(f.Id) === String(data.financialYear));
        const fyLabel = selectedFY ? selectedFY.Yr : "";
        const fyStartDate = selectedFY ? selectedFY.Start_Date : "";
        const fyEndDate = selectedFY ? selectedFY.End_Date : "";

        Cookies.set(CookieKeys.FINANCIAL_YEAR, data.financialYear);
        const formData = new FormData();
        formData.append("branch_code", data.branch_code);
        formData.append("user_name", data.user_name);
        formData.append("password", data.password);

        mutation.mutate(formData, {
            onSuccess: async (responseData) => {
                if (responseData && responseData.message !== "Error Found") {
                    // mst_org_user.Status — only Status === 1 can sign in
                    const rawStatus =
                        responseData.user_status ??
                        responseData.Status ??
                        responseData.status;
                    const userStatus = Number(rawStatus);
                    if (Number.isNaN(userStatus) || userStatus !== 1) {
                        Cookies.remove("priobank-lite-token", { path: "/" });
                        toast.error(
                            "Your account is inactive. Please contact the administrator.",
                        );
                        return;
                    }

                    const normalizedUser = {
                        ...responseData,
                        user_status: 1,
                    };

                    // Set the token immediately in the cookie so the Axios interceptor adds it to getActiveYear's authorization header
                    if (normalizedUser.token) {
                        Cookies.set("priobank-lite-token", normalizedUser.token, {
                            expires: 7,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "Strict",
                            path: "/",
                        });
                    }
                    try {
                        const activeYearData = await masterService.getActiveYear(Number(normalizedUser.org_id));
                        if (
                            activeYearData &&
                            activeYearData.message === "Data Found" &&
                            Array.isArray(activeYearData.details) &&
                            activeYearData.details.length > 0
                        ) {
                            const finId = activeYearData.details[0].Fin_Id;
                            Cookies.set("priobank-lite-financial_Id", String(finId), {
                                expires: 7,
                                secure: process.env.NODE_ENV === "production",
                                sameSite: "Strict",
                                path: "/",
                            });
                        }
                    } catch (err) {
                        console.error("Failed to fetch active year:", err);
                    }
                    login(normalizedUser, fyLabel, fyStartDate, fyEndDate);
                }
            }
        });
    };

    const togglePassword = () => {
        dispatch(togglePasswordAction());
    };

    return {
        methods,
        showPassword: state.showPassword,
        togglePassword,
        financialYear,
        isPending: mutation.isPending,
        register,
        handleSubmit,
        control,
        errors,
        onSubmit
    };
};
