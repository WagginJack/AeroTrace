import * as React from 'react';
import { StyleSheet, Button, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ImageButton from '../../components/ImageButton';


const Home = ({navigation}) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Home screen</Text>
{/* 
          <ImageButton 
        onPress={() => navigation.navigate('Bluetooth')} 
        imageStyle={styles.image} 
        source={require("../../assets/icon.png")}
      /> */}
        </View>
      );
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    smallText: {
        color: "#000000"
    },
    image: {
      // backgroundColor: "#000000",
      width: 50,
      height: 50
    }
})