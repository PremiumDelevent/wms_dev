import type { Linea } from "./Linea";

export interface LineaItemProps {
  linea: Linea;
  index: number;
  cantidad: number;
  setCantidad: (idx: number, n: number) => void;
}