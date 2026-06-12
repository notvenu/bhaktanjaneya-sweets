import { apiGet } from "./client";

export interface PincodeOffice {
  name: string;
  district: string;
  city: string;
  state: string;
}

export interface PincodeLookup {
  pincode: string;
  city: string;
  state: string;
  district: string;
  postOffices: PincodeOffice[];
}

export async function lookupPincode(pincode: string): Promise<PincodeLookup> {
  return apiGet<PincodeLookup>(`/pincode/${pincode}`);
}
