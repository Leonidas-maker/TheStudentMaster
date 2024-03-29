import React, { useState } from 'react';
import { View, LayoutAnimation, UIManager, Platform } from 'react-native';
import 'nativewind';
import { addWeeks, subWeeks } from 'date-fns';
import { FlingGestureHandler, Directions } from 'react-native-gesture-handler';

import Days from './Days';
import Weeks from './Weeks';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

//? Maybe use other transition 

const WeekCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const animateTransition = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const handleBackPress = () => {
        animateTransition();
        setCurrentDate(current => subWeeks(current, 1));
    };

    const handleForwardPress = () => {
        animateTransition();
        setCurrentDate(current => addWeeks(current, 1));
    };

    const handleTodayPress = () => {
        animateTransition();
        setCurrentDate(new Date());
    };

    return (
        <FlingGestureHandler
            direction={Directions.LEFT}
            onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === 5) handleForwardPress();
            }}
        >
            <FlingGestureHandler
                direction={Directions.RIGHT}
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === 5) handleBackPress();
                }}
            >
                <View className="h-full flex-1">
                    <Weeks onBackPress={handleBackPress} onForwardPress={handleForwardPress} onTodayPress={handleTodayPress} />

                    <Days currentDate={currentDate} />

                </View>
            </FlingGestureHandler>
        </FlingGestureHandler >
    );
};

export default WeekCalendar;
