import React from "react";
import { View, ScrollView } from "react-native";
import DefaultText from "../../../components/textFields/DefaultText";
import Subheading from "../../../components/textFields/Subheading";
import Heading from "../../../components/textFields/Heading";
import DefaultButton from "../../../components/buttons/DefaultButton";
import QRCode from "react-native-qrcode-svg";

// TODO Implement get QR-Code
// TODO Implement copy code to clipboard
//TODO: Resize logo in image
const AddMfa: React.FC = () => {
  const sampleQRData =
    "otpauth://totp/TheStudentMaster.com:example%40mail.de?secret=3HPHEWX4UPRCXCQYJXLSCMYHJ6WIBHSG&issuer=TheStudentMaster.com";
  let logo = require("../../../../public/logo/TheStudentMaster.png");

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="justify-center items-center">
        <Heading text="MFA aktivieren" />
        <Subheading text="Scanne den QR-Code in deiner Authenticator App" />
        <QRCode
          value={sampleQRData}
          size={200}
          logo={logo}
          logoSize={50}
          color="black"
          backgroundColor="white"
        />
        <DefaultText text="Du kannst den QR-Code nicht scannen?" />
        <DefaultButton text="Drücke hier um den Code zu kopieren" />
        <DefaultButton text="Verifzieren" />
      </View>
    </ScrollView>
  );
};

export default AddMfa;
