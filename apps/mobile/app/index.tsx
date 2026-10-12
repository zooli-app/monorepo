import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/auth/AuthProvider";
import { colors, radius } from "../lib/theme";

// Only groceries, food, and rides have a real backend — this is a
// deliberately small, real category list rather than the 9-category mock
// set the web app shows (see zooli-web's services page for that fuller
// mock-backed nav; this app only surfaces what's actually wired).
const CATEGORIES = [
  { slug: "grocery", label: "Groceries", emoji: "🛒", href: "/stores/grocery" as const },
  { slug: "food", label: "Food Delivery", emoji: "🍽️", href: "/stores/food" as const },
  { slug: "rides", label: "Book a Ride", emoji: "🚗", href: "/rides/book" as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{profile ? `Hi, ${profile.full_name?.split(" ")[0] ?? "there"}` : "Welcome to Zooli"}</Text>
          <Text style={styles.sub}>What do you need today?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push(profile ? "/account" : "/login")} style={styles.avatarBtn}>
          <Text style={styles.avatarText}>{profile ? (profile.full_name?.[0] ?? "?") : "→"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c.slug} style={styles.card} onPress={() => router.push(c.href)}>
            <Text style={styles.cardEmoji}>{c.emoji}</Text>
            <Text style={styles.cardLabel}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.cartLink} onPress={() => router.push("/cart")}>
        <Text style={styles.cartLinkText}>View Cart</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper[50], padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 20, fontWeight: "700", color: colors.ink[900] },
  sub: { fontSize: 13, color: colors.ink[500], marginTop: 2 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.violet[600], alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47%", backgroundColor: colors.paper[0], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], padding: 20, alignItems: "center", gap: 8 },
  cardEmoji: { fontSize: 32 },
  cardLabel: { fontSize: 14, fontWeight: "700", color: colors.ink[900] },
  cartLink: { marginTop: "auto", backgroundColor: colors.violet[700], borderRadius: radius.md, padding: 16, alignItems: "center" },
  cartLinkText: { color: "white", fontWeight: "700", fontSize: 15 },
});
