import React, { forwardRef, useState, useEffect } from "react";
import {
  TextInput,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  TextInputKeyPressEventData,
  useColorScheme,
} from "react-native";

interface TextFieldInputProps {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?:
  | "additional-name"
  | "address-line1"
  | "address-line2"
  | "birthdate-day"
  | "birthdate-full"
  | "birthdate-month"
  | "birthdate-year"
  | "cc-csc"
  | "cc-exp"
  | "cc-exp-day"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-number"
  | "country"
  | "current-password"
  | "email"
  | "family-name"
  | "given-name"
  | "honorific-prefix"
  | "honorific-suffix"
  | "name"
  | "new-password"
  | "off"
  | "one-time-code"
  | "postal-code"
  | "street-address"
  | "tel"
  | "username"
  | "cc-family-name"
  | "cc-given-name"
  | "cc-middle-name"
  | "cc-name"
  | "cc-type"
  | "nickname"
  | "organization"
  | "organization-title"
  | "url"
  | "gender"
  | "name-family"
  | "name-given"
  | "name-middle"
  | "name-middle-initial"
  | "name-prefix"
  | "name-suffix"
  | "password"
  | "password-new"
  | "postal-address"
  | "postal-address-country"
  | "postal-address-extended"
  | "postal-address-extended-postal-code"
  | "postal-address-locality"
  | "postal-address-region"
  | "sms-otp"
  | "tel-country-code"
  | "tel-device"
  | "tel-national"
  | "username-new";
  autoCorrect?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  defaultValue?: string;
  editable?: boolean;
  enterKeyHint?: "enter" | "done" | "next" | "previous" | "search" | "send";
  keyboardType?: TextInputProps["keyboardType"];
  maxLength?: number;
  multiline?: boolean;
  onChange?: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  selectTextOnFocus?: boolean;
  textAlign?: "left" | "center" | "right";
  value?: string;
  isOTP?: boolean;
}

const TextFieldInput = forwardRef<TextInput, TextFieldInputProps>(
  (
    {
      autoCapitalize = "sentences",
      autoComplete = "off",
      autoCorrect = true,
      autoFocus = false,
      blurOnSubmit = true,
      defaultValue = "",
      editable = true,
      enterKeyHint = "done",
      keyboardType = "default",
      maxLength = undefined,
      multiline = false,
      onChange,
      onChangeText,
      onFocus = () => { },
      onKeyPress,
      placeholder = "Eingabe",
      secureTextEntry = false,
      selectTextOnFocus = false,
      textAlign = "left",
      value: initialValue = "",
      isOTP = false,
    },
    ref,
  ) => {
    const [value, setValue] = useState(initialValue);
    const colorScheme = useColorScheme();
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
      if (colorScheme === "light") {
        setIsLight(true);
      } else {
        setIsLight(false);
      }
    }, [colorScheme]);

    const handleOnChange = (
      e: NativeSyntheticEvent<TextInputChangeEventData>,
    ) => {
      const newText = e.nativeEvent.text;
      setValue(newText);
      if (onChange) onChange(e);
    };

    const handleChangeText = (text: string) => {
      setValue(text);
      if (onChangeText) onChangeText(text);
    };

    const placeholderTextColor = isLight ? "#000000" : "#FFFFFF";

    return (
      <TextInput
        style={isOTP ? { width: 40, height: 40 } : {}}
        className={
          isOTP
            ? "bg-light_secondary dark:bg-dark_secondary text-black dark:text-white border-2 border-light_secondary dark:border-dark_secondary focus:border-light_action dark:focus:border-dark_action rounded-xl opacity-75 focus:opacity-100 text-center m-2"
            : "bg-light_secondary dark:bg-dark_secondary text-black dark:text-white border-2 border-light_secondary dark:border-dark_secondary focus:border-light_action dark:focus:border-dark_action w-3/4 h-10 opacity-75 focus:opacity-100 rounded-xl p-2 m-2"
        }
        ref={ref}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        blurOnSubmit={blurOnSubmit}
        defaultValue={defaultValue}
        editable={editable}
        enterKeyHint={enterKeyHint}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChange={handleOnChange}
        onChangeText={handleChangeText}
        onFocus={onFocus}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        selectTextOnFocus={selectTextOnFocus}
        textAlign={textAlign}
        value={value}
      />
    );
  },
);

export default TextFieldInput;
