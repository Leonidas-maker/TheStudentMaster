import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  useColorScheme,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "../../../../components/picker/DateTimePicker";
import { fetchFreeRooms } from "../../../../services/freeRooms/freeRoomsService";
import DefaultButton from "../../../../components/buttons/DefaultButton";
import Dropdown from "../../../../components/dropdown/Dropdown";
import * as Progress from "react-native-progress";
import {
  fetchCalendars,
  getSelectedUniversity,
} from "../../../../services/calendarService";
import Toast from "react-native-toast-message";
import DefaultToast from "../../../../components/defaultToast/DefaultToast";

// Interfaces
import { CalendarProps } from "../../../../interfaces/calendarInterfaces";
import Subheading from "../../../../components/textFields/Subheading";

// Room props
interface Room {
  room_name: string;
  last_booked: string | null;
  next_booked: string | null;
}

// Props for the header component
interface HeaderProps {
  placeholderUniversity: string;
  dropdownValues: { key: string; value: string }[];
  onUniversitySelect: (value: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSearchPress: () => void;
  query: string;
  onQueryChange: (text: string) => void;
  t: (key: string) => string;
  searching: boolean;
}

const ListHeader: React.FC<HeaderProps> = React.memo(
  ({
    placeholderUniversity,
    dropdownValues,
    onUniversitySelect,
    selectedDate,
    onDateChange,
    onSearchPress,
    query,
    onQueryChange,
    t,
    searching,
  }) => {
    const colorScheme = useColorScheme();
    const iconColor = colorScheme !== "light" ? "#FFFFFF" : "#000000";
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <View className="px-4 pt-4 bg-light_primary dark:bg-dark_primary">
        <View className="items-center">
          <Subheading text={t("subheading_text")} />
          <Dropdown
            setSelected={onUniversitySelect}
            values={dropdownValues}
            placeholder={placeholderUniversity}
          />

          <DateTimePicker
            mode="datetime"
            value={selectedDate}
            onConfirm={onDateChange}
            minimumDate={today}
          />

          <DefaultButton
            onPress={onSearchPress}
            text={t("search_btn")}
            disabled={searching}
          />
        </View>

        <View className="mt-2 mb-3 flex-row items-center bg-light_secondary dark:bg-dark_secondary rounded-lg px-3 py-2 shadow">
          <Icon name="search" size={20} color={iconColor} />
          <TextInput
            className="ml-2 flex-1 text-black dark:text-white"
            placeholder={t("search_rooms_placeholder")}
            placeholderTextColor={
              colorScheme === "light" ? "#000000" : "#FFFFFF"
            }
            value={query}
            onChangeText={onQueryChange}
          />
        </View>
      </View>
    );
  },
);

