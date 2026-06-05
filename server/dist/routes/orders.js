import { Router } from 'express';
import { z } from 'zod';
import { all, createId, get, nowIso, transaction } from '../db/sqlite.js';
import { requireAuth } from '../middleware/auth.js';
const createOrderSchema = z.object({
    addressId: z.string().optional(),
    notes: z.string().trim().max(500).optional(),
    deliveryFee: z.number().nonnegative().optional().default(0),
    tax: z.number().nonnegative().optional().default(0),
    items: z
        .array(z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1),
    }))
        .min(1),
});
const toOrderItem = (item) => ({
    id: item.id,
    menuItemId: item.menu_item_id,
    name: item.name,
    unitPrice: Number(item.unit_price),
    quantity: Number(item.quantity),
    createdAt: item.created_at,
});
const toOrder = (order, items) => ({
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    tax: Number(order.tax),
    total: Number(order.total),
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    restaurant: {
        id: order.restaurant_id,
        name: order.restaurant_name,
        imageUrl: order.restaurant_image_url,
    },
    items: items.map(toOrderItem),
});
export const ordersRouter = Router();
ordersRouter.get('/', requireAuth, async (req, res) => {
    const orders = await all(`
      SELECT
        orders.*,
        restaurants.name AS restaurant_name,
        restaurants.image_url AS restaurant_image_url
      FROM orders
      JOIN restaurants ON restaurants.id = orders.restaurant_id
      WHERE orders.user_id = ?
      ORDER BY orders.created_at DESC
    `, [req.auth?.userId ?? '']);
    const payload = [];
    for (const order of orders) {
        const items = await all('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC', [
            order.id,
        ]);
        payload.push(toOrder(order, items));
    }
    return res.json({ orders: payload });
});
ordersRouter.post('/', requireAuth, async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid order payload',
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const { addressId, notes, deliveryFee, tax, items } = parsed.data;
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await all(`SELECT * FROM menu_items WHERE id IN (${menuItemIds.map(() => '?').join(',')}) AND is_available = 1`, menuItemIds);
    if (menuItems.length !== menuItemIds.length) {
        return res.status(400).json({ message: 'One or more menu items are unavailable' });
    }
    const restaurantIds = new Set(menuItems.map((item) => item.restaurant_id));
    if (restaurantIds.size !== 1) {
        return res.status(400).json({ message: 'An order can only contain items from one restaurant' });
    }
    const restaurantId = menuItems[0]?.restaurant_id;
    if (!restaurantId) {
        return res.status(400).json({ message: 'Unable to determine restaurant for order' });
    }
    const quantityMap = new Map(items.map((item) => [item.menuItemId, item.quantity]));
    const subtotal = menuItems.reduce((sum, item) => sum + Number(item.price) * (quantityMap.get(item.id) ?? 0), 0);
    const total = subtotal + deliveryFee + tax;
    if (addressId) {
        const address = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
            addressId,
            req.auth?.userId ?? '',
        ]);
        if (!address) {
            return res.status(404).json({ message: 'Delivery address not found' });
        }
    }
    const orderId = createId();
    const timestamp = nowIso();
    const createdOrder = await transaction(async (db) => {
        const insertOrderSql = `INSERT INTO orders (
      id, user_id, restaurant_id, address_id, status, subtotal, delivery_fee, tax, total, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertOrderItemSql = `INSERT INTO order_items (
      id, order_id, menu_item_id, name, unit_price, quantity, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertOrder = db.prepare(insertOrderSql);
        insertOrder.run([
            orderId,
            req.auth?.userId ?? '',
            restaurantId,
            addressId ?? null,
            'PENDING',
            subtotal,
            deliveryFee,
            tax,
            total,
            notes ?? null,
            timestamp,
            timestamp,
        ]);
        insertOrder.free();
        for (const menuItem of menuItems) {
            const insertOrderItem = db.prepare(insertOrderItemSql);
            insertOrderItem.run([
                createId(),
                orderId,
                menuItem.id,
                menuItem.name,
                Number(menuItem.price),
                quantityMap.get(menuItem.id) ?? 1,
                timestamp,
            ]);
            insertOrderItem.free();
        }
        const deleteCart = db.prepare(`DELETE FROM cart_items WHERE user_id = ? AND menu_item_id IN (${menuItemIds.map(() => '?').join(',')})`);
        deleteCart.run([req.auth?.userId ?? '', ...menuItemIds]);
        deleteCart.free();
        return {
            id: orderId,
            user_id: req.auth?.userId ?? '',
            restaurant_id: restaurantId,
            address_id: addressId ?? null,
            status: 'PENDING',
            subtotal,
            delivery_fee: deliveryFee,
            tax,
            total,
            notes: notes ?? null,
            created_at: timestamp,
            updated_at: timestamp,
            restaurant_name: '',
            restaurant_image_url: null,
        };
    });
    const restaurant = await get('SELECT name, image_url FROM restaurants WHERE id = ?', [restaurantId]);
    const itemsRows = await all('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC', [
        createdOrder.id,
    ]);
    return res.status(201).json({
        order: toOrder({
            ...createdOrder,
            restaurant_name: restaurant?.name ?? '',
            restaurant_image_url: restaurant?.image_url ?? null,
        }, itemsRows),
    });
});
//# sourceMappingURL=orders.js.map