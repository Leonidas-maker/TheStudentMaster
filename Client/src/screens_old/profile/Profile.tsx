// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState } from "react";
import { View, ScrollView } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import TextFieldInput from "../../components/textInputs/TextFieldInput";
import Subheading from "../../components/textFields/Subheading";
import DefaultText from "../../components/textFields/DefaultText";
import DefaultButton from "../../components/buttons/DefaultButton";
import EditButton from "../../components/buttons/EditButton";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Profile: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [usernameEdit, setUsernameEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [passwordEdit, setPasswordEdit] = useState(false);
  const [addressEdit, setAddressEdit] = useState(false);

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  const handleUsernameEditPress = () => {
    setUsernameEdit(!usernameEdit);
  };

  const handleEmailEditPress = () => {
    setEmailEdit(!emailEdit);
  };

  const handlePasswordEditPress = () => {
    setPasswordEdit(!passwordEdit);
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
        {!passwordEdit && (
          <View>
            <Subheading text="Passwort ändern" />
          </View>
        )}
        {passwordEdit ? (
          <View className="w-full">
            <Subheading text="Aktuelle Passwort" />
            <TextFieldInput />
            <Subheading text="Neues Passwort" />
            <TextFieldInput />
            <Subheading text="Neues Passwort wiederholen" />
            <TextFieldInput />
            <DefaultButton
              text="Passwort ändern"
              onPress={() => setPasswordEdit(false)}
            />
          </View>
        ) : (
          <View>
            <View>
              <EditButton onPress={handlePasswordEditPress} />
            </View>
          </View>
        )}
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
