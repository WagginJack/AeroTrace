import { ImageBackground, Button, StyleSheet, Text, useEffect, View } from 'react-native'
import React from 'react'
import ImageButton from '../../components/ImageButton';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { NativeEventEmitter, NativeModules } from 'react-native';
const { BleManagerModule } = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// const connectToDevice = (device) => {
//     console.log("This is Device ID:" + device.id);
//     BleManager.connect(device.id).then(() => {
//       BLEid = device.id;
//       console.log('Connected to device:', device.name);
//       BleManager.retrieveServices(device.id).then((peripheralInfo) => {
//         console.log('Peripheral info:', peripheralInfo);
//         const serviceUUID = 'adaf0001-4369-7263-7569-74507974686e';
//         const characteristicUUID = 'adaf0003-4369-7263-7569-74507974686e';
//         BleManager.startNotification(device.id, serviceUUID, characteristicUUID).then(() => {
//           console.log('Notifications started');
//           //setNotificationOn(true); // This will cause a re-render
//         }).catch((error) => {
//           console.log('Failed to start notifications:', error);
//         });
//       }).catch((error) => {
//         console.log('Failed to retrieve peripheral services:', error);
//       });
//     }).catch((error) => {
//       console.log('Failed to connect to device:', error);
//     });
//   };



const Track = ({ navigation }) => {

    // useEffect(() => {
    //     BleManager.start({ showAlert: false });
    
    //     return () => {
    //       BleManager.stopScan();
    //     };
    //   }, []);

    // useEffect(() => {
    //     // if (NotificationOn == true) {     
    //       //console.log("NotificationOn status: " + NotificationOn);
    //       // Add listener for notifications
    //       const subscription = bleManagerEmitter.addListener(
    //         'BleManagerDidUpdateValueForCharacteristic',
    //         ({ value, peripheral, characteristic, service }) => {
    //           //console.log("converting to bytes");
    //           // Convert base64 string to byte array
    //           //let asciiText = String.fromCharCode(...value);
    //           // let binary = '';
    //           // for (let i = 0; i < bytes.length; i++) {
    //           //   binary += String.fromCharCode(bytes.charCodeAt(i));
    //           // }
    //           console.log(String.fromCharCode(...value)); //console logging received data
    //         }
    //       );
      
    //       // Clean up the listener on component unmount
    //       return () => subscription.remove();
    //     //}
    //   }, []); // Re-run the effect when `NotificationOn` changes





    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* <View style={styles.bluetooth}>
                <ImageButton
                    onPress={() => navigation.navigate('Bluetooth')}
                    imageStyle={styles.image_bluetooth}
                    source={require("../../assets/icon.png")}
                />
            </View> */}
            <View style={styles.map}>
                <MapView
                    // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    region={{
                        latitude: 38.957748413,
                        longitude: -95.252746582,
                        latitudeDelta: 0.0015,
                        longitudeDelta: 0.00120,
                    }}
                >
                </MapView>
            </View>
            <Text>Speed: _____ mph</Text>
            <Text>Heading: _____ °X</Text>
            <Text>Altitude: _____ ft</Text>
            <Text>Distance: _____ ft</Text>
            <Button
                color="#71dc71"
                title="reset"
                onPress={() => console.log("Reset Button Pressed")}
            />
        </View>
    );
}

export default Track

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    smallText: {
        color: "#000000"
    },
    image_bluetooth: {
        width: 35,
        height: 35
    },
    map: {
        width: 350,
        height: 250,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "#71dc71",
    },
    bluetooth: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#dc7171",
        // when bluetooth is conected use #71dc71
        borderRadius: 25
    },
})