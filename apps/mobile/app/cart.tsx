import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../lib/api";
import { colors, radius } from "../lib/theme";
import type { Cart, Address } from "@zooli/api-client";

export default function CartScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ line1: "", city: "", pincode: "" });
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  async function load() {
    if (!storeId) return;
    const [{ cart }, { addresses }] = await Promise.all([api.cart.get(storeId), api.addresses.list()]);
    setCart(cart);
    setAddresses(addresses);
    const def = addresses.find((a) => a.is_default) ?? addresses[0];
    if (def) setSelectedAddressId(def.id);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [storeId]);

  async function removeItem(itemId: string) {
    await api.cart.removeItem(itemId);
    load();
  }

  async function saveAddress() {
    if (!draft.line1 || !draft.city || !draft.pincode) return;
    const { address } = await api.addresses.create({ ...draft, is_default: addresses.length === 0 });
    setAddresses((a) => [...a, address]);
    setSelectedAddressId(address.id);
    setShowForm(false);
  }

  async function checkout() {
    if (!storeId) return;
    if (!selectedAddressId) { setShowForm(true); return; }
    setCheckingOut(true); setError("");
    try {
      await api.orders.checkout(storeId, selectedAddressId);
      setPlaced(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (placed) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>🎉</Text>
        <Text style={styles.placedTitle}>Order placed!</Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.replace("/account")}>
          <Text style={styles.checkoutBtnText}>Track your order</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cart) return <View style={styles.center}><ActivityIndicator color={colors.violet[600]} /></View>;

  if (cart.cart_items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>🛒</Text>
        <Text style={styles.placedTitle}>Your cart is empty</Text>
      </View>
    );
  }

  const subtotal = cart.cart_items.reduce((a, i) => a + i.products.price * i.qty, 0);
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={cart.cart_items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{item.products.name}</Text>
              <Text style={styles.rowQty}>Qty {item.qty}</Text>
            </View>
            <Text style={styles.rowPrice}>₹{item.products.price * item.qty}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            {addresses.length > 0 && !showForm && (
              <View style={styles.addrList}>
                {addresses.map((a) => (
                  <TouchableOpacity key={a.id} style={[styles.addrChip, selectedAddressId === a.id && styles.addrChipActive]} onPress={() => setSelectedAddressId(a.id)}>
                    <Text style={[styles.addrChipText, selectedAddressId === a.id && styles.addrChipTextActive]}>{a.label} — {a.line1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {showForm && (
              <View style={{ gap: 8, marginBottom: 12 }}>
                <TextInput style={styles.input} placeholder="Address line" value={draft.line1} onChangeText={(t) => setDraft((d) => ({ ...d, line1: t }))} />
                <TextInput style={styles.input} placeholder="City" value={draft.city} onChangeText={(t) => setDraft((d) => ({ ...d, city: t }))} />
                <TextInput style={styles.input} placeholder="Pincode" value={draft.pincode} onChangeText={(t) => setDraft((d) => ({ ...d, pincode: t }))} />
                <TouchableOpacity style={styles.saveAddrBtn} onPress={saveAddress}><Text style={styles.saveAddrBtnText}>Save Address</Text></TouchableOpacity>
              </View>
            )}
            {addresses.length === 0 && !showForm && (
              <TouchableOpacity style={styles.saveAddrBtn} onPress={() => setShowForm(true)}><Text style={styles.saveAddrBtnText}>+ Add delivery address</Text></TouchableOpacity>
            )}

            {error ? <Text style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{error}</Text> : null}

            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text>₹{subtotal}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery fee</Text><Text>₹{deliveryFee}</Text></View>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalLabel}>₹{total}</Text></View>
            <TouchableOpacity style={styles.checkoutBtn} disabled={checkingOut} onPress={checkout}>
              <Text style={styles.checkoutBtnText}>{checkingOut ? "Placing order..." : "Proceed to Checkout"}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  placedTitle: { fontSize: 16, fontWeight: "700", color: colors.ink[900] },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.paper[0], borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line[200], padding: 12, marginBottom: 8 },
  rowName: { fontSize: 14, fontWeight: "700", color: colors.ink[900] },
  rowQty: { fontSize: 12, color: colors.ink[500] },
  rowPrice: { fontSize: 14, fontWeight: "700", color: colors.ink[900] },
  remove: { fontSize: 12, color: "#DC2626", fontWeight: "600" },
  summary: { marginTop: 16, backgroundColor: colors.paper[0], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], padding: 16 },
  addrList: { gap: 8, marginBottom: 12 },
  addrChip: { borderWidth: 1, borderColor: colors.line[200], borderRadius: radius.sm, padding: 10 },
  addrChipActive: { borderColor: colors.violet[600], backgroundColor: colors.violet[50] },
  addrChipText: { fontSize: 13, color: colors.ink[700] },
  addrChipTextActive: { color: colors.violet[700], fontWeight: "700" },
  input: { borderWidth: 1, borderColor: colors.line[200], borderRadius: radius.sm, padding: 12, fontSize: 14 },
  saveAddrBtn: { borderWidth: 1, borderColor: colors.violet[600], borderRadius: radius.sm, padding: 12, alignItems: "center", marginBottom: 12 },
  saveAddrBtnText: { color: colors.violet[600], fontWeight: "700", fontSize: 13 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { color: colors.ink[500] },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line[200], marginTop: 8, paddingTop: 8, marginBottom: 14 },
  totalLabel: { fontWeight: "700", fontSize: 15, color: colors.ink[900] },
  checkoutBtn: { backgroundColor: colors.violet[600], borderRadius: radius.sm, padding: 14, alignItems: "center" },
  checkoutBtnText: { color: "white", fontWeight: "700" },
});
