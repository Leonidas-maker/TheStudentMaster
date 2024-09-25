import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  EmailCompressed,
  EmailDetailsHashTable,
  Email,
} from "../interfaces/email";

// Define the EmailStackParamList type
export type EmailStackParamList = {
  EmailDrawer: undefined;
  EmailDetails: {
    emailCompressed: EmailCompressed;
    emailDetailsRef: React.MutableRefObject<EmailDetailsHashTable>;
    changeSelectedEmail: React.MutableRefObject<Email | null>;
  };
};

// Define the EmailDetailsScreenProps type
export type EmailDetailsScreenNavigationProp = StackNavigationProp<
  EmailStackParamList,
  "EmailDetails"
>;
export type EmailDetailsScreenRouteProp = RouteProp<
  EmailStackParamList,
  "EmailDetails"
>;

export type EmailDetailsScreenProps = {
  navigation: EmailDetailsScreenNavigationProp;
  route: EmailDetailsScreenRouteProp;
};
