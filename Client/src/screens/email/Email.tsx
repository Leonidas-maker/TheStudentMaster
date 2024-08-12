import React, { useState, useEffect } from "react";
import { View, Text, Button } from 'react-native';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import axios from "axios";
import EmailList from "../../components/email/EmailList";
import EmailDetails from "../../components/email/EmailDetails";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => (
  <DrawerContentScrollView {...props}>
    <DrawerItemList {...props} />
  </DrawerContentScrollView>
);

const Email: React.FC = () => {
  const [mailboxes, setMailboxes] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<{ id: string; mailbox: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    axios
      .post("http://192.168.178.43:8000/email/get-folders", {
        username: "s222291",
        password: "KPpVv3yDMQ6Z7Q64BJdc",
        imap_server: "studgate.dhbw-mannheim.de",
        imap_port: 993,
      })
      .then((response) => {
        setMailboxes(response.data.folders);
        if (selectedIndex === null && response.data.folders.length > 0) {
          setSelectedIndex(0); // Set default index if none is selected
        }
      })
      .catch((error) => console.error("Error fetching folders:", error));
  }, [selectedIndex]);

  const onMailSelect = (emailId: string, mailbox: string, index: number) => {
    setSelectedEmail({ id: emailId, mailbox });
    setSelectedIndex(index);
  };

  const handleBack = () => {
    setSelectedEmail(null);
  };

  const getInitialRouteName = () => {
    if (selectedIndex !== null && mailboxes[selectedIndex]) {
      return mailboxes[selectedIndex];
    }
    return undefined;
  };

  return (
    <View style={{ flex: 1 }}>
      {selectedEmail ? (
        <View style={{ flex: 1 }}>
          <Button title="Back" onPress={handleBack} />
          <EmailDetails
            mailbox={selectedEmail.mailbox}
            emailId={selectedEmail.id}
          />
        </View>
      ) : (
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          initialRouteName={getInitialRouteName()} // Use function to get the correct route name
        >
          {mailboxes.length > 0 ? (
            mailboxes.map((mailboxName, index) => (
              <Drawer.Screen
                key={index}
                name={mailboxName || `Folder_${index}`}
              >
                {() => (
                  <EmailList
                    mailbox={mailboxName}
                    onSelectEmail={(emailId, mailbox) => onMailSelect(emailId, mailbox, index)}
                  />
                )}
              </Drawer.Screen>
            ))
          ) : (
            <Drawer.Screen name="Loading">
              {() => (<Text>Loading...</Text>)}
            </Drawer.Screen>
          )}
        </Drawer.Navigator>
      )}
    </View>
  );
};

export default Email;
