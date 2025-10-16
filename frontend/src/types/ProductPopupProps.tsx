import type { Product } from "./Product";

export interface ProductPopupProps {
  product: Product | null;
  title: string;
  typeAction: "ship" | "return";
  onClose: () => void;
}