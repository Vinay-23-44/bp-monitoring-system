import axios from "./axios";
import auth from "../lib/auth";

async function getConsultations() {
  const { data } = await axios({
    method: "get",
    url: "/api/consultations",
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
  });

  return data.data || [];
}

async function createConsultation(payload) {
  const { data } = await axios({
    method: "post",
    url: "/api/consultations",
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
    data: payload,
  });

  return data.data;
}

export const consultationApi = {
  getConsultations,
  createConsultation,
};