import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

function ForgotPassword() {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <View>
                <Text className="text-font_primary">Welcome to the ForgotPassword page</Text>
            </View>
        </ScrollView>
    );
}

export default ForgotPassword;