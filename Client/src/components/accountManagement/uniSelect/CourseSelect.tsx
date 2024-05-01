import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TouchableOpacity, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';

interface UniversityDropdownItem {
    key: string;
    value: string;
}

// TODO Add funcitonality to select a Course
function CourseSelect() {

    const { t } = useTranslation();

    const [courses, setCourses] = useState<UniversityDropdownItem[]>([]);

    const onSelectCourse = (value: string) => {
        setCourses(courses.filter(c => c.value === value));
    };

    return (
        <View className="p-3">
            <SelectList
                setSelected={onSelectCourse}
                data={courses}
                save="value"
                search={true}
                placeholder={"Kurs auswählen"}
                boxStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                dropdownStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                dropdownTextStyles={{ color: "#FFFFFF" }}
                inputStyles={{ color: "#FFFFFF" }}
            />
        </View>
    );
}


export default CourseSelect;