export type ProductCategory = "digital" | "physical" | "educational";
export type ProductStatus = "active" | "draft";
export type OrderStatus = "PAID" | "PENDING" | "CANCELLED";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  fileUrl: string;
  stock: number | null;
  tags: string[];
  status: ProductStatus;
  createdBy: "admin";
  createdAt: any;
  updatedAt: any;
}

export interface ProductOrder {
  id: string;
  productId: string;
  productTitle?: string; // Denormalized for display
  productCategory?: string; // Denormalized for display
  buyerId: string;
  buyerRole: "student" | "teacher";
  amount: number;
  status: OrderStatus;
  fileUrl?: string; // For digital downloads
  deliveryInfo: {
    name: string;
    address: string;
    phone: string;
  };
  createdAt: any;
}
