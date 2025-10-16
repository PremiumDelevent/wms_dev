import type { Pallet } from "./Pallet";
import type { Linea } from "./Linea";

export interface PreparadoPopupProps {
  pallet: Pallet;
  onClose: () => void;
  onConfirm: (lineasVerificadas: Linea[], cantidades: number[]) => void;
}