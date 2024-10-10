import React from "react";
import { ScrollView } from "react-native";

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import Heading from "../../components/textFields/Heading";
import Subheading from "../../components/textFields/Subheading";

const DualisSemester: React.FC = () => {
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <Heading text="Dualis" />
      <Subheading text="Semester..." />
    </ScrollView>
  );
};

export default DualisSemester;