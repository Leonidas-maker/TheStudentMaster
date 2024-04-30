import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

function VerifyLogin() {
  const { t } = useTranslation();

  return (
    <ScrollView className="h-screen bg-primary">
      <View>
        <Text className="text-font_primary">
          Welcome to the VerifyLogin page
        </Text>
      </View>
    </ScrollView>
  );
}

export default VerifyLogin;
