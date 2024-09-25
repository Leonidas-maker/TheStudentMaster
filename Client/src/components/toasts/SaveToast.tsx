import React, { useState, useEffect } from "react";
import { Animated, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Verwende Ionicons für das Icon

interface ToastProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  message: string;
  duration?: number;
}

const SaveToast: React.FC<ToastProps> = ({
  visible,
  setVisible,
  message,
  duration = 1000,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [progressAnim] = React.useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Progress bar
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }).start(() => {
          // Fade out
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setVisible(false);
            progressAnim.setValue(1);
          });
        });
      });
    }
  }, [visible, duration]);

  const onClose = () => {
    setVisible(false);
    progressAnim.setValue(1);
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: "absolute",
        top: 5,
        right: 5,
        zIndex: 1000,
        width: 300,
        elevation: 5,
      }}
    >
      <View className="bg-white dark:bg-gray-900 rounded flex-1 shadow-sm">
        <View className="flex flex-row items-center p-2">
          {/* Success Icon */}
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="green"
            style={{ marginRight: 10 }}
          />

          {/* Message */}
          <Text className="flex-1 font-bold text-black dark:text-white">
            {message}
          </Text>

          {/* Close Button */}
          <Pressable className="active:opacity-50" onPress={onClose}>
            <Ionicons name="close" size={20} color="#888" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <Animated.View
          style={{
            height: 4,
            backgroundColor: "green",
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
    </Animated.View>
  );
};

export default SaveToast;
