import { responseHandler } from "../components/shared/responseHandler";
import { api } from "./axios";
import Cookies from "js-cookie";

export const getAnalytics = async (params: { year: number; month?: number }) => {
  try {
    const filters =
      params.year && params.month
        ? {
            year: params.year,
            month: params.month,
          }
        : { year: params.year };
    const { data } = await api.get("/analytics", {
      params: filters,
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
      },
    });

    return data;
  } catch (error) {
    responseHandler(error);
  }
};
