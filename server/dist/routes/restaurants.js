import { Router } from 'express';
import { all, boolFromRow, get } from '../db/sqlite.js';
const toMenuItem = (item) => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.image_url,
    category: item.category,
    isAvailable: boolFromRow(item.is_available),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
});
const toRestaurant = (restaurant, menuItems) => ({
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    imageUrl: restaurant.image_url,
    cuisineType: restaurant.cuisine_type,
    rating: Number(restaurant.rating),
    isActive: boolFromRow(restaurant.is_active),
    menuItems: menuItems.map(toMenuItem),
    createdAt: restaurant.created_at,
    updatedAt: restaurant.updated_at,
});
export const restaurantsRouter = Router();
restaurantsRouter.get('/', async (_req, res) => {
    const restaurants = await all('SELECT * FROM restaurants ORDER BY rating DESC, created_at DESC');
    const payload = [];
    for (const restaurant of restaurants) {
        const menuItems = await all('SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY created_at ASC', [restaurant.id]);
        payload.push(toRestaurant(restaurant, menuItems));
    }
    return res.json({ restaurants: payload });
});
restaurantsRouter.get('/:id', async (req, res) => {
    const restaurant = await get('SELECT * FROM restaurants WHERE id = ?', [
        req.params.id,
    ]);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
    }
    const menuItems = await all('SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY category ASC, created_at ASC', [restaurant.id]);
    return res.json({
        restaurant: toRestaurant(restaurant, menuItems),
    });
});
//# sourceMappingURL=restaurants.js.map