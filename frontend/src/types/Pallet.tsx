import type { Linea } from "./Linea";

export interface Pallet {
  id: number;
  sellto_customer_name: string;
  furniture_load_date_jmt: string | null;
  jmt_status: string;
  jmteventname: string;
  lineas: Linea[];
}