"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { fmtFull } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Category, Product } from "@zooli/api-client";

interface FormState {
  name: string; category_id: string; price: number; description: string;
  isAvailable: boolean;
}
const EMPTY: FormState = { name: "", category_id: "", price: 0, description: "", isAvailable: true };

export default function MenuPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [needsStore, setNeedsStore] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const [{ store }, { categories: cats }] = await Promise.all([api.vendor.getStore(), api.categories.list()]);
      setCategories(cats);
      if (!store) { setNeedsStore(true); setLoading(false); return; }
      setStoreId(store.id);
      const { products } = await api.vendor.products();
      setItems(products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadAll(); }, []);

  const catName = (id: string | null) => categories.find(c => c.id === id)?.name ?? "Uncategorized";
  const cats = ["All", ...categories.map(c => c.name)];
  const filtered = items.filter(i => {
    const matchCat = cat === "All" || catName(i.category_id) === cat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const available = items.filter(i => i.is_available).length;

  function openAdd() { setForm(EMPTY); setEditItem(null); setShowForm(true); }
  function openEdit(item: Product) {
    setForm({ name: item.name, category_id: item.category_id ?? "", price: item.price, description: item.description ?? "", isAvailable: item.is_available });
    setEditItem(item); setShowForm(true);
  }

  async function toggleAvail(item: Product) {
    setItems(p => p.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    try { await api.vendor.updateProduct(item.id, { is_available: !item.is_available }); } catch { loadAll(); }
  }
  async function deleteItem(id: string) {
    if (!confirm("Remove this item from your menu?")) return;
    setItems(p => p.filter(i => i.id !== id));
    try { await api.vendor.deleteProduct(id); } catch { loadAll(); }
  }

  async function handleSave() {
    if (!form.name.trim() || form.price <= 0 || !storeId) return;
    setSaving(true);
    try {
      if (editItem) {
        const { product } = await api.vendor.updateProduct(editItem.id, {
          name: form.name, price: form.price, description: form.description, category_id: form.category_id || undefined,
        });
        setItems(p => p.map(i => i.id === product.id ? product : i));
      } else {
        const { product } = await api.stores.addProduct(storeId, {
          name: form.name, price: form.price, description: form.description, category_id: form.category_id || undefined,
        });
        setItems(p => [product, ...p]);
      }
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  const inp = (err?: boolean) => `w-full border ${err ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-50 transition-all`;

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  if (needsStore) {
    return <StoreOnboarding onCreated={loadAll} />;
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>}
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Menu & Items</h2>
          <p className="text-sm text-gray-400">{available} of {items.length} items currently available</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-purple-500/20">
          <Plus size={15} /> Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cat === c ? "bg-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {c} {c !== "All" && <span className="ml-1 opacity-70">({items.filter(i => catName(i.category_id) === c).length})</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
            placeholder="Search by name or description..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(item => {
          return (
          <div key={item.id} className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md ${item.is_available ? "border-gray-100" : "border-gray-200 opacity-65"}`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 truncate">{item.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{catName(item.category_id)}</div>
                </div>
                <button onClick={() => toggleAvail(item)} title={item.is_available ? "Mark Unavailable" : "Mark Available"}
                  className={`transition-colors flex-shrink-0 ${item.is_available ? "text-emerald-600 hover:text-emerald-700" : "text-gray-300 hover:text-gray-400"}`}>
                  {item.is_available ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{item.description}</p>

              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {!item.is_available && <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">UNAVAILABLE</span>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <span className="text-lg font-bold text-gray-900">{fmtFull(item.price)}</span>
                  <span className="text-xs text-gray-400 ml-2">{item.stock_qty} in stock</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <div className="text-sm font-semibold text-gray-400">No items found</div>
        </div>
      )}

      {/* Add/Edit slide-over */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={() => setShowForm(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-40 flex flex-col shadow-2xl slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900">{editItem ? "Edit Menu Item" : "Add New Item"}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editItem ? "Update item details" : "Add a new dish to your menu"}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Item Name *</label>
                <input className={inp(!form.name)} placeholder="e.g. Chicken Biryani"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select className={inp()} value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">Uncategorized</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹) *</label>
                  <input type="number" className={inp(form.price <= 0 && !!form.name)} placeholder="0"
                    value={form.price || ""} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea className={inp()} rows={3} placeholder="Describe the item to customers..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="space-y-2 pt-1">
                {([
                  { key: "isAvailable", label: "Available Now", desc: "Customers can order this" },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                    <button onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                      className={form[key] ? "text-purple-600" : "text-gray-300"}>
                      {form[key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <button onClick={handleSave} disabled={saving || !form.name || form.price <= 0}
                className="flex-1 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? "Saving..." : editItem ? "Save Changes" : "Add to Menu"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StoreOnboarding({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!name.trim()) return;
    setSaving(true); setError("");
    try {
      await api.vendor.createStore({ name, address, category: "restaurant" });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create store");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-12">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Set up your store</h2>
      <p className="text-sm text-gray-400 mb-5">You need a store before you can add menu items.</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}
      <div className="space-y-3">
        <input className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400"
          placeholder="Store name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400"
          placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        <button onClick={create} disabled={saving || !name.trim()}
          className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
          {saving ? "Creating..." : "Create Store"}
        </button>
      </div>
    </div>
  );
}
