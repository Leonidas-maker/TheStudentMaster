import React from "react";
import { View, ScrollView, Text } from "react-native";
import creditsData from "./licenses.json";

const Credits: React.FC = () => {
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary flex-1">
      <View>
        {creditsData.map((credit, index) => (
          <View
            key={index}
            className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]"
          >
            <Text className="text-black dark:text-white">
              Department: {credit.department}
            </Text>
            <Text className="text-black dark:text-white">
              Related To: {credit.relatedTo}
            </Text>
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

export default Credits;
