import React from "react";
import Toast, { BaseToast, ToastConfig } from "react-native-toast-message";
import { useColorScheme } from "react-native";
import {
  darkToastErrorStyle,
  darkToastSuccessStyle,
  darkToastInfoStyle,
  darkToastWarningStyle,
  lightToastErrorStyle,
  lightToastSuccessStyle,
  lightToastInfoStyle,
  lightToastWarningStyle,
} from "./ToastStyles";

// Dark theme Toast configuration with custom styles for each type
const darkToastConfig: ToastConfig = {
  // Error toast configuration
  error: (props) => (
    <BaseToast
      {...props}
      style={[darkToastErrorStyle.base, darkToastErrorStyle.leadingBorder]}
      contentContainerStyle={darkToastErrorStyle.contentContainer}
      text1Style={darkToastErrorStyle.text1}
      text2Style={darkToastErrorStyle.text2}
    />
  ),
  // Success toast configuration
  success: (props) => (
    <BaseToast
      {...props}
      style={[darkToastSuccessStyle.base, darkToastSuccessStyle.leadingBorder]}
      contentContainerStyle={darkToastSuccessStyle.contentContainer}
      text1Style={darkToastSuccessStyle.text1}
      text2Style={darkToastSuccessStyle.text2}
    />
  ),
  // Info toast configuration
  info: (props) => (
    <BaseToast
      {...props}
      style={[darkToastInfoStyle.base, darkToastInfoStyle.leadingBorder]}
      contentContainerStyle={darkToastInfoStyle.contentContainer}
      text1Style={darkToastInfoStyle.text1}
      text2Style={darkToastInfoStyle.text2}
    />
  ),
  // Warning toast configuration with a boolean variable indicating a warning toast
  warning: (props) => {
    // Define a boolean variable indicating that this is a warning toast
    const isWarningToast: boolean = true;
    return (
      <BaseToast
        {...props}
        style={[
          darkToastWarningStyle.base,
          darkToastWarningStyle.leadingBorder,
        ]}
        contentContainerStyle={darkToastWarningStyle.contentContainer}
        text1Style={darkToastWarningStyle.text1}
        text2Style={darkToastWarningStyle.text2}
      />
    );
  },
};

// Light theme Toast configuration with custom styles for each type
const lightToastConfig: ToastConfig = {
  // Error toast configuration
  error: (props) => (
    <BaseToast
      {...props}
      style={[lightToastErrorStyle.base, lightToastErrorStyle.leadingBorder]}
      contentContainerStyle={lightToastErrorStyle.contentContainer}
      text1Style={lightToastErrorStyle.text1}
      text2Style={lightToastErrorStyle.text2}
    />
  ),
  // Success toast configuration
  success: (props) => (
    <BaseToast
      {...props}
      style={[
        lightToastSuccessStyle.base,
        lightToastSuccessStyle.leadingBorder,
      ]}
      contentContainerStyle={lightToastSuccessStyle.contentContainer}
      text1Style={lightToastSuccessStyle.text1}
      text2Style={lightToastSuccessStyle.text2}
    />
  ),
  // Info toast configuration
  info: (props) => (
    <BaseToast
      {...props}
      style={[lightToastInfoStyle.base, lightToastInfoStyle.leadingBorder]}
      contentContainerStyle={lightToastInfoStyle.contentContainer}
      text1Style={lightToastInfoStyle.text1}
      text2Style={lightToastInfoStyle.text2}
    />
  ),
  // Warning toast configuration
  warning: (props) => {
    return (
      <BaseToast
        {...props}
        style={[
          lightToastWarningStyle.base,
          lightToastWarningStyle.leadingBorder,
        ]}
        contentContainerStyle={lightToastWarningStyle.contentContainer}
        text1Style={lightToastWarningStyle.text1}
        text2Style={lightToastWarningStyle.text2}
      />
    );
  },
};

const DefaultToast: React.FC = () => {
  // Get the current color scheme ('dark' or 'light')
  const colorScheme = useColorScheme();
  // Use the dark configuration if the current theme is dark (extend with a light config if desired)
  const config = colorScheme === "dark" ? darkToastConfig : lightToastConfig;
  return <Toast config={config} />;
};

export default DefaultToast;
