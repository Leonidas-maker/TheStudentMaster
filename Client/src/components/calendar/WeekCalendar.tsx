import React, { useState } from 'react';
import { View, LayoutAnimation, UIManager, Platform } from 'react-native';
import 'nativewind';
import { addWeeks, subWeeks } from 'date-fns';
import { FlingGestureHandler, Directions } from 'react-native-gesture-handler';

import Days from './Days';
import Weeks from './Weeks';

// Important for LayoutAnimation on Android according to the docs
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

//? Maybe use other transition 

const WeekCalendar: React.FC = () => {
    // Gets the current date
    const [currentDate, setCurrentDate] = useState(new Date());

    // Defines the animation for the transition between weeks (animation: easeInEaseOut)
    const animateTransition = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    // Handles the back press by subtracting a week from the current displayed date
    const handleBackPress = () => {
        animateTransition();
        setCurrentDate(current => subWeeks(current, 1));
    };

    // Handles the forward press by adding a week to the current displayed date
    const handleForwardPress = () => {
        animateTransition();
        setCurrentDate(current => addWeeks(current, 1));
    };

    // Handles the today press by setting the current displayed date to the current date
    const handleTodayPress = () => {
        animateTransition();
        setCurrentDate(new Date());
    };

    // nativeEvent.state === 5 is the end of the gesture
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
