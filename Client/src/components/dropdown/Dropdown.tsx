// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, useColorScheme } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { useTranslation } from "react-i18next";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { DropdownProps } from "../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dropdown: React.FC<DropdownProps> = ({
  setSelected,
  values,
  placeholder,
  search = false,
  notFound,
  save = "value",
  defaultOption = { key: "", value: "" },
}) => {
  const { t } = useTranslation("components");
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

  // compute translation‐aware text
  const placeholderText = placeholder
    ? t(placeholder)
    : t("dropdown.placeholder");
  const notFoundText = notFound ? t(notFound) : t("dropdown.notFound");

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="p-2 m-2 shadow-[rgba(0,0,0,0.5)_0px_1px_4px_0px]">
      <SelectList
        setSelected={setSelected}
        data={values.map(({ key, value }) => ({ key, value }))}
        save={save}
        search={search}
        placeholder={placeholderText}
        boxStyles={boxStyles}
        dropdownStyles={dropdownStyles}
        dropdownTextStyles={dropdownTextStyles}
        inputStyles={inputStyles}
        notFoundText={notFoundText}
        defaultOption={defaultOption}
      />
    </View>
  );
};

export default Dropdown;
