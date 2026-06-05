import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import type { Address } from '../types/address';

type AddressesResponse = {
  addresses: Address[];
};

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, loading, updateQuantity, removeItem, checkout } =
    useCart();
  const [notes, setNotes] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('49');
  const [tax, setTax] = useState('18');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressLoading, setAddressLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadAddresses = async () => {
      setAddressLoading(true);

      try {
        const { data } = await api.get<AddressesResponse>('/addresses');
        if (!active) {
          return;
        }

        setAddresses(data.addresses);
        const defaultAddress = data.addresses.find((address) => address.isDefault) ?? data.addresses[0];
        setSelectedAddressId(defaultAddress?.id ?? '');
      } catch {
        if (active) {
          setAddresses([]);
          setSelectedAddressId('');
        }
      } finally {
        if (active) {
          setAddressLoading(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      active = false;
    };
  }, []);

  const parsedDeliveryFee = Number(deliveryFee) || 0;
  const parsedTax = Number(tax) || 0;
  const total = subtotal + parsedDeliveryFee + parsedTax;

  const changeQuantity = async (menuItemId: string, quantity: number) => {
    setError('');
    setBusyItemId(menuItemId);

    try {
      if (quantity <= 0) {
        await removeItem(menuItemId);
      } else {
        await updateQuantity(menuItemId, quantity);
      }
    } catch (quantityError) {
      setError(quantityError instanceof Error ? quantityError.message : 'Unable to update cart');
    } finally {
      setBusyItemId(null);
    }
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    if (!selectedAddressId) {
      setError('Add and select a delivery address before placing the order.');
      setSubmitting(false);
      return;
    }

    try {
      await checkout({
        addressId: selectedAddressId,
        notes: notes.trim() || undefined,
        deliveryFee: parsedDeliveryFee,
        tax: parsedTax,
      });
      navigate('/orders');
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="section__header">
        <div>
          <h2>Your cart</h2>
          <p>Review items, change quantities, and place the order when you are ready.</p>
        </div>
        <div className="meta-row">
          <span className="pill">{itemCount} items</span>
          <span className="pill">Subtotal ₹{subtotal.toFixed(2)}</span>
        </div>
      </div>

      {error ? <div className="page-status">{error}</div> : null}

      {loading ? <div className="page-status">Loading cart...</div> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add menu items from a restaurant to start building an order.</p>
          <Link to="/restaurants" className="button button--primary">
            Browse restaurants
          </Link>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="cart-layout">
          <div className="restaurant-grid">
            {items.map((item) => (
              <article className="restaurant-card" key={item.id}>
                <div className="restaurant-card__header">
                  <div className="restaurant-card__title">
                    <h3>{item.name}</h3>
                    <div className="meta-row">
                      <span className="pill">{item.restaurantName}</span>
                      {item.category ? <span className="pill">{item.category}</span> : null}
                    </div>
                  </div>
                  <span className="pill">₹{item.lineTotal.toFixed(2)}</span>
                </div>

                <p>{item.description ?? 'Selected item from your restaurant cart.'}</p>

                <div className="cart-item-controls">
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => changeQuantity(item.menuItemId, item.quantity - 1)}
                      disabled={busyItemId === item.menuItemId}
                    >
                      -
                    </button>
                    <span className="pill quantity-stepper__value">{item.quantity}</span>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => changeQuantity(item.menuItemId, item.quantity + 1)}
                      disabled={busyItemId === item.menuItemId}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => changeQuantity(item.menuItemId, 0)}
                    disabled={busyItemId === item.menuItemId}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="form-card cart-summary">
            <h2>Checkout</h2>
            <p className="hint">For now this checkout lets you add notes and set fee values for testing.</p>

            <form className="form" onSubmit={handleCheckout}>
              <div className="address-picker">
                <div className="form__meta">
                  <span className="field-label">Delivery address</span>
                  <Link to="/addresses" className="button--link">
                    Manage addresses
                  </Link>
                </div>

                {addressLoading ? <div className="page-status">Loading saved addresses...</div> : null}

                {!addressLoading && addresses.length === 0 ? (
                  <div className="page-status">
                    Add a delivery address first. You need one to complete checkout.
                  </div>
                ) : null}

                {!addressLoading && addresses.length > 0 ? (
                  <div className="address-picks">
                    {addresses.map((address) => (
                      <label className="address-pick" key={address.id}>
                        <input
                          type="radio"
                          name="delivery-address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                        <span>
                          <strong>{address.label ?? 'Saved address'}</strong>
                          <br />
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}
                          <br />
                          {address.city}, {address.state}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>

              <label className="field">
                <span>Delivery notes</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Gate code, landmark, contact instructions..."
                />
              </label>

              <div className="cart-fees">
                <label className="field">
                  <span>Delivery fee</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryFee}
                    onChange={(event) => setDeliveryFee(event.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Tax</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tax}
                    onChange={(event) => setTax(event.target.value)}
                  />
                </label>
              </div>

              <div className="summary-stack">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <strong>₹{parsedDeliveryFee.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <strong>₹{parsedTax.toFixed(2)}</strong>
                </div>
                <div className="summary-row summary-row--total">
                  <span>Total</span>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>
              </div>

              <button type="submit" className="button button--primary button--full" disabled={submitting}>
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
