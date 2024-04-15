import React from 'react';
import Icon from 'react-native-vector-icons/AntDesign';  
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
            tabBarShowLabel: true,
            title: "Home",
            headerShown: false,
            tabBarIcon: () => <Icon name="home" size={25}/>,
          }}
        />
        <Tab.Screen
          name='TrackStack'
          component={TrackStack}
          options={{
            tabBarShowLabel: true,
            title: "Track",
            headerShown: false,
            tabBarIcon: () => <Icon name="enviromento" size={25}/>,
          }}
        />
        <Tab.Screen
          name='Setting'
          component={Settings}
          options={{
            tabBarShowLabel: true,
            title: "Settings",
            tabBarIcon: () => <Icon name="setting" size={25}/>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App;
