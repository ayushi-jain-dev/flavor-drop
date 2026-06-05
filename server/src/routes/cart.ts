import { Router } from 'express';
import { z } from 'zod';
import { all, createId, get, nowIso, run } from '../db/sqlite.js';
import { requireAuth } from '../middleware/auth.js';

type CartItemRow = {
  id: string;
  user_id: string;
  menu_item_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  menu_item_name: string;
  menu_item_description: string | null;
  menu_item_price: number;
  menu_item_image_url: string | null;
  menu_item_category: string | null;
  menu_item_is_available: number;
  restaurant_id: string;
  restaurant_name: string;
};

type MenuItemRow = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: number;
};

const quantitySchema = z.object({
  quantity: z.number().int().min(0),
});

const addItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).optional().default(1),
});

const toCartItem = (item: CartItemRow) => ({
  id: item.id,
  menuItemId: item.menu_item_id,
  restaurantId: item.restaurant_id,
  restaurantName: item.restaurant_name,
  name: item.menu_item_name,
  description: item.menu_item_description,
  price: Number(item.menu_item_price),
  imageUrl: item.menu_item_image_url,
  category: item.menu_item_category,
  isAvailable: item.menu_item_is_available === 1,
  quantity: Number(item.quantity),
  lineTotal: Number(item.menu_item_price) * Number(item.quantity),
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

const loadCart = async (userId: string) => {
  const items = await all<CartItemRow>(
    `
      SELECT
        cart_items.id,
        cart_items.user_id,
        cart_items.menu_item_id,
        cart_items.quantity,
        cart_items.created_at,
        cart_items.updated_at,
        menu_items.name AS menu_item_name,
        menu_items.description AS menu_item_description,
        menu_items.price AS menu_item_price,
        menu_items.image_url AS menu_item_image_url,
        menu_items.category AS menu_item_category,
        menu_items.is_available AS menu_item_is_available,
        restaurants.id AS restaurant_id,
        restaurants.name AS restaurant_name
      FROM cart_items
      JOIN menu_items ON menu_items.id = cart_items.menu_item_id
      JOIN restaurants ON restaurants.id = menu_items.restaurant_id
      WHERE cart_items.user_id = ?
      ORDER BY cart_items.created_at ASC
    `,
    [userId],
  );

  const payloadItems = items.map(toCartItem);
  const subtotal = payloadItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = payloadItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: payloadItems,
    subtotal,
    itemCount,
  };
};

export const cartRouter = Router();

cartRouter.get('/', requireAuth, async (req, res) => {
  const cart = await loadCart(req.auth?.userId ?? '');
  return res.json({ cart });
});

cartRouter.post('/items', requireAuth, async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid cart item payload',
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { menuItemId, quantity } = parsed.data;
  const menuItem = await get<MenuItemRow>('SELECT * FROM menu_items WHERE id = ?', [menuItemId]);

  if (!menuItem || menuItem.is_available !== 1) {
    return res.status(404).json({ message: 'Menu item not available' });
  }

  const currentCart = await loadCart(req.auth?.userId ?? '');
  const restaurantIds = new Set(currentCart.items.map((item) => item.restaurantId));

  if (currentCart.items.length > 0 && !restaurantIds.has(menuItem.restaurant_id)) {
    return res.status(409).json({
      message: 'Your cart can only contain items from one restaurant at a time',
    });
  }

  const existing = await get<{ id: string; quantity: number }>(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND menu_item_id = ?',
    [req.auth?.userId ?? '', menuItemId],
  );

  const timestamp = nowIso();

  if (existing) {
    await run(
      'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?',
      [existing.quantity + quantity, timestamp, existing.id],
    );
  } else {
    await run(
      'INSERT INTO cart_items (id, user_id, menu_item_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [createId(), req.auth?.userId ?? '', menuItemId, quantity, timestamp, timestamp],
    );
  }

  const cart = await loadCart(req.auth?.userId ?? '');
  return res.status(201).json({ cart });
});

cartRouter.patch('/items/:menuItemId', requireAuth, async (req, res) => {
  const parsed = quantitySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid cart quantity',
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { quantity } = parsed.data;
  const menuItemId = typeof req.params.menuItemId === 'string' ? req.params.menuItemId : '';
  if (!menuItemId) {
    return res.status(400).json({ message: 'Missing menu item id' });
  }
  const existing = await get<{ id: string }>(
    'SELECT id FROM cart_items WHERE user_id = ? AND menu_item_id = ?',
    [req.auth?.userId ?? '', menuItemId],
  );

  if (!existing) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  if (quantity === 0) {
    await run('DELETE FROM cart_items WHERE id = ?', [existing.id]);
  } else {
    await run('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?', [
      quantity,
      nowIso(),
      existing.id,
    ]);
  }

  const cart = await loadCart(req.auth?.userId ?? '');
  return res.json({ cart });
});

cartRouter.delete('/items/:menuItemId', requireAuth, async (req, res) => {
  const menuItemId = typeof req.params.menuItemId === 'string' ? req.params.menuItemId : '';
  if (!menuItemId) {
    return res.status(400).json({ message: 'Missing menu item id' });
  }

  await run('DELETE FROM cart_items WHERE user_id = ? AND menu_item_id = ?', [
    req.auth?.userId ?? '',
    menuItemId,
  ]);

  const cart = await loadCart(req.auth?.userId ?? '');
  return res.json({ cart });
});

cartRouter.delete('/clear', requireAuth, async (req, res) => {
  await run('DELETE FROM cart_items WHERE user_id = ?', [req.auth?.userId ?? '']);
  return res.json({ cart: { items: [], subtotal: 0, itemCount: 0 } });
});
