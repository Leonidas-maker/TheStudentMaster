import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import { EmailListProps, Email } from "../../interfaces/email";

const EmailList: React.FC<EmailListProps> = ({ mailbox, onSelectEmail }) => {
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    axios
      .post("http://192.168.178.43:8000/email/get-email-list?read_status=all", {
        username: "s222291",
        password: "KPpVv3yDMQ6Z7Q64BJdc",
        imap_server: "studgate.dhbw-mannheim.de",
        imap_port: 993,
        mailbox: mailbox,
      })
      .then((response) => setEmails(response.data))
      .catch((error) => console.error("Error fetching emails:", error));
  }, [mailbox]);

  return (
    <View className="p-4">
      {emails.map((email) => (
        <TouchableOpacity
          key={email.id}
          onPress={() => onSelectEmail(email.id, mailbox)}
          className="p-4 mb-2 bg-white rounded shadow"
        >
          <Text className="text-lg font-semibold">{email.subject}</Text>
          <Text className="text-gray-600">{email.from_}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default EmailList;
