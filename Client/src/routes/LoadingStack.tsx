import { createStackNavigator } from '@react-navigation/stack';
import Loading from '../screens/loading/Loading';
import HomeBottomTabs from './HomeBottomTabs';
import OverviewStack from './OverviewStack';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator();

function LoadingStack() {
    return (
        <>
            <StatusBar barStyle="light-content" />
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#232D3F' }
                }}
            >
                <Stack.Screen name="Loading" component={Loading} />
                <Stack.Screen name="HomeBottomTabs" component={HomeBottomTabs} />
                <Stack.Screen name="OverviewStack" component={OverviewStack} />
            </Stack.Navigator>
        </>
    );
}

export default LoadingStack;
