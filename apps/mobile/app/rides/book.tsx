import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth/AuthProvider";
import { colors, radius } from "../../lib/theme";

// A real ride request needs pickup/drop lat+lng — this screen accepts them
// as plain numbers rather than embedding a map/geocoding SDK, which is a
// reasonable first cut but the obvious next enhancement (a map picker) over
// typing coordinates by hand.
const VEHICLES = [
  { id: "bike", label: "Bike", emoji: "🏍️" },
  { id: "auto", label: "Auto", emoji: "🛺" },
  { id: "sedan", label: "Sedan", emoji: "🚗" },
  { id: "suv", label: "SUV", emoji: "🚙" },
] as const;

export default function BookRideScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [vehicle, setVehicle] = useState<typeof VEHICLES[number]["id"]>("bike");
  const [pickupAddr, setPickupAddr] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropAddr, setDropAddr] = useState("");
  const [dropLat, setDropLat] = useState("");
  const [dropLng, setDropLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestRide() {
    if (!profile) { router.push("/login"); return; }
    const plat = parseFloat(pickupLat), plng = parseFloat(pickupLng);
    const dlat = parseFloat(dropLat), dlng = parseFloat(dropLng);
    if (!pickupAddr || !dropAddr || [plat, plng, dlat, dlng].some(Number.isNaN)) {
      setError("Fill in pickup and drop, including coordinates");
      return;
    }
    setLoading(true); setError("");
    try {
      const { ride } = await api.rides.request({
        vehicleType: vehicle,
        pickup: { address: pickupAddr, lat: plat, lng: plng },
        drop: { address: dropAddr, lat: dlat, lng: dlng },
      });
      router.replace(`/rides/${ride.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't request a ride");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.label}>Vehicle</Text>
      <View style={styles.vehicleRow}>
        {VEHICLES.map((v) => (
          <TouchableOpacity key={v.id} style={[styles.vehicleChip, vehicle === v.id && styles.vehicleChipActive]} onPress={() => setVehicle(v.id)}>
            <Text style={styles.vehicleEmoji}>{v.emoji}</Text>
            <Text style={[styles.vehicleLabel, vehicle === v.id && styles.vehicleLabelActive]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Pickup</Text>
      <TextInput style={styles.input} placeholder="Pickup address" value={pickupAddr} onChangeText={setPickupAddr} />
      <View style={styles.coordRow}>
        <TextInput style={[styles.input, styles.coordInput]} placeholder="Latitude" keyboardType="numeric" value={pickupLat} onChangeText={setPickupLat} />
        <TextInput style={[styles.input, styles.coordInput]} placeholder="Longitude" keyboardType="numeric" value={pickupLng} onChangeText={setPickupLng} />
      </View>

      <Text style={styles.label}>Drop</Text>
      <TextInput style={styles.input} placeholder="Drop address" value={dropAddr} onChangeText={setDropAddr} />
      <View style={styles.coordRow}>
        <TextInput style={[styles.input, styles.coordInput]} placeholder="Latitude" keyboardType="numeric" value={dropLat} onChangeText={setDropLat} />
        <TextInput style={[styles.input, styles.coordInput]} placeholder="Longitude" keyboardType="numeric" value={dropLng} onChangeText={setDropLng} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.submit} disabled={loading} onPress={requestRide}>
        <Text style={styles.submitText}>{loading ? "Requesting..." : "Request Ride"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20 },
  label: { fontSize: 12, fontWeight: "700", color: colors.ink[500], textTransform: "uppercase", marginBottom: 8, marginTop: 16 },
  vehicleRow: { flexDirection: "row", gap: 8 },
  vehicleChip: { flex: 1, alignItems: "center", padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], backgroundColor: colors.paper[0] },
  vehicleChipActive: { borderColor: colors.violet[600], backgroundColor: colors.violet[50] },
  vehicleEmoji: { fontSize: 22 },
  vehicleLabel: { fontSize: 11, fontWeight: "700", color: colors.ink[700], marginTop: 4 },
  vehicleLabelActive: { color: colors.violet[700] },
  input: { borderWidth: 1, borderColor: colors.line[200], backgroundColor: colors.paper[0], borderRadius: radius.sm, padding: 12, fontSize: 14, marginBottom: 8 },
  coordRow: { flexDirection: "row", gap: 8 },
  coordInput: { flex: 1 },
  error: { color: "#DC2626", fontSize: 13, marginTop: 8 },
  submit: { backgroundColor: colors.violet[600], borderRadius: radius.sm, padding: 15, alignItems: "center", marginTop: 20 },
  submitText: { color: "white", fontWeight: "700", fontSize: 15 },
});
