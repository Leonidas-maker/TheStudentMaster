import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  RefreshControl,
  SectionList,
  ActivityIndicator, useColorScheme
} from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import EmailItem from "./EmailItem"; // Deine individuelle Komponente für jedes Email-Item
import {
  EmailCompressedHashTable,
  EmailCompressed,
} from "../../interfaces/email";
import { EmailListProps } from "../../interfaces/email";

const groupEmails = (emails: EmailCompressedHashTable) => {
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");

  let todayEmails: EmailCompressed[] = [];
  let yesterdayEmails: EmailCompressed[] = [];
  let olderEmails: EmailCompressed[] = [];

  Object.entries(emails).forEach(([key, email]) => {
    const emailDate = dayjs(email.date);

    if (emailDate.isSame(today, "day")) {
      todayEmails.push({ ...email, message_id: key });
    } else if (emailDate.isSame(yesterday, "day")) {
      yesterdayEmails.push({ ...email, message_id: key });
    } else {
      olderEmails.push({ ...email, message_id: key });
    }
  });

  // Sort emails by date
  todayEmails.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  yesterdayEmails.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  olderEmails.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());

  return [
    { title: "Heute", data: todayEmails },
    { title: "Gestern", data: yesterdayEmails },
    { title: "Älter", data: olderEmails },
  ];
};

const filterEmails = (
  emails: EmailCompressedHashTable,
  searchQuery: string
) => {
  const filteredEmails: EmailCompressedHashTable = {};

  Object.entries(emails).forEach(([key, email]) => {
    if (
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      filteredEmails[key] = email;
    }
  });

  return filteredEmails;
};

// ====================================================== //
// ======================= Helper ======================= //
// ====================================================== //

const EmailList: React.FC<EmailListProps> = ({
  emails,
  mailbox,
  searchQuery,
  isRefreshing,
  setIsRefreshing,
  updateEmails,
  onSelectEmail,
}) => {
  if (!emails) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <ActivityIndicator size="large" color="#9ca3af" />
      </View>
    );
  }
  const colorScheme = useColorScheme();
  let refreshCount = 0;

  const groupedEmails = useMemo(
    () => groupEmails(filterEmails(emails, searchQuery)),
    [emails, searchQuery]
  );

  // ====================================================== //
  // ===================== Callbacks; ===================== //
  // ====================================================== //
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (refreshCount > 1) {
      refreshCount++;
      updateEmails(mailbox.current, false, false);
    } else if (refreshCount === 0) {
      refreshCount++;
      updateEmails(mailbox.current, true, false);
    } else {
      refreshCount++;
      updateEmails(mailbox.current, false, true).then(() => {
        setTimeout(() => {
          refreshCount = 0;
        }, 5000);
      });
    }
  }, []);

  // ====================================================== //
  // ======================= Renders ====================== //
  // ====================================================== //

  // Render email list
  return Object.keys(emails).length === 0 ? (
    <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
      <Icon name="email-off-outline" size={80} color="#9ca3af" />
      <Text className="mt-4 text-xl font-semibold text-gray-600 dark:text-gray-500">
        Keine neuen E-Mails
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
        Dieser Ordner ist leer.
      </Text>
    </View>
  ) : (
    <SectionList
      className="bg-white dark:bg-zinc-900 p-2"
      sections={groupedEmails}
      keyExtractor={(item) => item.message_id}
      renderItem={({ item }) => (
        <EmailItem
          mailbox={mailbox.current}
          email={item}
          onSelectEmail={onSelectEmail}
        />
      )}
      renderSectionHeader={({ section }) =>
        section && section.data && section.data.length > 0 ? (
          <Text className="text-lg font-bold mb-2 text-black dark:text-white">
            {section.title}
          </Text>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={ colorScheme === "dark" ? ["white"] : ["black"]}
          tintColor={ colorScheme === "dark" ? "white" : "black"}
          progressBackgroundColor={colorScheme === "dark" ? "#121212" : "#f9f9f9"}
        />
      }
    />
  );
};

export default EmailList;
