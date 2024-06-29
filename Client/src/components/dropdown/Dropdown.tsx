// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, useColorScheme } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { DropdownProps } from "../../interfaces/ComponentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dropdown: React.FC<DropdownProps> = ({
  setSelected,
  values,
  placeholder = "Wählen Sie einen Wert",
  search = false,
  notFound = "Keine Internetverbindung oder keine Daten vorhanden",
  save = "value",
}) => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
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

  // Styles based on color scheme
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

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="p-2 m-2 shadow-[rgba(0,0,0,0.5)_0px_1px_4px_0px]">
      <SelectList
        setSelected={setSelected}
        data={values.map(({ key, value }) => ({ key: key, value: value }))}
        save={save}
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
