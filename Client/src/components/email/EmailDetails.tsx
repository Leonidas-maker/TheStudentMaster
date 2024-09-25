import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import axios from "axios";
import RenderHtml from "react-native-render-html";
import { EmailDetailsProps, EmailDetail } from "../../interfaces/email";

const EmailDetails: React.FC<EmailDetailsProps> = ({ mailbox, emailId }) => {
  const [emailDetails, setEmailDetails] = useState<EmailDetail | null>(null);

  useEffect(() => {
    axios
      .post("http://192.168.178.43:8000/email/get-email", {
        username: "s222291",
        password: "KPpVv3yDMQ6Z7Q64BJdc",
        imap_server: "studgate.dhbw-mannheim.de",
        imap_port: 993,
        email_id: emailId,
        mailbox: mailbox,
      })
      .then((response) => setEmailDetails(response.data))
      .catch((error) => console.error("Error fetching email details:", error));
  }, [emailId, mailbox]);

  if (!emailDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-semibold">From: {emailDetails.from_}</Text>
      <Text className="text-lg font-semibold">
        Subject: {emailDetails.subject}
      </Text>
      <RenderHtml contentWidth={300} source={{ html: emailDetails.body }} />
    </ScrollView>
  );
};

export default EmailDetails;
