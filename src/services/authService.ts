

import axios from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}


export interface LoginResponse {
  token: string;
  role: "superuser" | "plantManager" | "fg" | "qc" | "dispatch" | "finance"; // or string for POC
}



export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  // Backend will be integrated later
  const res = await axios.post<LoginResponse>(
    "YOUR_API_URL/login",
    payload
  );
  return res.data;
};
