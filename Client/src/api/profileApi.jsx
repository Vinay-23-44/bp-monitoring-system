import axios from "./axios";
import auth from "../lib/auth";

async function getProfile() {
  const { data } = await axios({
    method: "get",
    url: "/api/profile",
    headers: {
      Authorization: `Bearer ${auth.token || ""} `,
    },
  });
  return data;
}

async function updateProfile(details) {
  const { data } = await axios({
    method: "post",
    url: "/api/profile",
    headers: {
      Authorization: `Bearer ${auth.token || ""} `,
    },
    data: {
      details,
    },
  });
  return data;
}

export const profileApi = {
  getProfile,
  updateProfile,
};