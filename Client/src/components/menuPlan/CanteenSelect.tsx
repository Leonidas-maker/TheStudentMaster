// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'nativewind';
import { SelectList } from 'react-native-dropdown-select-list';

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface CanteenSelectProps {
    canteenNameData: {
        canteens: string[];
    };
    setSelectedCanteen: (selectedCanteen: string) => void;
};

interface CanteenProps {
    key: string;
    value: string;
};

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const CanteenSelect: React.FC<CanteenSelectProps> = ({
    canteenNameData,
    setSelectedCanteen
}) => {
    const [canteenNames, setCanteenNames] = useState<CanteenProps[]>([]);

    useEffect(() => {
        const names: CanteenProps[] = canteenNameData.canteens.map((canteenName, index) => ({
            key: String(index + 1),
            value: canteenName
        }));
        setCanteenNames(names);
    }, []);

    // ====================================================== //
    // ================== Return component ================== //
    // ====================================================== //
    return (
        <View className="pt-2 px-2">
            <SelectList
                setSelected={setSelectedCanteen}
                data={canteenNames}
                save="value"
                search={false}
                placeholder={"Mensa auswählen"}
                boxStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                dropdownStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                dropdownTextStyles={{ color: "#FFFFFF" }}
                inputStyles={{ color: "#FFFFFF" }}
            />
        </View>
    );
};

export default CanteenSelect;
