import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth/AuthProvider";
import { colors, radius } from "../lib/theme";
import type { Order } from "@zooli/api-client";

const STATUS_LABEL: Record<string, string> = {
  pending: "Placed", confirmed: "Confirmed", preparing: "Preparing",
  ready_for_pickup: "Ready", out_for_delivery: "On the way", delivered: "Delivered", cancelled: "Cancelled",
};

export default function AccountScreen() {
  const router = useRouter();
  const { profile, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.replace("/login"); return; }
    api.orders.list().then(({ orders }) => setOrders(orders)).finally(() => setLoading(false));
  }, [authLoading, profile, router]);

  if (authLoading || loading) return <View style={styles.center}><ActivityIndicator color={colors.violet[600]} /></View>;
  if (!profile) return null;

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(o) => o.id}
      ListHeaderComponent={
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(profile.full_name ?? "?")[0]}</Text></View>
          <View>
            <Text style={styles.name}>{profile.full_name ?? "Zooli Customer"}</Text>
            <Text style={styles.phone}>{profile.phone ?? ""}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => logout().then(() => router.replace("/"))}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.orderCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
            <Text style={styles.orderMeta}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.orderTotal}>₹{item.total}</Text>
          <Text style={styles.orderStatus}>{STATUS_LABEL[item.status] ?? item.status}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: colors.ink[500], textAlign: "center", marginTop: 20 }}>No orders yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.paper[0], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], padding: 16, marginBottom: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.violet[600], alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontWeight: "700" },
  name: { fontWeight: "700", color: colors.ink[900] },
  phone: { fontSize: 12, color: colors.ink[500] },
  logoutBtn: { marginLeft: "auto" },
  logoutText: { color: "#DC2626", fontWeight: "600", fontSize: 12 },
  orderCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper[0], borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line[200], padding: 12, marginBottom: 8 },
  orderId: { fontWeight: "700", color: colors.violet[600], fontSize: 13 },
  orderMeta: { fontSize: 11, color: colors.ink[500], marginTop: 2 },
  orderTotal: { fontWeight: "700", color: colors.ink[900], marginRight: 12 },
  orderStatus: { fontSize: 11, fontWeight: "700", color: colors.leaf[600], backgroundColor: colors.leaf[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
});
