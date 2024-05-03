import React, { forwardRef, useState } from "react";
import { TextInput, TextInputProps, NativeSyntheticEvent, TextInputChangeEventData, TextInputKeyPressEventData } from "react-native";

interface TextFieldInputProps {
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoComplete?: "additional-name" | "address-line1" | "address-line2" | "birthdate-day" |
    "birthdate-full" | "birthdate-month" | "birthdate-year" | "cc-csc" | "cc-exp" | "cc-exp-day" |
    "cc-exp-month" | "cc-exp-year" | "cc-number" | "country" | "current-password" | "email" |
    "family-name" | "given-name" | "honorific-prefix" | "honorific-suffix" | "name" | "new-password" |
    "off" | "one-time-code" | "postal-code" | "street-address" | "tel" | "username" |
    "cc-family-name" | "cc-given-name" | "cc-middle-name" | "cc-name" | "cc-type" | "nickname" |
    "organization" | "organization-title" | "url" | "gender" | "name-family" | "name-given" |
    "name-middle" | "name-middle-initial" | "name-prefix" | "name-suffix" | "password" |
    "password-new" | "postal-address" | "postal-address-country" | "postal-address-extended" |
    "postal-address-extended-postal-code" | "postal-address-locality" | "postal-address-region" |
    "sms-otp" | "tel-country-code" | "tel-device" | "tel-national" | "username-new";
    autoCorrect?: boolean;
    autoFocus?: boolean;
    blurOnSubmit?: boolean;
    defaultValue?: string;
    editable?: boolean;
    enterKeyHint?: "enter" | "done" | "next" | "previous" | "search" | "send";
    keyboardType?: TextInputProps['keyboardType'];
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

const TextFieldInput = forwardRef<TextInput, TextFieldInputProps>(({
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
    isOTP = false
}, ref) => {
    const [value, setValue] = useState(initialValue);

    const handleOnChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const newText = e.nativeEvent.text;
        setValue(newText);
        if (onChange) onChange(e);
    };

    const handleChangeText = (text: string) => {
        setValue(text);
        if (onChangeText) onChangeText(text);
    };

    return (
        <TextInput
            style={isOTP ? { width: 40, height: 40 } : {}}
            className={isOTP ?
                "bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 opacity-50 text-center m-1"
                :
                "bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 opacity-50 p-2"}
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
            secureTextEntry={secureTextEntry}
            selectTextOnFocus={selectTextOnFocus}
            textAlign={textAlign}
            value={value}
        />
    );
});

export default TextFieldInput;