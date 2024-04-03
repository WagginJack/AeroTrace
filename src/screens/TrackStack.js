import * as React from 'react';
import { Button, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Track from './Track';
import Bluetooth from './Bluetooth';

const Stack = createNativeStackNavigator();

const TrackStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Track" component={Track} />
      <Stack.Screen name="Bluetooth" component={Bluetooth} />
    </Stack.Navigator>
  );
}

export default TrackStack