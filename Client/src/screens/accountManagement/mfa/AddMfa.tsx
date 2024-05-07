import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import DefaultText from "../../../components/textFields/DefaultText";
import Subheading from "../../../components/textFields/Subheading";
import Heading from "../../../components/textFields/Heading";
import DefaultButton from "../../../components/buttons/DefaultButton";
import QRCode from "react-native-qrcode-svg";

// TODO Implement get QR-Code
// TODO Implement copy code to clipboard
const AddMfa: React.FC = () => {
  const { t } = useTranslation();

  const sampleQRData =
    "otpauth://totp/TheShopMaster.com:schuetzeandreas.1%40web.de?secret=NIKBTQZM3AFR3Z3FCWSHOPGY53KJQ6YT&issuer=TheShopMaster.com";

  return (
    <ScrollView className="h-screen bg-primary">
      <View className="justify-center items-center">
        <Heading text="MFA aktivieren" />
        <Subheading text="Scanne den QR-Code in deiner Authenticator App" />
        <QRCode
          value={sampleQRData}
          size={200}
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
