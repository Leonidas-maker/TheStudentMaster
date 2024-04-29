import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardSVG from '../../public/images/svg/navigatorIcons/inactive/DashboardSVG';
import ActiveDashboardSVG from '../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG';
import DualisSVG from '../../public/images/svg/navigatorIcons/inactive/DualisSVG';
import ActiveDualisSVG from '../../public/images/svg/navigatorIcons/active/ActiveDualisSVG';
import MealPlanSVG from '../../public/images/svg/navigatorIcons/inactive/MealPlanSVG';
import ActiveMealPlanSVG from '../../public/images/svg/navigatorIcons/active/ActiveMealPlanSVG';
import OverviewSVG from '../../public/images/svg/navigatorIcons/inactive/OverviewSVG';
import ActiveOverviewSVG from '../../public/images/svg/navigatorIcons/active/ActiveOverviewSVG';

import Dashboard from '../screens/dashboard/Dashboard';
import Dualis from '../screens/dualis/Dualis';
import MealPlan from '../screens/mealPlan/MealPlan';
import OverviewStack from './OverviewStack';

const Tab = createBottomTabNavigator();

function HomeBottomTabs() {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="light-content" />
            <Tab.Navigator
                initialRouteName="Dashboard"
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#171717',
                    },
                    tabBarStyle: { backgroundColor: '#171717' },
                    headerTintColor: '#f5f5f5',
                    tabBarActiveTintColor: '#780000',
                    tabBarInactiveTintColor: '#c1121f',
                    
                }}
            >
                <Tab.Screen
                    name="Stundenplan"
                    component={Dashboard}
                    options={{
                        headerTitle: 'TheStudentMaster',
                        tabBarIcon: ({ color, size, focused }) => {
                            if (focused) {
                                return <ActiveDashboardSVG width={size} height={size} fill={color} />;
                            } else {
                                return <DashboardSVG width={size} height={size} fill={color} />;
                            }
                        },
                    }}
                />
                <Tab.Screen
                    name="Dualis"
                    component={Dualis}
                    options={{
                        headerTitle: 'TheStudentMaster',
                        tabBarIcon: ({ color, size, focused }) => {
                            if (focused) {
                                return <ActiveDualisSVG width={size} height={size} fill={color} />;
                            } else {
                                return <DualisSVG width={size} height={size} fill={color} />;
                            }
                        },
                    }}
                />
                <Tab.Screen
                    name="Essensplan"
                    component={MealPlan}
                    options={{
                        headerTitle: 'TheStudentMaster',
                        tabBarIcon: ({ color, size, focused }) => {
                            if (focused) {
                                return <ActiveMealPlanSVG width={size} height={size} fill={color} />;
                            } else {
                                return <MealPlanSVG width={size} height={size} fill={color} />;
                            }
                        },
                    }}
                />
                <Tab.Screen
                    name="Weiteres"
                    component={OverviewStack}
                    options={{
                        headerTitle: 'Page navigator',
                        headerShown: false,
                        tabBarIcon: ({ color, size, focused }) => {
                            if (focused) {
                                return <ActiveOverviewSVG width={size} height={size} fill={color} />;
                            } else {
                                return <OverviewSVG width={size} height={size} fill={color} />;
                            }
                        },
                    }}
                />
            </Tab.Navigator>
        </SafeAreaProvider>
    );
}

export default HomeBottomTabs;