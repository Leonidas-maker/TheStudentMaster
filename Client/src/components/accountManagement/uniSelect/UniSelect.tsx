import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TouchableOpacity, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';

import universityData from "../../../screens/accountManagement/testData/courseData.json";

interface University {
    university_name: string;
    university_uuid: string;
    course_names: string[];
}

interface UniversityDropdownItem {
    key: string;
    value: string;
}

// TODO Add funcitonality to select a University
function UniSelect() {

    const { t } = useTranslation();

    const [universities, setUniversities] = useState<UniversityDropdownItem[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [courses, setCourses] = useState<UniversityDropdownItem[]>([]);

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

    return (
        <View className="px-3 pt-3">
            <SelectList
                setSelected={onSelectUniversity}
                data={universities}
                save="value"
                search={false}
                placeholder={"Universität auswählen"}
                boxStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                dropdownStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                dropdownTextStyles={{ color: "#FFFFFF" }}
                inputStyles={{ color: "#FFFFFF" }}
            />
        </View>
    );
}


export default UniSelect;