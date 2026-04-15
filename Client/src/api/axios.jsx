import axios from "axios";

export default axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    //baseURL:"https://uncubically-unwormy-krystal.ngrok-free.dev",
    headers:{
        Authorization:`Bearer ${localStorage.getItem("token") || ""}`,
    },
});