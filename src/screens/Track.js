import { ImageBackground, Button, StyleSheet, Text, View} from 'react-native'
import React, { useState, useEffect, useDebugValue } from 'react';
import ImageButton from '../../components/ImageButton';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// These are for BLE listener events
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
const { BleManagerModule } = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const Track = ({ navigation }) => {

    const RNFS = require('react-native-fs');
    const path = RNFS.DocumentDirectoryPath + '/BLEID.txt';

    let BLEname = "";

    RNFS.readFile(path, 'utf8')
        .then((content) => {
          console.log('BLEname is:', content);
          if (content != ""){
            BLEname = content;
          }
          else{
                console.log('BLEname is empty');
          }
        })
        .catch((err) => {
          console.log('Failed to read file:', err);
        });

    useEffect(() => {
        startScan();
      }, []); //

      const [devices, setDevices] = useState([]);
      const [scanning, setScanning] = useState(false);
    
      //const [NotificationOn, setNotificationOn] = useState(false);
      
      useEffect(() => {
        BleManager.start({ showAlert: false });
    
        return () => {
          BleManager.stopScan();
        };
      }, []);

    useEffect(() => {
          const subscription = bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral, characteristic, service }) => {
              console.log(String.fromCharCode(...value)); //console logging received data
            }
          );
          // Clean up the listener on component unmount
          return () => subscription.remove();
      }, []); // Re-run the effect when `NotificationOn` changes

const startScan = () => {
    setScanning(true);
    BleManager.scan([], 2, true).then(() => {
      console.log('Scanning...');
    });
  
    setTimeout(() => {
      setScanning(false);
      BleManager.getDiscoveredPeripherals([]).then((results) => {
        // Filter out devices with name "UNKNOWN"
        
        console.log('Discovered devices:', results.map(device => device.name));



        const filteredResults = results.filter((device) => device.name != null );
        setDevices(filteredResults);

        console.log("filteredResults: ", filteredResults);
  
        // // Log the name of each discovered device
        // filteredResults.forEach((device) => {
        //   console.log("Connecting to ... " + device);
        // });
    filteredResults.forEach((device) => {
        if (device.name === BLEname) {
            console.log("Made it here!")
            connectToDevice(device);
        }
    });
    
    });
    }, 10000);
  };


const connectToDevice = (device) => {
        BleManager.connect(device.id).then(() => {
          console.log('Connected to device:', device.name);
          BleManager.retrieveServices(device.id).then((peripheralInfo) => {
            console.log('Peripheral info:', peripheralInfo);
            const serviceUUID = 'adaf0001-4369-7263-7569-74507974686e';
            const characteristicUUID = 'adaf0003-4369-7263-7569-74507974686e';
            BleManager.startNotification(device.id, serviceUUID, characteristicUUID).then(() => {
              console.log('Notifications started');
              //setNotificationOn(true); // This will cause a re-render
            }).catch((error) => {
              console.log('Failed to start notifications:', error);
            });
          }).catch((error) => {
            console.log('Failed to retrieve peripheral services:', error);
          });
        }).catch((error) => {
          console.log('Failed to connect to device:', error);
        });
      };





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