const FreeRooms: React.FC = () => {
  const { t } = useTranslation("freeRooms");
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme !== "light" ? "#FFFFFF" : "#000000";

  const [calendars, setCalendars] = useState<CalendarProps[]>([]);
  const [placeholderUniversity, setPlaceholderUniversity] = useState(
    t("selectUniversity"),
  );
  const [missingUniversity, setMissingUniversity] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    name: string;
    uuid: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [freeRooms, setFreeRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState<string>("");
  const [searched, setSearched] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  // Header info button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() =>
            Alert.alert(t("info_title"), t("info_message"), [{ text: "OK" }])
          }
        >
          <Icon
            name="info"
            size={28}
            color={iconColor}
            style={{ marginRight: 16 }}
          />
        </Pressable>
      ),
    });
  }, [navigation, iconColor]);

  // Initial fetch of calendars & saved university
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setProgress(0.3);
      try {
        const cals = await fetchCalendars();
        if (cals.length) setCalendars(cals);

        setProgress(0.6);
        await getSelectedUniversity(
          setSelectedUniversity,
          setPlaceholderUniversity,
          setMissingUniversity,
        );

        setProgress(1);
        setLoading(false);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: t("connection_error_text1"),
          text2: t("connection_error_text2"),
        });
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter rooms when query changes
  useEffect(() => {
    if (!query) {
      setFilteredRooms(freeRooms);
    } else {
      const q = query.toLowerCase();
      setFilteredRooms(
        freeRooms.filter((r) => r.room_name.toLowerCase().includes(q)),
      );
    }
  }, [query, freeRooms]);

  // Memoize dropdown values
  const dropdownUniversityValues = useMemo(
    () =>
      calendars.map((c) => ({
        key: c.university_uuid,
        value: c.university_name,
      })),
    [calendars],
  );

  const handleUniversitySelect = (value: string) => {
    const uni = calendars.find((c) => c.university_name === value);
    if (uni)
      setSelectedUniversity({
        name: uni.university_name,
        uuid: uni.university_uuid,
      });
  };

  // Perform search
  const handleSearchPress = async () => {
    const universityUUID = selectedUniversity ? selectedUniversity.uuid : "";
    if (!universityUUID) {
      Toast.show({
        type: "warning",
        text1: t("university_error_title"),
        text2: t("university_error_message"),
      });
      return;
    }
    setSearching(true);
    try {
      const endDate = new Date(selectedDate);
      endDate.setSeconds(endDate.getSeconds() + 1);
      const rooms = await fetchFreeRooms(universityUUID, selectedDate, endDate);
      setFreeRooms(rooms);
      setFilteredRooms(rooms);
      setQuery("");
      setSearched(true);
      if (!rooms.length)
        Toast.show({
          type: "warning",
          text1: t("no_rooms_title"),
          text2: t("no_rooms_message"),
        });
    } catch {
      Toast.show({
        type: "error",
        text1: t("error_title"),
        text2: t("error_message"),
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light_primary dark:bg-dark_primary">
      {loading && <Progress.Bar progress={progress} width={null} />}
      <View className="z-50">
        <DefaultToast />
      </View>
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.room_name}
        ListHeaderComponent={
          <ListHeader
            placeholderUniversity={placeholderUniversity}
            dropdownValues={dropdownUniversityValues}
            onUniversitySelect={handleUniversitySelect}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSearchPress={handleSearchPress}
            query={query}
            onQueryChange={setQuery}
            t={t}
            searching={searching}
          />
        }
        ListEmptyComponent={() =>
          searched ? (
            <Text className="text-center text-black dark:text-white mt-6">
              {t("no_rooms_found")}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable className="mx-4 mb-3 bg-light_secondary dark:bg-dark_secondary rounded-lg p-6 shadow-lg">
            {/* Room */}
            <View className="flex-row items-center mb-3">
              <Icon name="meeting-room" size={20} color={iconColor} />
              <Text className="ml-2 text-xl font-bold dark:text-white text-black">
                {item.room_name}
              </Text>
            </View>

            {/* Divider */}
            <View className="h-px dark:bg-dark_primary bg-light_primary mb-3" />

            {/* Details */}
            <View className="space-y-3">
              {item.last_booked && (
                <View className="flex-row items-center mb-1">
                  <Icon name="schedule" size={16} color={iconColor} />
                  <Text className="ml-2 flex-1 uppercase text-xs dark:text-white text-black">
                    {t("last_booked")}
                  </Text>
                  <Text className="dark:text-white text-black font-semibold text-sm">
                    {new Date(item.last_booked).toLocaleString("de-DE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>
              )}
              {item.next_booked && (
                <View className="flex-row items-center">
                  <Icon name="schedule" size={16} color={iconColor} />
                  <Text className="ml-2 flex-1 uppercase text-xs dark:text-white text-black">
                    {t("next_booked")}
                  </Text>
                  <Text className="dark:text-white text-black font-semibold text-sm">
                    {new Date(item.next_booked).toLocaleString("de-DE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

export default FreeRooms;
