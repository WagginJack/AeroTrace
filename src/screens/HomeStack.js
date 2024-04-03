import * as React from 'react';
import { Button, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './Home';
import Bluetooth from './Bluetooth';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Bluetooth" component={Bluetooth} />
    </Stack.Navigator>
  );
}

export default HomeStack