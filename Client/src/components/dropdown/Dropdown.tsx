import React, { useState, useEffect } from "react";
import { View, ViewStyle, useColorScheme } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

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
  notFound = "Keine Ergebnisse gefunden",
}) => {
  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const boxStyles = isLight
    ? { backgroundColor: "#ACBED8", borderColor: "#ACBED8" }
    : { backgroundColor: "#56718A", borderColor: "#56718A" };
  const dropdownStyles = isLight
    ? { backgroundColor: "#ACBED8", borderColor: "#ACBED8" }
    : { backgroundColor: "#56718A", borderColor: "#56718A" };
  const dropdownTextStyles = isLight
    ? { color: "#000000" }
    : { color: "#FFFFFF" };
  const inputStyles = isLight ? { color: "#000000" } : { color: "#FFFFFF" };

  return (
    <View className="p-2 m-2 shadow-[rgba(0,0,0,0.5)_0px_1px_4px_0px]">
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
};

export default Dropdown;
