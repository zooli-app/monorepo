import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../lib/api";
import { colors, radius } from "../../lib/theme";
import type { Store } from "@zooli/api-client";

export default function StoresScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const backendCategory = category === "food" ? "restaurant" : "grocery";

  useEffect(() => {
    api.stores.list(backendCategory).then(({ stores }) => setStores(stores)).finally(() => setLoading(false));
  }, [backendCategory]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.violet[600]} /></View>;
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={stores}
      keyExtractor={(s) => s.id}
      ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No stores here yet.</Text></View>}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/store/${item.id}`)}>
          <View style={styles.thumb}><Text style={styles.thumbText}>{item.name.charAt(0)}</Text></View>
          <View style={styles.body}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.address ?? "Address not set"}</Text>
            {!item.is_open && <Text style={styles.closed}>Closed</Text>}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: colors.ink[500] },
  list: { padding: 16, gap: 10 },
  card: { flexDirection: "row", gap: 12, backgroundColor: colors.paper[0], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], padding: 12, marginBottom: 10 },
  thumb: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.violet[50], alignItems: "center", justifyContent: "center" },
  thumbText: { color: colors.violet[600], fontWeight: "700", fontSize: 18 },
  body: { flex: 1, justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "700", color: colors.ink[900] },
  meta: { fontSize: 12, color: colors.ink[500], marginTop: 2 },
  closed: { fontSize: 11, color: "#DC2626", fontWeight: "700", marginTop: 2 },
});
