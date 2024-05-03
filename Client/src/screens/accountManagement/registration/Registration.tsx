import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Keyboard, Switch, Pressable } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

import universityData from "../testData/courseData.json";
import Dropdown from "../../../components/dropdown/Dropdown";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

interface University {
    university_name: string;
    university_uuid: string;
    course_names: string[];
}

interface UniversityDropdownItem {
    key: string;
    value: string;
}

const Registration: React.FC = () => {

    const { t } = useTranslation();
    const [isNotification, setIsNotification] = useState(false);
    const [is2FA, setIs2FA] = useState(false);

    const toggleNotification = () => setIsNotification(previousState => !previousState);
    const toggle2FA = () => setIs2FA(previousState => !previousState);

    const [universities, setUniversities] = useState<UniversityDropdownItem[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [courses, setCourses] = useState<UniversityDropdownItem[]>([]);

    useEffect(() => {
        const universityItems: UniversityDropdownItem[] = universityData.map((uni, index) => ({
            key: String(index + 1),
            value: uni.university_name
        }));
        setUniversities(universityItems);
    }, []);

    const handleUniversityChange = (selectedValue: string) => {
        const universityIndex = universities.findIndex(u => u.value === selectedValue);
        const university = universityData[universityIndex];
        if (university) {
            setSelectedUniversity(university);
            const courseItems: UniversityDropdownItem[] = university.course_names.map((course, index) => ({
                key: String(index + 1),
                value: course
            }));
            setCourses(courseItems);
        }
    };

    const onSelectUniversity = (value: string) => {
        handleUniversityChange(value);
    };

    const onSelectCourse = (value: string) => {
        setCourses(courses.filter(c => c.value === value));
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    // Username, Email, Password, Confirm Password, Register Button
    // Optional fields: Address, City, State, Zip Code, Country, Profile Picture
    // Checkbox for 2FA
    // Checkbox for Terms and Conditions
    // Checkbox for Email Notifications
    return (
        <Pressable onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="justify-center items-center">
                    <Text className="text-font_primary pt-10 text-4xl font-bold">Account erstellen</Text>
                    <TextFieldInput autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Nutzername" autoComplete="username" />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="next" placeholder="E-Mail Adresse" autoComplete="email" />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="next" placeholder="Passwort" secureTextEntry={true} autoComplete="new-password" />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="done" placeholder="Passwort wiederholen" secureTextEntry={true} autoComplete="new-password" />
                </View>
                <View>
                    <Dropdown setSelected={onSelectUniversity} values={universities} placeholder="Universität auswählen" />
                    <Dropdown setSelected={onSelectCourse} values={courses} placeholder="Kurs auswählen" search={true} />
                </View>
                <View className="justify-center items-center">

                    <DefaultButton text="Registrieren" />
                </View>
                <View className="m-4">
                    <Text className="text-font_primary text-xl font-bold mb-2">Weitere Optionen</Text>
                    <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Icon name="dashboard" size={20} color="#E0E0E2" />
                                <Text className="text-font_primary font-bold text-lg ml-2">Benachrichtigungen</Text>
                            </View>
                            <Switch
                                onValueChange={toggleNotification}
                                value={isNotification}
                            />
                        </View>
                        <View className="border-b border-gray-700 my-2" />
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Icon name="school" size={20} color="#E0E0E2" />
                                <Text className="text-font_primary font-bold text-lg ml-2">2FA</Text>
                            </View>
                            <Switch
                                onValueChange={toggle2FA}
                                value={is2FA}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Pressable>
    );
}

export default Registration;