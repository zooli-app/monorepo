import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth/AuthProvider";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper[0] },
          headerTintColor: colors.ink[900],
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.paper[50] },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Zooli" }} />
        <Stack.Screen name="login" options={{ title: "Sign in", presentation: "modal" }} />
        <Stack.Screen name="stores/[category]" options={{ title: "Nearby" }} />
        <Stack.Screen name="store/[storeId]" options={{ title: "Menu" }} />
        <Stack.Screen name="cart" options={{ title: "Your Cart" }} />
        <Stack.Screen name="account" options={{ title: "Account" }} />
        <Stack.Screen name="rides/book" options={{ title: "Book a Ride" }} />
        <Stack.Screen name="rides/[rideId]" options={{ title: "Your Ride" }} />
      </Stack>
    </AuthProvider>
  );
}
