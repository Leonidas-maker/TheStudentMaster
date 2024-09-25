import React, { useState, useEffect, useRef, useCallback } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";

import EmailList from "../../components/email/EmailList";
import SearchTimeHeader from "../../components/drawer/SearchTimeHeader";
import {
  getEmailFolders,
  getEmailList,
  getEmailDetails,
  splitHashTables,
  updateEmailFlags
} from "../../services/emailService";
import {
  Email,
  EmailCompressedHashTable,
  EmailDetailsHashTable,
} from "../../interfaces/email";
import dayjs from "dayjs";
import { useFocusEffect } from "@react-navigation/native";

const CustomDrawerContent = (props: any) => (
  <DrawerContentScrollView {...props}>
    <DrawerItemList {...props} />
  </DrawerContentScrollView>
);

// Map names of folders to German names
const folderNameMapperGer: { [key: string]: string } = {
  inbox: "Posteingang",
  sent: "Gesendet",
  drafts: "Entwürfe",
  trash: "Papierkorb",
  archive: "Archiv",
  important: "Wichtig",
  all_mail: "Alle E-Mails",
  starred: "Markiert",
  unseen: "Ungelesen",
  "chats-1": "Chats",
  "contacts-1": "Kontakte",
  "emailed contacts-1": "Gesendete Kontakte",
};

const Drawer = createDrawerNavigator();

