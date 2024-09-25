import React, { useState, memo } from "react";
import { View, Text, Pressable } from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Verwende ein Icon-Paket

import { EmailItemProps } from "../../interfaces/email";

const EmailItem: React.FC<EmailItemProps> = ({
  mailbox,
  email,
  onSelectEmail,
}) => {
  if (!email.from_ || !email.subject || !email.date) {
    return null;
  }

  const emailDate = dayjs(email.date);
  const [showToast, setShowToast] = useState(false);
  const displayTime = emailDate.isBefore(
    dayjs().startOf("day").subtract(1, "day"),
  )
    ? emailDate.format("DD.MM.YYYY") // Show full date for older emails
    : emailDate.format("HH:mm"); // Show time for today and yesterday emails

  const starred = email.flags.includes("\\Flagged");
  const unread = !email.flags.includes("\\Seen"); // Flag for unread
  const draft = email.flags.includes("\\Draft");

  const handlePress = () => {
    if (email.message_id.includes("no-message-id-")) {
      // Show toast if no message ID is available
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } else {
      onSelectEmail(email.message_id, mailbox);
    }
  };

  return (
    <View className={`${unread ? "" : "opacity-70 rounded"}`}>
      <Pressable
        key={email.message_id}
        onPress={() => handlePress()}
        className="p-4 mb-2 rounded shadow bg-light_primary dark:bg-dark_primary active:opacity-50"
      >
        <View>
          {/* Sender, Subject, and Flags */}
          <View className="flex-row justify-between items-center">
            {/* Sender */}
            <View className="flex-shrink pr-3">
              <Text
                className={`text-lg ${
                  unread ? "font-bold" : "font-semibold"
                } text-black dark:text-white`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {email.from_.name ? email.from_.name : email.from_.email}
              </Text>
            </View>

            {/* Flags */}
            <View className="flex-row items-center space-x-2">
              {/* Draft Icon */}
              {draft && (
                <Icon name="file-document-outline" size={18} color="orange" />
              )}

              {/* Starred Icon */}
              {starred && <Icon name="star" size={18} color="yellow" />}

              {/* Time */}
              <Text className="text-gray-500">{displayTime}</Text>
            </View>
          </View>

          {/* Subject */}
          <Text
            className={`${
              unread
                ? "text-black dark:text-white"
                : "text-gray-600 dark:text-gray-500"
            }`}
            numberOfLines={1}
          >
            {email.subject}
          </Text>

          {/* Draft Label */}
          {draft && (
            <Text className="text-xs text-gray-500 italic">Entwurf</Text>
          )}
        </View>
      </Pressable>

      {/* Toast */}
      {showToast && (
        <View className="absolute bottom-0 left-0 right-0 bg-green-500 p-2">
          <Text className="text-white text-center">
            Keine Details verfügbar
          </Text>
        </View>
      )}
    </View>
  );

  // return (
  //   <View className={`${true ? "" : "opacity-70 rounded"}`}>
  //     <Pressable
  //       key={email.message_id}
  //       onPress={() => {}}
  //       className="p-4 mb-2 rounded shadow bg-light_primary dark:bg-dark_primary active:opacity-50"
  //     >
  // <View className="flex-1">
  //   {/* Sender, Subject, and Flags */}
  //   <View className="flex-row justify-between items-center">
  //     {/* Sender */}
  //     <View className="flex-shrink pr-3">
  //       <Text
  //         className={`text-lg ${
  //           true ? "font-bold" : "font-semibold"
  //         } text-black dark:text-white`}
  //         numberOfLines={1}
  //         ellipsizeMode="tail"
  //       >
  //         {email.from_.name ? email.from_.name : email.from_.email}
  //       </Text>
  //     </View>

  //     {/* Flags */}
  //     <View className="flex-row items-center space-x-2">
  //       {/* Draft Icon */}
  //       {false && (
  //         <Icon name="file-document-outline" size={18} color="orange" />
  //       )}

  //       {/* Starred Icon */}
  //       {false && <Icon name="star" size={18} color="yellow" />}

  //       {/* Time */}
  //       <Text className="text-gray-500">51531</Text>
  //     </View>
  //   </View>

  //         {/* Subject */}
  //         <Text
  //           className={`${
  //             true
  //               ? "text-black dark:text-white"
  //               : "text-gray-600 dark:text-gray-500"
  //           }`}
  //           numberOfLines={1}
  //         >
  //           {email.subject}
  //         </Text>

  //         {/* Draft Label */}
  //         {false && (
  //           <Text className="text-xs text-gray-500 italic">Entwurf</Text>
  //         )}
  //       </View>
  //     </Pressable>

  //     {/* Toast */}
  //     {false && (
  //       <View className="absolute bottom-0 left-0 right-0 bg-green-500 p-2">
  //         <Text className="text-white text-center">
  //           Keine Details verfügbar
  //         </Text>
  //       </View>
  //     )}
  //   </View>
  // );
};

export default EmailItem;
