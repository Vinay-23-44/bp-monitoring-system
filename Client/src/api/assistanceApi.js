import axios from "./axios";

async function getAssistantResponse(message = "", chatHistory = [], conversationId = "") {
  const { data: response } = await axios({
    method: "post",
    url: "/api/user/assistant",
    data: {
      message,
      chatHistory,
      conversationId,
    },
  });

  return response;
}

export const assistanceApi = {
  getAssistantResponse,
};
