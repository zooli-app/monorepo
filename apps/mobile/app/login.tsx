import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/auth/AuthProvider";
import { colors, radius } from "../lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true); setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>{mode === "login" ? "Welcome back" : "Create your account"}</Text>
        <Text style={styles.sub}>{mode === "login" ? "Sign in to order and track deliveries" : "A few details and you're set"}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {mode === "signup" && (
          <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
        )}
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.submit} disabled={loading} onPress={submit}>
          <Text style={styles.submitText}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode((m) => (m === "login" ? "signup" : "login"))}>
          <Text style={styles.switchText}>{mode === "login" ? "New to Zooli? Create an account" : "Already have an account? Sign in"}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper[0], padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink[900] },
  sub: { fontSize: 14, color: colors.ink[500], marginTop: 4, marginBottom: 20 },
  error: { backgroundColor: "#FEF2F2", color: "#B91C1C", fontSize: 13, padding: 10, borderRadius: radius.sm, marginBottom: 14 },
  input: { borderWidth: 1, borderColor: colors.line[200], backgroundColor: colors.paper[50], borderRadius: radius.sm, padding: 14, fontSize: 15, marginBottom: 12 },
  submit: { backgroundColor: colors.violet[600], borderRadius: radius.sm, padding: 15, alignItems: "center", marginTop: 4 },
  submitText: { color: "white", fontWeight: "700", fontSize: 15 },
  switchText: { color: colors.violet[600], fontWeight: "600", fontSize: 13, textAlign: "center", marginTop: 16 },
});
