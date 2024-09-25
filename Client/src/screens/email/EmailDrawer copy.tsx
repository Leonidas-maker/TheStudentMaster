import React, { useState, useEffect, useRef } from "react";
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
} from "../../services/emailService";
import {
  Email,
  EmailCompressedHashTable,
  EmailDetailsHashTable,
  SpecialEmailHashTables,
} from "../../interfaces/email";
import { set } from "lodash";

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
  const [mailboxes, setMailboxes] = useState<string[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState<string>(""); // Store the currently selected mailbox
  const [currentEmails, setCurrentEmails] = useState<EmailCompressedHashTable>(
    {}
  ); // Store the emails for the current mailbox
  const mailboxesRef = useRef<string>("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const colorScheme = useColorScheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(0);

  const updateEmailTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const droppedEmailsRef = useRef<EmailCompressedHashTable>({});
  const previousSearchQuery = useRef<string>("");
  const emailDetailsRef = useRef<EmailDetailsHashTable>({});
  const isUpdating = useRef(false);

  // ====================================================== //
  // ======================= Helper ======================= //
  // ====================================================== //
  const filterEmails = (
    emails: EmailCompressedHashTable,
    searchQuery: string
  ) => {
    const filteredEmails: EmailCompressedHashTable = {};
    const droppedEmails: EmailCompressedHashTable = {};

    Object.entries(emails).forEach(([key, email]) => {
      if (
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        filteredEmails[key] = email;
      } else {
        droppedEmails[key] = email;
      }
    });

    return { filteredEmails, droppedEmails };
  };

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

      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const onMailSelect = (messageId: string, mailbox: string, index: number) => {
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
    });
  };

  const onMailboxChange = (mailboxName: string, index: number) => {
    if (mailboxName !== selectedMailbox) {
      console.debug(`Changing mailbox to ${mailboxName}`);
      setCurrentEmails({});
      setSelectedMailbox(mailboxName);
    }
  };

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

  const bugWorkaroundSetCurrentEmails = (emails: EmailCompressedHashTable) => {
    setCurrentEmails({});
    setTimeout(() => {
      setCurrentEmails(emails);
    }, 50);
  };

  // Filter emails based on search query
  useEffect(() => {
    setIsRefreshing(true);
    // Delay the search by 500ms to prevent unnecessary filtering
    const timeoutId = setTimeout(() => {
      if (selectedMailbox) {
        if (searchQuery.length === 0) {
          // Reset the emails
          bugWorkaroundSetCurrentEmails({
            ...droppedEmailsRef.current,
            ...currentEmails,
          });
          droppedEmailsRef.current = {};
        } else if (searchQuery.length > previousSearchQuery.current.length) {
          // Search query has increased
          const { filteredEmails, droppedEmails } = filterEmails(
            currentEmails,
            searchQuery
          );

          bugWorkaroundSetCurrentEmails(filteredEmails);
          droppedEmailsRef.current = {
            ...droppedEmailsRef.current,
            ...droppedEmails,
          };
        } else if (searchQuery.length < previousSearchQuery.current.length) {
          // Search query has decreased
          const { filteredEmails, droppedEmails } = filterEmails(
            { ...droppedEmailsRef.current, ...currentEmails },
            searchQuery
          );
          bugWorkaroundSetCurrentEmails(filteredEmails);
          droppedEmailsRef.current = droppedEmails;
        }
        previousSearchQuery.current = searchQuery;
      }
      setIsRefreshing(false);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
              <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
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
