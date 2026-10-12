import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth/AuthProvider";
import { colors, radius } from "../../lib/theme";
import type { Product, Cart } from "@zooli/api-client";

export default function StoreScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { products } = await api.stores.products(storeId);
    setProducts(products);
    if (profile) {
      const { cart } = await api.cart.get(storeId);
      setCart(cart);
    }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [storeId, profile]);

  async function addToCart(productId: string) {
    if (!profile) { router.push("/login"); return; }
    setBusyId(productId);
    try {
      await api.cart.addItem(storeId, productId, 1);
      const { cart } = await api.cart.get(storeId);
      setCart(cart);
    } finally {
      setBusyId(null);
    }
  }

  const qtyInCart = (productId: string) => cart?.cart_items?.find((i) => i.product_id === productId)?.qty ?? 0;
  const cartCount = cart?.cart_items?.reduce((a, i) => a + i.qty, 0) ?? 0;

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.violet[600]} /></View>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.list}
        data={products}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<View style={styles.center}><Text style={{ color: colors.ink[500] }}>No items listed yet.</Text></View>}
        renderItem={({ item }) => {
          const inCart = qtyInCart(item.id);
          const disabled = !item.is_available || item.stock_qty === 0 || busyId === item.id;
          return (
            <View style={styles.item}>
              <View style={styles.itemThumb}><Text style={styles.itemThumbText}>{item.name.charAt(0)}</Text></View>
              <View style={styles.itemBody}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text> : null}
                <View style={styles.itemBottom}>
                  <Text style={styles.price}>₹{item.price}<Text style={styles.unit}>/{item.unit}</Text></Text>
                  <TouchableOpacity style={[styles.addBtn, disabled && styles.addBtnDisabled]} disabled={disabled} onPress={() => addToCart(item.id)}>
                    <Text style={[styles.addBtnText, disabled && styles.addBtnTextDisabled]}>
                      {!item.is_available || item.stock_qty === 0 ? "Out of stock" : busyId === item.id ? "Adding..." : inCart > 0 ? `In cart · ${inCart}` : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => router.push(`/cart?storeId=${storeId}`)}>
          <Text style={styles.cartBarText}>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</Text>
          <Text style={styles.cartBarText}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  list: { padding: 16, paddingBottom: 90 },
  item: { flexDirection: "row", gap: 12, backgroundColor: colors.paper[0], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], padding: 12, marginBottom: 10 },
  itemThumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.violet[50], alignItems: "center", justifyContent: "center" },
  itemThumbText: { color: colors.violet[600], fontWeight: "700" },
  itemBody: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "700", color: colors.ink[900] },
  itemDesc: { fontSize: 12, color: colors.ink[500], marginTop: 2 },
  itemBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  price: { fontSize: 14, fontWeight: "700", color: colors.ink[900] },
  unit: { fontSize: 11, fontWeight: "400", color: colors.ink[500] },
  addBtn: { backgroundColor: colors.violet[600], borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 16 },
  addBtnDisabled: { backgroundColor: colors.line[200] },
  addBtnText: { color: "white", fontWeight: "700", fontSize: 12 },
  addBtnTextDisabled: { color: colors.ink[500] },
  cartBar: { position: "absolute", bottom: 16, left: 16, right: 16, backgroundColor: colors.violet[700], borderRadius: radius.md, padding: 16, flexDirection: "row", justifyContent: "space-between" },
  cartBarText: { color: "white", fontWeight: "700" },
});
