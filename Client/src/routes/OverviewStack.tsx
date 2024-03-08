import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Dashboard from '../screens/dashboard/Dashboard';
import Loading from '../screens/loading/Loading';
import Overview from '../screens/overview/Overview';
import Dualis from '../screens/dualis/Dualis';
import Flashcards from '../screens/flashcards/Flashcards';
import MealPlan from '../screens/mealPlan/MealPlan';
import GeneralNavigator from '../components/navigator/ModuleNavigator';

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
            </Stack.Navigator>
        </>
    );
}

export default OverviewStack;
