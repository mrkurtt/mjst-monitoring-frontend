import { responseHandler } from "../components/shared/responseHandler";
import { api } from "./axios";
import Cookies from "js-cookie";

export const createManuscript = async (manuscript: Object) => {
  try {
    const { data } = await api.post("/manuscript", manuscript, {
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
      },
    });

    return data;
  } catch (error) {
    responseHandler(error);
  }
};

export const getManuscriptByStepStatus = async (stepStatus: string, year?: number) => {
  try {
    const params =
      stepStatus && year
        ? {
            status: stepStatus,
            year,
          }
        : {
            status: stepStatus,
          };

    const { data } = await api.get(`/manuscript/step`, {
      params: params,
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
      },
    });

    return data;
  } catch (error) {
    responseHandler(error);
  }
};

export const updateManuscript = async (id: string, updateData: Object) => {
  try {
    const { data } = await api.put(`/manuscript/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
      },
    });

    responseHandler(data);

    return data;
  } catch (error: any) {
    responseHandler(error);
  }
};

export const deleteManuscript = async (id: string) => {
  try {
    const { data } = await api.delete(`/manuscript/${id}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
      },
    });

    responseHandler(data);

    return data;
  } catch (error: any) {
    responseHandler(error);
  }
};
