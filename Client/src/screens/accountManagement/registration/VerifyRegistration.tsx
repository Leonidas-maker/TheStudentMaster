import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

function VerifyRegistration() {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <View>
                <Text className="text-font_primary">Welcome to the VerifyRegistration page</Text>
            </View>
        </ScrollView>
    );
}

export default VerifyRegistration;