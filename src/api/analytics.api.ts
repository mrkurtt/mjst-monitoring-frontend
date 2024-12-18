import { responseHandler } from "../components/shared/responseHandler";
import { api } from "./axios";
import Cookies from "js-cookie";

export const getAnalytics = async () => {
  try {
    const { data } = await api.get("/analytics", {
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
      },
    });

    return data;
  } catch (error) {
    responseHandler(error);
  }
};
