import config from "@/config";
import axios from "axios";

const axiosClient = axios.create({
    baseURL: config.apiURL,
    withCredentials: true
})

export default axiosClient