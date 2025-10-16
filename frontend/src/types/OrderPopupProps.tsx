import type { Order } from "./Order";
import type { Linea } from "./Linea";

export interface OrderPopupProps {
  order: Order | null;
  onClose: () => void;
  addToPallet: (lineas: Linea[], cantidades: number[], orderNum: string) => void;
}