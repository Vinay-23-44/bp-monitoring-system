import axios from "axios";

export default axios.create({
    baseURL:"http://localhost:4444",
    //baseURL:"https://uncubically-unwormy-krystal.ngrok-free.dev",
    headers:{
        Authorization:`Bearer ${localStorage.getItem("token") || ""}`,
    },
});