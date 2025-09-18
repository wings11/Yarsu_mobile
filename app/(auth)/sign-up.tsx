import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Platform,
  BackHandler,
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";
import { COLORS } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";

export default function SignUpScreen() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState("");
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Prevent back navigation from sign-up screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent going back to app/index.tsx from sign-up screen
        console.log("SignUp - Preventing back navigation to index");
        return true; // This prevents going back
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSignUpPress = async () => {
    if (!emailAddress) {
      setError("Email address is required");
      return;
    }
    if (!emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!username) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      console.log("Attempting sign-up:", emailAddress);
      // Use a fallback URL for mobile environments
      const redirectTo =
        Platform.OS === "web"
          ? `${window.location.origin}/auth/callback`
          : "http://localhost:3000/auth/callback"; // Replace with your app's redirect URL
      const { data, error } = await supabase.auth.signUp({
        email: emailAddress,
        password,
        options: {
          data: { username },
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw new Error(error.message);
      console.log("Sign-up successful, magic link sent");
      setMagicLinkSent(true);
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setError(err.message || "An error occurred during sign-up.");
    }
  };

  if (magicLinkSent) {
    return (
      <View
        style={styles.verificationContainer}
        onStartShouldSetResponder={() => true}
      >
        <Animated.Text
          style={[
            styles.verificationTitle,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          Check your email
        </Animated.Text>
        {error ? (
          <Animated.View
            style={[
              styles.errorBox,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError("")}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        <Text style={styles.verificationText}>
          A link has been sent to {emailAddress}. Click the link to complete
          your sign-up.
        </Text>
        <TouchableOpacity
          onPress={() => setMagicLinkSent(false)}
          style={styles.button}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={60}
    >
      <View style={styles.containerbg} onStartShouldSetResponder={() => true}>
        <Animated.Text
          style={[styles.title, { transform: [{ translateX: shakeAnim }] }]}
        >
          Create Account
        </Animated.Text>
        {error ? (
          <Animated.View
            style={[
              styles.errorBox,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError("")}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        <Animated.View
          style={[
            styles.animationslideupconatiner,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="✉ Enter email"
              placeholderTextColor="#9A8478"
              onChangeText={(email) => setEmailAddress(email)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              placeholder="👤 Enter username"
              value={username}
              placeholderTextColor="#9A8478"
              onChangeText={(username) => setUsername(username)}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              value={password}
              placeholder="🔒 Enter password"
              placeholderTextColor="#9A8478"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={onSignUpPress}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>
  );
}
