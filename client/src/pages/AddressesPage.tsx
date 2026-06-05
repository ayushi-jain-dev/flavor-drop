import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { Address } from '../types/address';

type AddressesResponse = {
  addresses: Address[];
};

const emptyForm = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: true,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const loadAddresses = async () => {
    setLoading(true);

    try {
      const { data } = await api.get<AddressesResponse>('/addresses');
      setAddresses(data.addresses);
      setForm((current) => ({
        ...current,
        isDefault: data.addresses.length === 0 ? true : current.isDefault,
      }));
    } catch {
      setError('Could not load addresses. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        label: form.label.trim() || undefined,
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim() || 'India',
        isDefault: form.isDefault,
      };

      await api.post('/addresses', payload);
      setForm(emptyForm);
      await loadAddresses();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to create address');
    } finally {
      setSubmitting(false);
    }
  };

  const setDefault = async (id: string) => {
    setError('');

    try {
      const { data } = await api.patch<AddressesResponse>(`/addresses/${id}/default`);
      setAddresses(data.addresses);
    } catch {
      setError('Unable to update default address');
    }
  };

  const deleteAddress = async (id: string) => {
    setError('');

    try {
      const { data } = await api.delete<AddressesResponse>(`/addresses/${id}`);
      setAddresses(data.addresses);
    } catch {
      setError('Unable to delete address');
    }
  };

  return (
    <section className="section">
      <div className="section__header">
        <div>
          <h2>Delivery addresses</h2>
          <p>Save the places where you want your food delivered.</p>
        </div>

        <Link to="/cart" className="button button--ghost">
          Back to cart
        </Link>
      </div>

      {loading ? <div className="page-status">Loading addresses...</div> : null}
      {error ? <div className="page-status">{error}</div> : null}

      <div className="address-grid">
        <article className="form-card">
          <h2>Add address</h2>
          <p className="hint">
            The first address becomes your default automatically, and you can change it later.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="address-form-grid">
              <label className="field">
                <span>Label</span>
                <input
                  type="text"
                  value={form.label}
                  onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                  placeholder="Home, Office, Hostel"
                />
              </label>

              <label className="field">
                <span>Country</span>
                <input
                  type="text"
                  value={form.country}
                  onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                  placeholder="India"
                />
              </label>
            </div>

            <label className="field">
              <span>Address line 1</span>
              <input
                type="text"
                value={form.line1}
                onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
                placeholder="Flat no, street, building"
                required
              />
            </label>

            <label className="field">
              <span>Address line 2</span>
              <input
                type="text"
                value={form.line2}
                onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))}
                placeholder="Area, landmark"
              />
            </label>

            <div className="address-form-grid">
              <label className="field">
                <span>City</span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  required
                />
              </label>

              <label className="field">
                <span>State</span>
                <input
                  type="text"
                  value={form.state}
                  onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="address-form-grid">
              <label className="field">
                <span>Postal code</span>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))}
                  required
                />
              </label>

              <label className="field address-checkbox">
                <span>Default</span>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isDefault: event.target.checked }))
                    }
                  />
                  <span>Use as default delivery address</span>
                </label>
              </label>
            </div>

            {formError ? <div className="form__error">{formError}</div> : null}

            <button type="submit" className="button button--primary button--full" disabled={submitting}>
              {submitting ? 'Saving address...' : 'Save address'}
            </button>
          </form>
        </article>

        <div className="restaurant-grid">
          {addresses.length === 0 && !loading ? (
            <div className="empty-state">
              <h2>No addresses yet</h2>
              <p>Add your first delivery address to enable checkout.</p>
            </div>
          ) : null}

          {addresses.map((address) => (
            <article className="restaurant-card" key={address.id}>
              <div className="restaurant-card__header">
                <div className="restaurant-card__title">
                  <h3>{address.label ?? 'Saved address'}</h3>
                  <div className="meta-row">
                    <span className="pill">{address.city}</span>
                    <span className="pill">{address.state}</span>
                    {address.isDefault ? <span className="pill">Default</span> : null}
                  </div>
                </div>
              </div>

              <p>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </p>

              <div className="meta-row">
                {!address.isDefault ? (
                  <button type="button" className="button button--ghost" onClick={() => setDefault(address.id)}>
                    Make default
                  </button>
                ) : null}
                <button type="button" className="button button--ghost" onClick={() => deleteAddress(address.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
