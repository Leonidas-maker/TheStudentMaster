import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DefaultText from "../textFields/DefaultText";

interface DateTimePickerProps {
  mode?: "time" | "datetime" | "date";
  value: Date;
  onConfirm: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  mode = "datetime",
  value,
  onConfirm,
  minimumDate,
  maximumDate,
}) => {
  // State to manage picker visibility.
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Helper function to pad numbers with a leading zero if needed.
  const pad = (num: number) => (num < 10 ? "0" + num : num.toString());

  // Format the date as DD.MM.YYYY.
  const formatDateString = (date: Date) => {
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // getMonth() is zero-based.
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Format the time as HH:MM.
  const formatTimeString = (date: Date) => {
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${hours}:${minutes}`;
  };

  // Format the date/time based on the selected mode.
  const formatDateTime = (date: Date) => {
    if (mode === "date") {
      return formatDateString(date);
    } else if (mode === "time") {
      return formatTimeString(date);
    } else {
      // mode === "datetime"
      return `${formatDateString(date)} ${formatTimeString(date)}`;
    }
  };

  // Opens the date/time picker modal.
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Closes the date/time picker modal.
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Handles the confirmed date/time selection.
  const handleConfirm = (date: Date) => {
    onConfirm(date);
    hideDatePicker();
  };

  return (
    <View className="w-full items-center z-50">
      <TouchableOpacity
        className="justify-center items-center bg-light_secondary dark:bg-dark_secondary w-3/4 m-2 p-4 rounded-xl shadow-lg"
        onPress={showDatePicker}
      >
        <DefaultText text={formatDateTime(value)} />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        is24Hour={true}
        display="inline"
      />
    </View>
  );
};

export default DateTimePicker;
