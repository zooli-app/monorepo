import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../lib/api";
import { colors, radius } from "../../lib/theme";
import type { Ride, LatLng } from "@zooli/api-client";

const STATUS_LABEL: Record<string, string> = {
  requested: "Requesting...", searching: "Finding a driver...", accepted: "Driver on the way",
  arrived: "Driver has arrived", in_progress: "On trip", completed: "Trip completed", cancelled: "Cancelled",
};
const POLL_MS = 4000;

export default function RideTrackingScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const poll = useCallback(async () => {
    const { ride, driverLocation } = await api.rides.get(rideId);
    setRide(ride);
    setDriverLocation(driverLocation);
  }, [rideId]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  async function cancelRide() {
    setCancelling(true);
    try {
      await api.rides.updateStatus(rideId, "cancelled");
      await poll();
    } finally {
      setCancelling(false);
    }
  }

  if (!ride) return <View style={styles.center}><ActivityIndicator color={colors.violet[600]} /></View>;

  const canCancel = ["requested", "searching", "accepted"].includes(ride.status);

  return (
    <View style={styles.wrap}>
      <View style={styles.statusCard}>
        <Text style={styles.statusText}>{STATUS_LABEL[ride.status] ?? ride.status}</Text>
        {(ride.status === "requested" || ride.status === "searching") && <ActivityIndicator style={{ marginTop: 8 }} color={colors.violet[600]} />}
      </View>

      <View style={styles.tripCard}>
        <Text style={styles.tripLabel}>Pickup</Text>
        <Text style={styles.tripValue}>{ride.pickup_address}</Text>
        <Text style={styles.tripLabel}>Drop</Text>
        <Text style={styles.tripValue}>{ride.drop_address}</Text>
        <View style={styles.fareRow}>
          <Text style={styles.tripLabel}>Fare</Text>
          <Text style={styles.fareValue}>₹{ride.fare_final ?? ride.fare_estimate}</Text>
        </View>
      </View>

      {driverLocation && (
        <View style={styles.driverCard}>
          <Text style={styles.tripLabel}>Driver location</Text>
          <Text style={styles.tripValue}>{driverLocation.lat.toFixed(5)}, {driverLocation.lng.toFixed(5)}</Text>
        </View>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.cancelBtn} disabled={cancelling} onPress={cancelRide}>
          <Text style={styles.cancelBtnText}>{cancelling ? "Cancelling..." : "Cancel Ride"}</Text>
        </TouchableOpacity>
      )}
      {(ride.status === "completed" || ride.status === "cancelled") && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace("/")}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  wrap: { flex: 1, padding: 20 },
  statusCard: { backgroundColor: colors.violet[700], borderRadius: radius.md, padding: 20, alignItems: "center", marginBottom: 16 },
  statusText: { color: "white", fontWeight: "700", fontSize: 16 },
  tripCard: { backgroundColor: colors.paper[0], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line[200], padding: 16, marginBottom: 16 },
  tripLabel: { fontSize: 11, fontWeight: "700", color: colors.ink[500], textTransform: "uppercase", marginTop: 8 },
  tripValue: { fontSize: 14, color: colors.ink[900], marginTop: 2 },
  fareRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, borderTopWidth: 1, borderTopColor: colors.line[200], paddingTop: 12 },
  fareValue: { fontSize: 18, fontWeight: "700", color: colors.ink[900] },
  driverCard: { backgroundColor: colors.sky[100], borderRadius: radius.md, padding: 16, marginBottom: 16 },
  cancelBtn: { borderWidth: 1, borderColor: "#DC2626", borderRadius: radius.sm, padding: 14, alignItems: "center", marginTop: "auto" },
  cancelBtnText: { color: "#DC2626", fontWeight: "700" },
  doneBtn: { backgroundColor: colors.violet[600], borderRadius: radius.sm, padding: 14, alignItems: "center", marginTop: "auto" },
  doneBtnText: { color: "white", fontWeight: "700" },
});
