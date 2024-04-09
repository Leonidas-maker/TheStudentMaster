import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list'

function MenuPlan() {

    const { t } = useTranslation();

    const [selected, setSelected] = React.useState("");

    // Data for canteen names
    const canteenNames = [
        { key: '1', value: 'Mensaria am Schloss' },
        { key: '2', value: 'greens^2' },
        { key: '3', value: 'MensaWagon' },
        { key: '4', value: 'Cafe Soleil' },
        { key: '5', value: 'Cafeteria Musikhochschule' },
        { key: '6', value: 'CAFE 33 (Popakademie)' },
        { key: '7', value: 'Mensa Hochschule Mannheim' },
        { key: '8', value: 'Mensaria Metropol (DHBW Coblitzallee)' },
        { key: '9', value: 'Mensaria Wohlgelegen (DHBW Kaefertaler Strasse)' },
        { key: '10', value: 'Speisenausgabe DHBW Eppelheim' },
    ]

    return (
        <View className='h-full'>
            <SelectList
                setSelected={(val:any) => setSelected(val)}
                data={canteenNames}
                save="value"
                search={false}
                placeholder="Mensa auswählen"
            />
        </View>
    );
}

export default MenuPlan;