import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import DefaultText from "../../../components/textFields/DefaultText";
import Subheading from "../../../components/textFields/Subheading";
import Heading from "../../../components/textFields/Heading";
import TextButton from "../../../components/buttons/TextButton";

const AddMfa: React.FC = () => {

    const { t } = useTranslation();

    const onPress = () => {
        console.log("Button pressed");
    };

    return (
        <ScrollView className='h-screen bg-primary'>
            <View className="justify-center items-center">
                <Heading text="Add MFA" />
                <Subheading text="Add MFA" />
                <DefaultText text="Welcome to the AddMfa page" />
                <TextButton text="Add MFA" onPress={onPress} />
            </View>
        </ScrollView>
    );
}

export default AddMfa;