const EmailDrawer = ({ navigation }: any) => {
  const colorScheme = useColorScheme();

  const [mailboxes, setMailboxes] = useState<string[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState<string>(""); // Store the currently selected mailbox
  const [currentEmails, setCurrentEmails] =
    useState<EmailCompressedHashTable | null>({}); // Store the emails for the current mailbox

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(0);

  const updateEmailTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const emailDetailsRef = useRef<EmailDetailsHashTable>({});
  const changeSelectedEmail = useRef<Email | null>(null);
  const mailboxesRef = useRef<string>("");
  const isUpdating = useRef(false);

  // ====================================================== //
  // ======================= Helper ======================= //
  // ====================================================== //
  const getMappedFolderName = (folderName: string) => {
    const language = "german";
    switch (language) {
      case "german":
        return folderNameMapperGer[folderName];
      default:
        return null;
    }
  };

  const getPolishedFolderName = (folderName: string) => {
    // Replace all underscores with spaces
    folderName = folderName.replace(/_/g, " ");

    // Check if the folder name is mapped to a different name
    const mappedName = getMappedFolderName(folderName.toLowerCase());
    if (mappedName) {
      // Return the mapped name if it exists
      return mappedName;
    } else {
      // Capitalize the first letter of each word and the rest to lowercase
      folderName = folderName
        .trim()
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      // Return the polished folder name
      return folderName;
    }
  };

  // ====================================================== //
  // ====================== Callbacks ===================== //
  // ====================================================== //
  const updateEmails = async (
    mailbox: string,
    softRefresh = false,
    hardRefresh = false
  ) => {
    setIsRefreshing(true);
    if (mailbox && !isUpdating.current) {
      isUpdating.current = true;
      // Clear any existing timeout before setting a new one
      if (updateEmailTimeoutId.current) {
        clearTimeout(updateEmailTimeoutId.current);
      }
      const response = await getEmailList(
        mailbox,
        "all",
        softRefresh,
        hardRefresh
      );

      if (response) {
        const { emailCompressedHashTable, emailDetailsHashTable } =
          splitHashTables(response.emails);

        setLastUpdated(response.lastupdate);
        setCurrentEmails(emailCompressedHashTable);

        emailDetailsRef.current = emailDetailsHashTable;
      }

      // Calculate the time until the next update
      const lastUpdateTime = response.lastupdate;
      const currentTime = Date.now();
      const timeSinceLastUpdate = currentTime - lastUpdateTime;
      const newTimeout = Math.max(300000 - timeSinceLastUpdate, 10000); // Minimum interval of 10 seconds

      console.debug(
        `Next update in ${newTimeout / 60000} minutes - ${mailbox}`
      );

      // Set the new Timeout and store it in the ref
      updateEmailTimeoutId.current = setTimeout(() => {
        updateEmails(mailbox, true, false);
      }, newTimeout);
      isUpdating.current = false;
      setIsRefreshing(false);
    }
  };

  /**
   * Change the selected mailbox
   * @param mailboxName - The name of the mailbox to change to
   * @param index - The index of the mailbox in the mailboxes array
   */
  const onMailboxChange = (mailboxName: string, index: number): void => {
    if (mailboxName !== selectedMailbox) {
      console.debug(`Changing mailbox to ${mailboxName}`);
      setSelectedMailbox(mailboxName);
      setCurrentEmails(null);
    }
  };

  /**
   * Get the email details and navigate to the EmailDetails screen
   * @param messageId - The ID of the email to get details for
   * @param mailbox - The mailbox the email belongs to
   * @param index - The index of the email in the mailbox
   */
  const onMailSelect = (
    messageId: string,
    mailbox: string,
    index: number
  ): void => {
    if (!currentEmails) return;

    if (!emailDetailsRef.current[messageId].body) {
      // Remap the virtual mailbox name to the actual mailbox name
      if (["unseen", "starred"].includes(mailbox.toLowerCase())) {
        if (currentEmails[messageId].mailbox) {
          mailbox = currentEmails[messageId].mailbox;
        } else {
          return;
        }
      }

      getEmailDetails(messageId, mailbox).then((response) => {
        if (response) {
          emailDetailsRef.current[messageId] = response;
        }
      });
    }

    navigation.navigate("EmailDetails", {
      emailCompressed: { ...currentEmails[messageId], message_id: messageId },
      emailDetailsRef: emailDetailsRef,
      changeSelectedEmail: changeSelectedEmail,
    });
  };

  // ====================================================== //
  // =================== useFocusEffects ================== //
  // ====================================================== //
  // TODO: Fix the issue with the email flags not updating
  // useFocusEffect(
  //   useCallback(() => {
  //     if (currentEmails && changeSelectedEmail.current) {
  //       console.log(changeSelectedEmail.current);
  //       let emailTmp = { ...currentEmails };

  //       emailTmp[changeSelectedEmail.current.message_id].flags =
  //         changeSelectedEmail.current.flags;
  //       setCurrentEmails(emailTmp);
  //       changeSelectedEmail.current = null;
  //     }
  //   }, [])
  // );

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //

  // Load the email folders when the component mounts
  useEffect(() => {
    getEmailFolders().then((response) => {
      if (response.length > 0) {
        if (response) {
          const mailboxes = ["Unseen", "Starred", ...response];
          setMailboxes(mailboxes);
          setSelectedMailbox(mailboxes[0]); // Set the default mailbox to the first folder
        }
      }
    });
  }, []);

  // Get the emails for the selected mailbox
  useEffect(() => {
    console.debug(`Updating emails for ${selectedMailbox}`);
    mailboxesRef.current = selectedMailbox;
    updateEmails(selectedMailbox, true, false);

    // Cleanup: clear the timeout when component unmounts or mailbox changes
    return () => {
      if (updateEmailTimeoutId.current) {
        console.debug(`Clearing timeout for ${selectedMailbox}`);
        clearTimeout(updateEmailTimeoutId.current);
      }
    };
  }, [selectedMailbox]);

  const backgroundColor = colorScheme === "dark" ? "#1E1E24" : "#E8EBF7";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: backgroundColor,
      }}
    >
      <Drawer.Navigator
        screenOptions={({ route }) => ({
          header: () => (
            <SearchTimeHeader
              folderName={route.name}
              lastUpdated={lastUpdated}
              searchString={searchQuery}
              setSearchString={setSearchQuery}
            />
          ),
          drawerStyle: {
            backgroundColor: backgroundColor,
            width: 240,
          },
          drawerLabelStyle: {
            color: colorScheme === "dark" ? "#fff" : "#000",
            fontSize: 16,
          },
          drawerActiveTintColor: colorScheme === "dark" ? "#fff" : "#000",
          drawerInactiveTintColor:
            colorScheme === "dark" ? "#9ca3af" : "#6b7280",
        })}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        initialRouteName={selectedMailbox}
      >
        {mailboxes.length > 0 ? (
          mailboxes.map((mailboxName, index) => (
            <Drawer.Screen
              key={index}
              name={getPolishedFolderName(mailboxName) || `Folder_${index}`}
              listeners={{
                // Change the selected mailbox when a folder is selected
                focus: () => onMailboxChange(mailboxName, index),
              }}
            >
              {() => (
                <View className="flex-1">
                  {/* Use a single EmailList and update it based on selected mailbox */}
                  {selectedMailbox && (
                    <EmailList
                      mailbox={mailboxesRef}
                      emails={currentEmails}
                      searchQuery={searchQuery}
                      isRefreshing={isRefreshing}
                      setIsRefreshing={setIsRefreshing}
                      updateEmails={updateEmails}
                      onSelectEmail={(messageId, mailbox) =>
                        onMailSelect(messageId, mailbox, index)
                      }
                    />
                  )}
                </View>
              )}
            </Drawer.Screen>
          ))
        ) : (
          <Drawer.Screen name="Loading">
            {() => (
              <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
                <ActivityIndicator size="large" color="#9ca3af" />
              </View>
            )}
          </Drawer.Screen>
        )}
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

export default EmailDrawer;
