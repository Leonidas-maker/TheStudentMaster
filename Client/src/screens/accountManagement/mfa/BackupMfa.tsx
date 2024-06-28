// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../../components/textFields/DefaultText";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";
import DefaultButton from "../../../components/buttons/DefaultButton";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
// TODO Implement get Backup-Codes
// TODO Implement save Backup-Codes
// TODO Implement show Backup-Codes
// TODO Implement save Backup-Codes as Screenshot
const BackupMfa: React.FC = () => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="h-screen bg-light_primary dark:bg-dark_primary">
      <Heading text="Geschafft!" />
      <Subheading text="MFA wurde erfolgreich aktiviert" />
      <DefaultText text="Bitte speichere deine Backup-Codes an einem sicheren Ort" />
      <DefaultText text="Du kannst sie verwenden, wenn du keinen Zugriff auf deine Authenticator App hast" />
      <DefaultText text="Die Codes können nicht wiederhergestellt werden" />
      <DefaultText text="Solltest du sie verlieren, musst du dir einen neuen Account erstellen" />
      <DefaultText text="Deine Backup-Codes:" />

      <DefaultButton text="Backup-Codes kopieren" />
      <DefaultButton text="Mach einen Screenshot" />
    </View>
  );
};

export default BackupMfa;
