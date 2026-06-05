export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  isAvailable: boolean;
};

export type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  cuisineType: string | null;
  rating: number;
  isActive: boolean;
  menuItems: MenuItem[];
};
