
import axios from "./axios";
import auth from "../lib/auth";

async function updateBP({  systolic, diastolic }) {
  const { data } = await axios({
    method: "post",
    url: "/api/bp/add",
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
    data: {
      
      systolic,
      diastolic,
    },
  });

  return data;
}
async function getBPHistory() {
  const { data } = await axios({
    method: "get",
    url: "/api/bp/history",
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
  });

  return data.data || [];
}

export const bpApi = {
  updateBP,
  getBPHistory,
};
