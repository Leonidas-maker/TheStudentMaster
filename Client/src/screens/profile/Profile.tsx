import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

function Profile() {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <View>
                <Text className="text-font_primary">Welcome to the Profile page</Text>
            </View>
        </ScrollView>
    );
}

export default Profile;