import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  TextInput,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  useNavigation,
  DrawerActions,
  useFocusEffect,
} from "@react-navigation/native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Aktivieren des relativeTime Plugins
dayjs.extend(relativeTime);

interface SearchTimeHeaderProps {
  folderName: string;
  lastUpdated: number;
  searchString: string;
  setSearchString: (search: string) => void;
}

const SearchTimeHeader: React.FC<SearchTimeHeaderProps> = ({
  folderName,
  lastUpdated = "None",
  searchString,
  setSearchString,
}) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [strLastUpdated, setStrLastUpdated] = useState("None");

  const searchInputRef = useRef<TextInput>(null);

  // ====================================================== //
  // ===================== Callbacks; ===================== //
  // ====================================================== //

  // Handle search button press and auto-focus
  const handleSearchPress = () => {
    setIsSearchVisible(true);
    setTimeout(() => {
      // Focus on the TextInput after rendering
      searchInputRef.current?.focus();
    }, 0);
  };

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //

  useEffect(() => {
    // Update Time immediately on first render
    const lastUpdatedDate = new Date(lastUpdated);
    setStrLastUpdated(dayjs(lastUpdatedDate).fromNow());

    // Update Time every 10 seconds
    const interval = setInterval(() => {
      setStrLastUpdated(dayjs(lastUpdatedDate).fromNow());
    }, 10000);

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // ====================================================== //
  // ==================== FocusEffects ==================== //
  // ====================================================== //

  // Handle back button press (Android) and screen unfocus (iOS and Android)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isSearchVisible) {
          setIsSearchVisible(false);
          setSearchString("");
          return true; // Prevent default back behavior
        } else {
          return false; // Allow default back behavior
        }
      };

      // Android BackHandler for hardware back button
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove(); // Cleanup event listener
    }, [isSearchVisible])
  );

  // Handle screen focus change (iOS swipe or Android back press)
  useFocusEffect(
    React.useCallback(() => {
      // Close search input when navigating away
      return () => {
        if (isSearchVisible) {
          setIsSearchVisible(false);
          setSearchString("");
        }
      };
    }, [isSearchVisible])
  );

  return (
    <View className="flex-row items-center justify-between p-4 bg-light_primary dark:bg-dark_primary">
      {isSearchVisible ? (
        // Search Input Field
        <TextInput
          ref={searchInputRef}
          value={searchString}
          onChangeText={setSearchString}
          placeholder="Search..."
          className="flex-1 bg-gray-300 dark:bg-gray-800 rounded-md text-black dark:text-white  p-2 mr-2"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "darkgray"}
        />
      ) : (
        <>
          {/* Menu Icon */}
          <View className="flex-row items-center">
            <Pressable
              className="active:opacity-50"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Icon
                name="menu"
                size={30}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </Pressable>
            <View className="ml-4">
              <Text className="text-xl font-semibold text-black dark:text-white">
                {folderName}
              </Text>
              <Text className="text-gray-500 text-sm">{strLastUpdated}</Text>
            </View>
          </View>
        </>
      )}

      {/* Search Icon */}
      <Pressable
        className="active:opacity-50"
        onPress={() => handleSearchPress()}
      >
        <Icon
          name="magnify"
          size={30}
          color={colorScheme === "dark" ? "white" : "black"}
        />
      </Pressable>
    </View>
  );
};

export default SearchTimeHeader;
