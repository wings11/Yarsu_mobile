import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { replaceOnce } from "@/utils/redirectGuard";
import SafeScreen from "@/components/SafeScreen";
import { COLORS } from "@/constants/colors";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSendCodePress = async () => {
    try {
      const response = await fetch(
        "https://api.clerk.dev/v1/client/sign_in/reset_password/email_code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer <YOUR_API_KEY>", // Replace with your Clerk API key or use a backend proxy
          },
          body: JSON.stringify({ email_address: email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send reset code");
      }

      setSent(true);
      setError("");
    } catch (err) {
      setError("Failed to send reset code. Please try again.");
      console.error(err);
    }
  };

  const onResetPress = async () => {
    try {
      const response = await fetch(
        "https://api.clerk.dev/v1/client/sign_in/reset_password/email_code/attempt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer <YOUR_API_KEY>", // Replace with your Clerk API key or use a backend proxy
          },
          body: JSON.stringify({ code, password: newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Reset failed");
      }

  replaceOnce(router, "/sign-in");
    } catch (err) {
      setError("Reset failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          autoCapitalize="none"
          placeholderTextColor="#9A8478"
        />
        {!sent ? (
          <TouchableOpacity style={styles.button} onPress={onSendCodePress}>
            <Text style={styles.buttonText}>Send Reset Code</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Code"
              onChangeText={setCode}
              keyboardType="numeric"
              placeholderTextColor="#9A8478"
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              onChangeText={setNewPassword}
              secureTextEntry
              placeholderTextColor="#9A8478"
            />
            <TouchableOpacity style={styles.button} onPress={onResetPress}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Avenir Next",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    fontSize: 16,
    color: COLORS.shadow,
    fontFamily: "Avenir Next",
  },
  button: {
    padding: 15,
    backgroundColor: COLORS.text,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Avenir Next",
  },
  errorText: {
    color: COLORS.expense,
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Avenir Next",
  },
});
