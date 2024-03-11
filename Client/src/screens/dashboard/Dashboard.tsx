import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import { colorScheme } from "nativewind";

colorScheme.set("dark");


function Dashboard() {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <View>
                <Text className="text-font_primary dark:text-fuchsia-600">Welcome to the Dashboard page</Text>
            </View>
        </ScrollView>
    );
}

export default Dashboard;