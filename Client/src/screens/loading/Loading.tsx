import { useEffect }  from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ActivityIndicator } from "react-native";

const Loading = (props: any) => {
	const { navigation } = props;

	const { t } = useTranslation();

	const navigateAndReset = () => {
		navigation.reset({
		  index: 0,
		  routes: [{ name: 'HomeBottomTabs' }],
		});
	  }

	  //! This is a temporary solution while we do not have any checks for the user being logged in or not
	  useEffect(() => {
		setTimeout(() => {
		  navigateAndReset();
		}, 2000);
	  }, []);

	return (
		<View className='flex h-screen items-center justify-center bg-primary'>
			<ActivityIndicator size="large" />
			<Text className='text-font_primary font-bold p-5'>Loading...</Text>
		</View>
	);
};

export default Loading;