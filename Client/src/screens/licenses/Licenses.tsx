import React from "react";
import { View, ScrollView, Text } from "react-native";
import creditsData from "./licenses.json";

const Licenses: React.FC = () => {
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary flex-1">
      <View>
        <View className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]">
          <Text className="text-black dark:text-white">
            In der App verwendete Icons & Symbole: material-design-icons
          </Text>
          <Text className="text-black dark:text-white">
            License Type: Apache-2.0
          </Text>
          <Text className="text-black dark:text-white">
            Link: https://github.com/google/material-design-icons.git
          </Text>
          <Text className="text-black dark:text-white">
            Installed Version: 4.0.0
          </Text>
          <Text className="text-black dark:text-white">Author: Google</Text>
        </View>
        <View className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]">
          <Text className="text-black dark:text-white">
            Verwendete UIcons in der unteren Leiste: Flaticon
          </Text>
          <Text className="text-black dark:text-white">
            Link: https://www.flaticon.com
          </Text>
          <Text className="text-black dark:text-white">Author: Flaticon</Text>
        </View>
        {creditsData.map((credit, index) => (
          <View
            key={index}
            className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]"
          >
            <Text className="text-black dark:text-white">
              Name: {credit.name}
            </Text>
            <Text className="text-black dark:text-white">
              License Period: {credit.licensePeriod}
            </Text>
            <Text className="text-black dark:text-white">
              Material: {credit.material}
            </Text>
            <Text className="text-black dark:text-white">
              License Type: {credit.licenseType}
            </Text>
            <Text className="text-black dark:text-white">
              Link: {credit.link}
            </Text>
            <Text className="text-black dark:text-white">
              Remote Version: {credit.remoteVersion}
            </Text>
            <Text className="text-black dark:text-white">
              Installed Version: {credit.installedVersion}
            </Text>
            <Text className="text-black dark:text-white">
              Defined Version: {credit.definedVersion}
            </Text>
            <Text className="text-black dark:text-white">
              Author: {credit.author}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Licenses;
