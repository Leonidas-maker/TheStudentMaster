import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import TextFieldInput from "../../components/textInputs/TextFieldInput";
import Subheading from "../../components/textFields/Subheading";
import DefaultText from "../../components/textFields/DefaultText";
import DefaultButton from "../../components/buttons/DefaultButton";
import EditButton from "../../components/buttons/EditButton";

const Profile: React.FC = () => {
  const [usernameEdit, setUsernameEdit] = useState(false);

  const handleUsernameEditPress = () => {
    setUsernameEdit(!usernameEdit);
  };

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="justify-center items-center">
        <Subheading text="Username" />
        <View>
          <EditButton onPress={handleUsernameEditPress} />
        </View>
        <TextFieldInput editable={usernameEdit} />
        {usernameEdit && (
          <View className="justify-center items-center w-full">
            <Subheading text="Passwort" />
            <TextFieldInput />
          </View>
        )}
      </View>
      <View className="border-b border-light_secondary dark:border-dark_secondary my-2" />
      <View className="justify-center items-center">
        <Subheading text="Email" />
        <TextFieldInput />
      </View>
      <View className="border-b border-light_secondary dark:border-dark_secondary my-2" />
      <View className="justify-center items-center">
        <Subheading text="Aktuelle Passwort" />
        <TextFieldInput />
        <Subheading text="Neues Passwort" />
        <TextFieldInput />
        <Subheading text="Neues Passwort wiederholen" />
        <TextFieldInput />
      </View>
      <View className="border-b border-light_secondary dark:border-dark_secondary my-2" />
      <View className="justify-center items-center">
        <Subheading text="Straße und Hausnummer" />
        <TextFieldInput />
        <Subheading text="Zusatzinformationen" />
        <TextFieldInput />
        <Subheading text="Bundesland" />
        <TextFieldInput />
        <Subheading text="Postleitzahl" />
        <TextFieldInput />
        <Subheading text="Stadt" />
        <TextFieldInput />
        <Subheading text="Land" />
        <TextFieldInput />
      </View>
    </ScrollView>
  );
};

export default Profile;
