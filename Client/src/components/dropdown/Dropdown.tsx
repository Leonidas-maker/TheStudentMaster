import React from "react";
import { View, ViewStyle } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';

interface DropdownProps {
    setSelected: (value: string) => void;
    values: {
        key: string;
        value: string;
        disabled?: boolean;
    }[];
    placeholder?: string;
    search?: boolean;
    boxStyles?: ViewStyle;
    dropdownStyles?: ViewStyle;
    dropdownTextStyles?: ViewStyle;
    inputStyles?: ViewStyle;
    notFound?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    setSelected,
    values,
    placeholder = "Wählen Sie einen Wert",
    search = false,
    boxStyles = { backgroundColor: "#444444", borderColor: "#444444" },
    dropdownStyles = { backgroundColor: "#444444", borderColor: "#444444" },
    dropdownTextStyles = { color: "#FFFFFF" },
    inputStyles = { color: "#FFFFFF" },
    notFound = "Keine Ergebnisse gefunden"
}) => {
    return (
        <View className="p-2">
            <SelectList
                setSelected={setSelected}
                data={values.map(({ key, value }) => ({ key: key, value: value }))}
                save="value"
                search={search}
                placeholder={placeholder}
                boxStyles={boxStyles}
                dropdownStyles={dropdownStyles}
                dropdownTextStyles={dropdownTextStyles}
                inputStyles={inputStyles}
                notFoundText={notFound}
            />
        </View>
    );
}

export default Dropdown;
