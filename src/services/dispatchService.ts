import axios from "axios";
import type { Dispatch } from "../data/mockDispatches";
import { mockDispatches } from "../data/mockDispatches";

const API_BASE_URL = "http://localhost:5000/api/dispatch";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ✅ create a local copy for safe mock updates
let localDispatches = [...mockDispatches];

/* ------------------ GET ------------------ */
export const getDispatches = async (): Promise<Dispatch[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...localDispatches]), 500)
    );
  }
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

/* ------------------ CREATE ------------------ */
export const addDispatch = async (data: Omit<Dispatch, "id">) => {
  if (USE_MOCK) {
    return new Promise<Dispatch>((resolve) => {
      setTimeout(() => {
        const newDispatch: Dispatch = { ...data, id: Date.now() };
        localDispatches.push(newDispatch);
        resolve(newDispatch);
      }, 300);
    });
  }
  const response = await axios.post(API_BASE_URL, data);
  return response.data;
};

/* ------------------ UPDATE ------------------ */
export const updateDispatch = async (id: number, data: Dispatch) => {
  if (USE_MOCK) {
    return new Promise<Dispatch>((resolve) => {
      setTimeout(() => {
        const index = localDispatches.findIndex((d) => d.id === id);
        if (index !== -1) {
          localDispatches[index] = { ...localDispatches[index], ...data };
          resolve(localDispatches[index]);
        } else {
          resolve(data);
        }
      }, 300);
    });
  }
  const response = await axios.put(`${API_BASE_URL}/${id}`, data);
  return response.data;
};
