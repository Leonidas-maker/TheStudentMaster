import React, { useState, forwardRef } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type CustomInputProps = TextInputProps & {
  label: string;
  value: string;
  onTextChange: (text: string) => void;
  validate?: (text: string) => string;
};

const TextFieldInput = forwardRef<TextInput, CustomInputProps>(
  ({ label, value, onTextChange, validate, ...rest }, ref) => {
    const [error, setError] = useState("");

    const handleValidation = (text: string) => {
      if (validate) {
        const validationError = validate(text);
        setError(validationError);
      } else {
        setError("");
      }
      onTextChange(text);
    };

    return (
      <View className="mb-3">
        <Text
          className={[
            "text-lg mb-1",
            error ? "text-red-500" : "text-black dark:text-white",
          ].join(" ")}
        >
          {label}
        </Text>
        <TextInput
          className={[
            "text-black dark:text-white border p-2 rounded opacity-50 focus:opacity-100 ",
            error
              ? "border-red-500"
              : "border-light_secondary dark:border-dark_secondary",
          ].join(" ")}
          ref={ref}
          value={value}
          onChangeText={handleValidation}
          autoCapitalize="none"
          {...rest}
        />
        {error ? <Text className="text-red-500 mt-1">{error}</Text> : null}
      </View>
    );
  },
);

export default TextFieldInput;
