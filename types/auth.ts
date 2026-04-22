export type AuthRole = "CLIENT" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  role: AuthRole;
  email?: string;
  address?: string;
  avatar?: string;
};

export type OtpSendPayload = {
  phone: string;
  role: AuthRole;
};

export type OtpVerifyPayload = {
  phone: string;
  role: AuthRole;
  otp: string;
};

export type ClientLoginPayload = {
  phone: string;
  pin: string;
};

export type SetPinPayload = {
  phone: string;
  pin: string;
};
