export type CartItem = {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  isAvailable: boolean;
  quantity: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};
