import React, { useState, useEffect } from "react";
import { View, Dimensions } from "react-native";
import {
  ScrollView,
  Text,
  useColorScheme,
  ActivityIndicator,
  Pressable,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { WebView } from "react-native-webview";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmailDetailsScreenProps } from "../../types/emailScreenTypes";
import { Email } from "../../interfaces/email";

const EmailDetailsScreen: React.FC<EmailDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { emailCompressed, emailDetailsRef, changeSelectedEmail } =
    route.params;
  const [email, setEmail] = useState<Email | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const colorScheme = useColorScheme();

  // Inject both the meta viewport tag and the dynamic styles for dark/light mode
  const injectedJavaScript = `
    // Add the meta viewport tag for responsiveness
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    document.getElementsByTagName('head')[0].appendChild(meta);

    // If dark mode is enabled, invert all colors
    if ('${colorScheme}' === 'dark') {
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    }
  `;

  const preCheckEmail = () => {
    // Mark the email as read if it hasn't been already
    if (!emailCompressed.flags.includes("\\Seen")) {
      changeSelectedEmail.current = {
        ...emailCompressed,
        ...emailDetailsRef.current[emailCompressed.message_id],
      };
      console.log("Email marked as read");
      //changeSelectedEmail.current.flags.push("+Seen");
    }
  };

  useEffect(() => {
    console.log("Email Details Screen");
    if (emailDetailsRef.current[emailCompressed.message_id].body) {
      preCheckEmail();
      setEmail({
        ...emailDetailsRef.current[emailCompressed.message_id],
        ...emailCompressed,
      });
    } else {
      const intervalId = setInterval(() => {
        if (emailDetailsRef.current[emailCompressed.message_id].body) {
          console.log("Email loadeds");

          preCheckEmail();

          // Set the email data
          setEmail({
            ...emailDetailsRef.current[emailCompressed.message_id],
            ...emailCompressed,
          });
          clearInterval(intervalId); // Clear the interval
        }
      }, 500);

      // Clear the interval on unmount
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    if (email) {
      setIsStarred(email.flags.includes("\\Flagged"));
    }
  }, [email]);

  // Define custom HTML styles for light and dark mode
  const tagsStyles = {
    body: {
      color: colorScheme === "dark" ? "white" : "black", // Set the text color based on the theme
    },
    p: {
      color: colorScheme === "dark" ? "white" : "black", // Apply to paragraph text
    },
    // Add other tags here if needed
  };

  const getFormattedDate = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toDateString();
  };

  if (!email || !email.body) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <ActivityIndicator size="large" color="#9ca3af" />
      </View>
    );
  }

  const backgroundColor = colorScheme === "dark" ? "#1E1E24" : "#E8EBF7";
  const iconColor = colorScheme === "dark" ? "white" : "black";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4">
          {/* Back Button */}
          <Pressable
            className="active:opacity-50"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={30} color={iconColor} />
          </Pressable>

          {/* E-Mail Subject */}
          <Text
            className="text-lg font-semibold text-black dark:text-white flex-1 mx-4"
            numberOfLines={1}
          >
            {email.subject}
          </Text>

          {/* Icons */}
          <View className="flex-row items-center">
            <Pressable
              className="mr-2 active:opacity-50"
              onPress={() => console.log("Delete Email")}
            >
              <Icon name="delete-outline" size={30} color={iconColor} />
            </Pressable>
            <Pressable
              className="mr-2 active:opacity-50"
              onPress={() => console.log("Star Email")}
            >
              {isStarred ? (
                <Icon name="star" size={30} color={iconColor} />
              ) : (
                <Icon name="star-outline" size={30} color={iconColor} />
              )}
            </Pressable>
            <Pressable
              className="active:opacity-50"
              onPress={() => console.log("Open Menu")}
            >
              <Icon name="dots-vertical" size={30} color={iconColor} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="bg-zinc-200 dark:bg-zinc-900 flex-1"
        >
          {/* E-Mail Sender */}
          <View className="flex-row items-center p-4">
            {/* Avatar */}
            <View className="w-12 h-12 bg-purple-500 rounded-full justify-center items-center">
              <Text className="text-white text-lg font-bold">
                {email.from_.name?.charAt(0) || "?"}
              </Text>
            </View>

            {/* Name and Date */}
            <View className="ml-4">
              <Text className="text-lg text-black dark:text-white font-semibold">
                {email.from_.name || email.from_.email}
              </Text>
              <Text className="text-gray-500 text-sm">
                {getFormattedDate(email.date)}
              </Text>

              {/* E-Mail Recipients */}
              {isDetailsVisible && (
                <View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600 w-10">To: </Text>
                    <Text className=" text-gray-600 flex-grow">
                      {email.to.map((recipient) => recipient.email).join(",\n")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-gray-600 w-10">Cc: </Text>
                    <Text className="text-gray-600 flex-grow">
                      {email.cc
                        ?.map((recipient) => recipient.email)
                        .join(",\n") || "None"}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-gray-600 w-10">Bcc: </Text>
                    <Text className="text-gray-600 flex-grow">
                      {email.bcc
                        ?.map((recipient) => recipient.email)
                        .join(",\n") || "None"}
                    </Text>
                  </View>
                </View>
              )}
              <Pressable
                className={`active:opacity-50 ${
                  isDetailsVisible ? "justify-center items-center" : ""
                }`}
                onPress={() => setIsDetailsVisible(!isDetailsVisible)}
              >
                <Text className="text-blue-400">
                  {isDetailsVisible ? "Hide Details" : "Show Details"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* E-Mail Body */}
          <View className="bg-white dark:bg-zinc-800 pb-4 px-4 pt-2 flex-1">
            <WebView
              originWhitelist={["*"]}
              source={{ html: email.body }}
              style={{ flex: 1, backgroundColor: backgroundColor }}
              injectedJavaScript={injectedJavaScript}
              javaScriptEnabled={true}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EmailDetailsScreen;
