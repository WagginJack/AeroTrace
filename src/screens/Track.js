import { ImageBackground, Button, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useDebugValue } from 'react';
import ImageButton from '../../components/ImageButton';
import MapView, { Marker, Polyline, } from 'react-native-maps';

// These are for BLE listener events
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
const { BleManagerModule } = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const Track = ({ navigation }) => {

    let shiftFlag = false;
    let latitude = [];
    let longitude = [];
    let altitude = [];
    let speed = [];
    let angle = [];

    //global variables keeping track of highest speed
    let maxSpeed = 0;
    let maxSpeed_latitude = 0;
    let maxSpeed_longitude = 0;
    let maxSpeed_altitude = 0;
    let maxSpeed_angle = 0;


    let incomingNotification = "";

    const RNFS = require('react-native-fs');
    const path = RNFS.DocumentDirectoryPath + '/BLEID.txt';

    let BLEname = "";

    RNFS.readFile(path, 'utf8')
        .then((content) => {
            console.log('BLEname is:', content);
            if (content != "") {
                BLEname = content;
            }
            else {
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
                //console.log(String.fromCharCode(...value)); //console logging received data
                incomingNotification = (String.fromCharCode(...value));
                if (incomingNotification.includes("Waiting")) {
                    console.log("incomingNotification: ", incomingNotification);
                }
                else if (incomingNotification.includes("LA:")) {
                    shiftFlag = false;
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    latitude.push(incomingNotification);
                    console.log("incomingNotification: ", incomingNotification);

                }
                else if (incomingNotification.includes("LO:")) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    if ((longitude.length != 0) && (latitude.length != 1)) {
                        if (Math.abs(incomingNotification - longitude[0]) + Math.abs(latitude[0] - latitude[1]) > 0.0001) {
                            longitude.push(incomingNotification);
                            console.log("incomingNotification: ", incomingNotification);
                        }
                        else {
                            latitude.shift();
                            shiftFlag = true;
                        }
                    }

                }
                else if (incomingNotification.includes("AL:") && shiftFlag == false) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    altitude.push(incomingNotification);
                    console.log("incomingNotification: ", incomingNotification);

                }
                else if (incomingNotification.includes("SP:") && shiftFlag == false) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    if(maxSpeed < incomingNotification)
                    {
                        maxSpeed = incomingNotification;
                    }
                    speed.push(incomingNotification);
                    console.log("incomingNotification: ", incomingNotification);

                }
                else if (incomingNotification.includes("TA:") && shiftFlag == false) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    angle.push(incomingNotification);
                    console.log("incomingNotification: ", incomingNotification);

                }
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



                const filteredResults = results.filter((device) => device.name != null);
                setDevices(filteredResults);

                console.log("filteredResults: ", filteredResults);

                // // Log the name of each discovered device
                // filteredResults.forEach((device) => {
                //   console.log("Connecting to ... " + device);
                // });
                filteredResults.forEach((device) => {
                    if (device.name === BLEname) {
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

                    <Marker
                        //Map the most recent location of the device
                        coordinate={{ latitude: 38.957748413, longitude: -95.252746582 }}
                    />
                    {
                        speed.map((d) =>
                            d.segments.map((c) => (
                                <Polyline
                                    coordinates={c.coordinate}
                                    strokeColor="#000" the map-provider

                                    strokeWidth={6}>
                                    <Marker
                                        coordinate={{ latitude: 37.8025259, longitude: -122.4351431 }}
                                        title="Flatiron School Atlanta"
                                        description="This is where the magic happens!"></Marker>
                                </Polyline>
                            )),
                        )}
                    {/* 
                    <Polyline
                        //Map the path of the device in the last ~10 seconds
                        coordinates={[
                            { latitude: 38.957748413, longitude: -95.252746582 },
                            { latitude: 38.957648413, longitude: -95.252646582 },
                            { latitude: 38.957548413, longitude: -95.252600582 },
                            { latitude: 37.7734153, longitude: -122.4577787 },
                            { latitude: 37.7948605, longitude: -122.4596065 },
                            { latitude: 37.8025259, longitude: -122.4351431 },
                        ]}
                        strokeColor="#71dc71"
                        strokeWidth={3}
                    /> */}

                </MapView>
            </View>
            <Text>Speed: {speed[0]} mph</Text>
            <Text>Heading: _____ °X</Text>
            <Text>Altitude: {altitude[0]} ft</Text>
            <Text>Distance: _____ ft</Text>

            {/* Incoming Bluetooth Notification */}
            <Text>Message: {incomingNotification}</Text>

            <Button
                color="#71dc71"
                title="reset"

                onPress={() => {
                    console.log("Reset Button Pressed");
                    maxSpeed = 0;
                    console.log("Max Speed: ", maxSpeed);
                }}
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