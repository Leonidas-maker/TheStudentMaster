// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import TextFieldInput from "../../textInputs/TextFieldInput";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { OTPInputProps } from "../../../interfaces/AuthInterfaces";

// TODO Implement paste functionality
// TODO Block non-numeric characters
// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const OTPInput: React.FC<OTPInputProps> = ({ otpLength = 6, onOtpChange }) => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));

  // ====================================================== //
  // ====================== Variables ===================== //
  // ====================================================== //
  const inputRefs = useRef<(TextInput | null)[]>(Array(otpLength).fill(null));

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Update parent component with the new OTP
  useEffect(() => {
    const otpString = otp.join("");
    onOtpChange(otpString);
  }, [otp, otpLength, onOtpChange]);

  // Focus on the next input field when the current one is filled
  useEffect(() => {
    otp.forEach((value, index) => {
      if (value && index < otpLength - 1 && otp[index + 1].length === 0) {
        inputRefs.current[index + 1]?.focus();
      }
    });
  }, [otp, otpLength]);

  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  // Handles the change of the OTP input fields and checks if the input is valid
  const handleOtpChange = (text: string, index: number) => {
    const newText = text.replace(/[^0-9]/g, "");
    if (newText !== text) {
      const lastValidValue = otp[index] || "";
      const newOtp = [...otp];
      newOtp[index] = lastValidValue;
      setOtp(newOtp);
    } else {
      const newOtp = [...otp];
      newOtp[index] = newText;
      setOtp(newOtp);
    }
  };

  // Handles the key press events for the OTP input fields (Backspace, ArrowRight, ArrowLeft)
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    switch (e.nativeEvent.key) {
      case "Backspace":
        if (otp[index].length === 0 && index > 0) {
          e.preventDefault();
          setTimeout(() => {
            inputRefs.current[index - 1]?.focus();
            handleOtpChange("", index - 1);
          }, 0);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (index < otpLength - 1 && isFieldEditable(index + 1)) {
          inputRefs.current[index + 1]?.focus();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (index > 0 && isFieldEditable(index - 1)) {
          inputRefs.current[index - 1]?.focus();
        }
        break;
      default:
        break;
    }
  };

  // Checks if the current field is editable
  const isFieldEditable = (index: number) => {
    return index === 0 || otp.slice(0, index).every((val) => val.length === 1);
  };

  // Focuses on the input field
  const handleInputFocus = (index: number) => {
    setTimeout(() => {
      inputRefs.current[index]?.focus();
    }, 100);
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="justify-center items-center flex-row flex-wrap">
      {Array.from({ length: otpLength }).map((_, index) => (
        <TextFieldInput
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          value={otp[index]}
          onChangeText={(text) => handleOtpChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleInputFocus(index)}
          keyboardType="numeric"
          maxLength={1}
          editable={isFieldEditable(index)}
          isOTP={true}
          placeholder=""
        />
      ))}
    </View>
  );
};

export default OTPInput;
