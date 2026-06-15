import React, { useState, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';
import { getPlatformInfo } from '../../utils/platform';

const SUBSCRIPTION_KEY = '@chart2ai_email_subscribed';

interface FormData {
  email: string;
}

interface EmailSubscriptionFormProps {
  onSubscriptionSuccess?: () => void;
}

export const EmailSubscriptionForm: React.FC<EmailSubscriptionFormProps> = ({
  onSubscriptionSuccess,
}) => {
  const theme = useAppTheme();
  const platformInfo = getPlatformInfo();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showSuccessFeedback, setShowSuccessFeedback] =
    useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      setIsSubscribed(subscribed === 'true');
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Determine the base URL for the function
      const baseUrl =
        platformInfo.isWeb && typeof window !== 'undefined'
          ? window.location.origin
          : 'https://app.chart2ai.com';

      const response = await fetch(`${baseUrl}/api/subscribe-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.toLowerCase().trim(),
        }),
      });

      const result = await response.json();
      // const response = { ok: true };
      // const result = { success: true, error: '', message: '' };

      if (response.ok && result.success) {
        // Store subscription status
        await AsyncStorage.setItem(SUBSCRIPTION_KEY, 'true');
        setSuccess(result.message || 'Successfully subscribed!');
        setShowSuccessFeedback(true);
        reset();

        // Animate success message
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccessFeedback(false);
          setIsSubscribed(true);
          onSubscriptionSuccess?.();
        });
      } else {
        setError(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if already subscribed (but show success feedback first)
  if (isSubscribed && !showSuccessFeedback) {
    return null;
  }

  // Show success feedback animation
  if (showSuccessFeedback) {
    return (
      <Animated.View style={{ marginVertical: 8, opacity: fadeAnim }}>
        <Text
          variant="bodyMedium"
          style={{
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'center',
            paddingVertical: 8,
            color: theme.colors.primary,
          }}
        >
          ✓ {success}
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={{ marginVertical: 8 }}>
      <Text
        variant="bodyMedium"
        style={{
          marginBottom: 8,
          fontSize: 14,
          color: theme.colors.onSurface,
        }}
      >
        Stay updated with Chart2AI news and features
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: platformInfo.isNative ? 16 : 0,
        }}
      >
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={handleSubmit(onSubmit)}
              returnKeyType="go"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{ flex: 1, fontSize: 14 }}
              contentStyle={{ fontSize: 14, paddingVertical: 8 }}
              outlineStyle={
                platformInfo.isWeb ? ({ outline: 'none' } as any) : undefined
              }
              error={!!errors.email}
              disabled={isLoading}
            />
          )}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={{ alignSelf: 'flex-start' }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Subscribe
        </Button>
      </View>

      {errors.email ? (
        <HelperText type="error" visible={!!errors.email}>
          {errors.email.message}
        </HelperText>
      ) : null}

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      {success ? (
        <HelperText
          type="info"
          visible={!!success}
          style={{ color: theme.colors.primary }}
        >
          {success}
        </HelperText>
      ) : null}
    </View>
  );
};

export default EmailSubscriptionForm;
