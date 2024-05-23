import React, { forwardRef, useState, useEffect } from "react";
import {
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  useColorScheme,
} from "react-native";
import { TextFieldInputProps } from "../../interfaces/componentInterfaces";

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
