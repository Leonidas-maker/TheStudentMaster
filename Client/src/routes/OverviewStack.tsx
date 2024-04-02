import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Dashboard from '../screens/dashboard/Dashboard';
import Loading from '../screens/loading/Loading';
import Overview from '../screens/overview/Overview';
import Dualis from '../screens/dualis/Dualis';
import Flashcards from '../screens/flashcards/Flashcards';
import MealPlan from '../screens/mealPlan/MealPlan';
import Settings from '../screens/settings/Settings';
import Imprint from '../screens/imprint/Imprint';
import Credits from '../screens/credits/Credits';
import Profile from '../screens/profile/Profile';
import ResponsibleDisclosure from '../screens/responsibleDisclosure/ResponsibleDisclosure';

const Stack = createStackNavigator();

function OverviewStack() {
    return (
        <>
            <StatusBar barStyle="light-content" />
            <Stack.Navigator initialRouteName="Overview"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#171717'
                },
                headerTintColor: '#E0E0E2'
            }} >
                <Stack.Screen
                    name="Overview"
                    component={Overview}
                    options={{ headerShown: true }}
                />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Loading" component={Loading} />
                <Stack.Screen name="Dualis" component={Dualis} />
                <Stack.Screen name="MealPlan" component={MealPlan} />
                <Stack.Screen name="Flashcards" component={Flashcards} />
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="Imprint" component={Imprint} />
                <Stack.Screen name="Credits" component={Credits} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="ResponsibleDisclosure" component={ResponsibleDisclosure} />
            </Stack.Navigator>
        </>
    );
}

export default OverviewStack;
