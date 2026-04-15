import axios from "./axios";

async function getRecommendation(data) {
  const { data: response } = await axios({
    method: "post",
    url: "/api/user/recommendation",
    data,
  });

  return response;
}

export const mlApi = {
  getRecommendation,
};