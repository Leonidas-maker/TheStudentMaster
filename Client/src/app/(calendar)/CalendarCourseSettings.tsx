import Settings from "../(tabs)/overview/(settings)/Settings";
import { useRouter, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

//TODO: Make this better by using global pages
const CalendarCourseSettings = () => {
    const router = useRouter();
    const navigation = useNavigation();

    // State to track the color scheme
    const [isLight, setIsLight] = useState(false);
    const colorScheme = useColorScheme();
    useEffect(() => {
        setIsLight(colorScheme === "light");
    }, [colorScheme]);
    const iconColor = isLight ? "#000000" : "#FFFFFF";


    const handleDismissPress = () => {
        router.dismiss();
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Pressable onPress={handleDismissPress}>
                    <Icon
                        name="close"
                        size={30}
                        color={iconColor}
                        style={{ marginLeft: "auto", marginRight: 15 }}
                    />
                </Pressable>
            )
        });
    }, [navigation, iconColor]);


    return <Settings />;
};

export default CalendarCourseSettings;