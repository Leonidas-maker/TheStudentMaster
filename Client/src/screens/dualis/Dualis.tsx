import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

const Dualis: React.FC = () => {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <View>
                <Text className="text-font_primary">Welcome to the Dualis page</Text>
            </View>
        </ScrollView>
    );
}

export default Dualis;
