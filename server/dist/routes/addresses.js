import { Router } from 'express';
import { z } from 'zod';
import { all, createId, get, nowIso, run } from '../db/sqlite.js';
import { requireAuth } from '../middleware/auth.js';
const addressSchema = z.object({
    label: z.string().trim().max(80).optional(),
    line1: z.string().trim().min(3).max(160),
    line2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().min(2).max(80).optional().default('India'),
    isDefault: z.boolean().optional().default(false),
});
const toAddress = (address) => ({
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    isDefault: address.is_default === 1,
    createdAt: address.created_at,
    updatedAt: address.updated_at,
});
const loadAddresses = async (userId) => {
    const addresses = await all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
    return addresses.map(toAddress);
};
export const addressesRouter = Router();
addressesRouter.get('/', requireAuth, async (req, res) => {
    const addresses = await loadAddresses(req.auth?.userId ?? '');
    return res.json({ addresses });
});
addressesRouter.post('/', requireAuth, async (req, res) => {
    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid address data',
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const userId = req.auth?.userId ?? '';
    const existingCount = await get('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', [userId]);
    const shouldSetDefault = parsed.data.isDefault || Number(existingCount?.count ?? 0) === 0;
    const timestamp = nowIso();
    const addressId = createId();
    if (shouldSetDefault) {
        await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    await run(`INSERT INTO addresses (
      id, user_id, label, line1, line2, city, state, postal_code, country, is_default, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        addressId,
        userId,
        parsed.data.label ?? null,
        parsed.data.line1,
        parsed.data.line2 ?? null,
        parsed.data.city,
        parsed.data.state,
        parsed.data.postalCode,
        parsed.data.country,
        shouldSetDefault ? 1 : 0,
        timestamp,
        timestamp,
    ]);
    const address = await get('SELECT * FROM addresses WHERE id = ?', [addressId]);
    return res.status(201).json({ address: address ? toAddress(address) : null });
});
addressesRouter.patch('/:id/default', requireAuth, async (req, res) => {
    const userId = req.auth?.userId ?? '';
    const addressId = typeof req.params.id === 'string' ? req.params.id : '';
    if (!addressId) {
        return res.status(400).json({ message: 'Missing address id' });
    }
    const existing = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
        addressId,
        userId,
    ]);
    if (!existing) {
        return res.status(404).json({ message: 'Address not found' });
    }
    await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    await run('UPDATE addresses SET is_default = 1, updated_at = ? WHERE id = ?', [nowIso(), existing.id]);
    const addresses = await loadAddresses(userId);
    return res.json({ addresses });
});
addressesRouter.patch('/:id', requireAuth, async (req, res) => {
    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid address data',
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const userId = req.auth?.userId ?? '';
    const addressId = typeof req.params.id === 'string' ? req.params.id : '';
    if (!addressId) {
        return res.status(400).json({ message: 'Missing address id' });
    }
    const existing = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
        addressId,
        userId,
    ]);
    if (!existing) {
        return res.status(404).json({ message: 'Address not found' });
    }
    const shouldSetDefault = parsed.data.isDefault || existing.is_default === 1;
    if (shouldSetDefault) {
        await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    await run(`UPDATE addresses
     SET label = ?, line1 = ?, line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`, [
        parsed.data.label ?? null,
        parsed.data.line1,
        parsed.data.line2 ?? null,
        parsed.data.city,
        parsed.data.state,
        parsed.data.postalCode,
        parsed.data.country,
        shouldSetDefault ? 1 : 0,
        nowIso(),
        existing.id,
        userId,
    ]);
    const address = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
        existing.id,
        userId,
    ]);
    const addresses = await loadAddresses(userId);
    return res.json({ address: address ? toAddress(address) : null, addresses });
});
addressesRouter.delete('/:id', requireAuth, async (req, res) => {
    const userId = req.auth?.userId ?? '';
    const addressId = typeof req.params.id === 'string' ? req.params.id : '';
    if (!addressId) {
        return res.status(400).json({ message: 'Missing address id' });
    }
    const existing = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
        addressId,
        userId,
    ]);
    if (!existing) {
        return res.status(404).json({ message: 'Address not found' });
    }
    await run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [existing.id, userId]);
    const remaining = await all('SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at ASC', [
        userId,
    ]);
    if (existing.is_default === 1 && remaining.length > 0) {
        await run('UPDATE addresses SET is_default = 1, updated_at = ? WHERE id = ?', [
            nowIso(),
            remaining[0].id,
        ]);
    }
    const addresses = await loadAddresses(userId);
    return res.json({ addresses });
});
//# sourceMappingURL=addresses.js.map