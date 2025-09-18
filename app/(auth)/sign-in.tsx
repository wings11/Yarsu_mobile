import { router, useFocusEffect } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  BackHandler,
} from "react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styles } from "@/assets/styles/auth.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";
import { getUserRole, isAdminRole } from "@/services/authService";
import { storeItem } from "@/utils/storage";
import { getItem } from "@/utils/storage";
import { api, API_BASE_URL } from "@/libs/api";
import { Platform } from "react-native";

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Prevent back navigation from sign-in screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent going back to app/index.tsx from sign-in screen
        console.log("SignIn - Preventing back navigation to index");
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
    if (!supabase) {
      setError("Application error: Supabase client not initialized");
    }

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

  const onSignInPress = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        console.log("SignIn - Successful, user ID:", data.session.user.id);
        await storeItem("authToken", data.session.access_token || "");
        await storeItem("userId", data.session.user.id || "");

          // Attempt to register any stored push token now that auth token is persisted
          (async () => {
            try {
              const pushToken = await getItem("pushToken");
              if (pushToken && API_BASE_URL) {
                console.log("SignIn - registering stored push token with backend");
                try {
                  const resp = await api.post('/noti/push/register', { token: pushToken, platform: Platform.OS });
                  console.log('SignIn - register response:', resp?.status, resp?.data);
                } catch (err: any) {
                  console.error('SignIn - register error:', err?.response?.status, err?.response?.data || err?.message || err);
                }
              } else if (pushToken) {
                console.warn('SignIn - API_BASE_URL not configured; cannot register push token');
              } else {
                console.log('SignIn - no stored push token to register');
              }
            } catch (err) {
              console.error('SignIn - error registering stored push token:', err);
            }
          })();

        const user = await getUserRole();
        console.log("SignIn - User role:", user.role);

        // Navigate to home screen and clear the navigation stack
        // This prevents going back to auth screens
        const targetRoute = isAdminRole(user.role)
          ? "/(admin)/dashboard"
          : "/(root)/home";
        router.dismissAll();
        router.replace(targetRoute);
      } else {
        setError("Sign-in failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("SignIn - Error:", err.message);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={styles.containerbg} onStartShouldSetResponder={() => true}>
        <Animated.Text
          style={[styles.title, { transform: [{ translateX: shakeAnim }] }]}
        >
          Log In
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
              value={email}
              placeholder="✉ Enter email"
              placeholderTextColor="#9A8478"
              onChangeText={(email) => setEmail(email)}
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
            style={styles.forgotPasswordLink}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.6 }]}
            onPress={onSignInPress}
            disabled={isLoading}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>
  );
}
