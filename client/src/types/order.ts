import type { MenuItem, Restaurant } from './catalog';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  menuItem?: MenuItem | null;
};

export type Order = {
  id: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  createdAt: string;
  restaurant: Pick<Restaurant, 'id' | 'name' | 'imageUrl'>;
  items: OrderItem[];
};
