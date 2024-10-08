// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { forwardRef, useState, useEffect } from "react";
import {
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  useColorScheme,
} from "react-native";

// ~~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { TextFieldInputProps } from "../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
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
      onFocus = () => {},
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
    // ====================================================== //
    // ======================= States ======================= //
    // ====================================================== //
    const [value, setValue] = useState(initialValue);
    const [isLight, setIsLight] = useState(false);

    // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
    // Get the current color scheme
    const colorScheme = useColorScheme();

    // Check if the color scheme is light or dark
    useEffect(() => {
      if (colorScheme === "light") {
        setIsLight(true);
      } else {
        setIsLight(false);
      }
    }, [colorScheme]);

    // Set the placeholder text color based on the color scheme
    const placeholderTextColor = isLight ? "#000000" : "#FFFFFF";

    // ====================================================== //
    // ====================== Functions ===================== //
    // ====================================================== //
    // Handle the change of the input field and set the value
    const handleOnChange = (
      e: NativeSyntheticEvent<TextInputChangeEventData>,
    ) => {
      const newText = e.nativeEvent.text;
      setValue(newText);
      if (onChange) onChange(e);
    };

    // Handle the change of the text input and set the value
    const handleChangeText = (text: string) => {
      setValue(text);
      if (onChangeText) onChangeText(text);
    };

    // ====================================================== //
    // ================== Return component ================== //
    // ====================================================== //
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
