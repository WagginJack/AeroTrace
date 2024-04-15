import React from 'react';
import { AntDesign } from '@expo/vector-icons';
// import type { PropsWithChildren} from 'react';Push to Mac
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
// import {enableLatestRenderer} from 'react-native-maps';

// enableLatestRenderer();

//Navigation
import {NavigationContainer} from "@react-navigation/native"
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//Screens
import HomeStack from './screens/HomeStack';
import TrackStack from './screens/TrackStack';
import Settings from './screens/Settings'

// export type RootStackParamList = {
//    Home: undefined;
//    Track: {productId: string}
//    Settings: {productId: string}
// };

const Tab = createBottomTabNavigator()

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName='HomeStack'>
        <Tab.Screen
          name='HomeStack'
          component={HomeStack}
          options={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarIcon: () => (
              <AntDesign name="home" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name='TrackStack'
          component={TrackStack}
          options={{
            tabBarShowLabel: false,
            headerShown: false
          }}
        />
        <Tab.Screen
          name='Settings'
          component={Settings}
          options={{
            tabBarShowLabel: false,
            title: "Settings"
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App;
