/// <reference types="nativewind/types" />
import React from 'react';
import { Text, View } from "react-native";
import { styled } from 'nativewind';

import { NavigationContainer } from '@react-navigation/native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function App() {
  return (
    <NavigationContainer>
      <StyledView className='bg-black h-screen items-center justify-center'>
        <StyledText className='font-bold text-green-500'>This is a Native Wind Test!</StyledText>
      </StyledView>
    </NavigationContainer>
  );
}
