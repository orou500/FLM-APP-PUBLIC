import axios from "axios";
import { apiUrl } from "../context/contentOption"

const BASE_URL = apiUrl.API_BASE_URL_DEV;

export default axios.create({
    baseURL: BASE_URL
});