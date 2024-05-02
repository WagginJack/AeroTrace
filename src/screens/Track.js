import { ImageBackground, Button, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useDebugValue } from 'react';
import ImageButton from '../../components/ImageButton';
import MapView, { Marker, Polyline, } from 'react-native-maps';

// These are for BLE listener events
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
const { BleManagerModule } = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let count = 0;
let shiftFlag = false;
let latitude = [];
let longitude = [];
//let coordinates = [];
let altitude = [];
let speed = [];
let angle = [];
//global variables keeping track of highest speed
let tempLat = 0;
let maxSpeed = 0;
let maxSpeed_latitude = 0;
let maxSpeed_longitude = 0;
let maxSpeed_altitude = 0;
let maxSpeed_angle = 0;
//globalvariables for current variables

let maxBLEnameOutput = 0;

let firstCoordinate = 0;

let resetCoordinates = 0;

const Track = ({ navigation }) => {

    const [currentLatitude, setCurrentLatitude] = useState(0);
    const [currentLongitude, setCurrentLongitude] = useState(0);
    const [currentAltitude, setCurrentAltitude] = useState(null);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [currentAngle, setCurrentAngle] = useState(0);
    const [coordinates, setCoordinates] = useState([{ latitude: 0, longitude: 0 },]);

    let incomingNotification = "";

    const RNFS = require('react-native-fs');
    const path = RNFS.DocumentDirectoryPath + '/BLEID.txt';

    let BLEname = "";

    RNFS.readFile(path, 'utf8')
        .then((content) => {
            if (maxBLEnameOutput == 0 && content != "") {
                console.log('BLEname is:', content);
                if (content != "") {
                    BLEname = content;
                    maxBLEnameOutput = 1;
                }
            }
            else if (maxBLEnameOutput == 1 && content != "") {
                BLEname = content;
                maxBLEnameOutput = 1;
            }
            else if (content == "") {
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

    // const updateCoordinates = () => {
    //     console.log("Adding Lat: " + currentLatitude + " and Long: " + currentLongitude);
    //     const nextCoordinates = [
    //         // Items before the insertion point: 
    //         ...coordinates.slice(0, 59),
    //         // New item:
    //         {latitude: currentLatitude, longitude: currentLongitude},
    //     ];
    //     console.log("AllCoordinates are", nextCoordinates)
    //     setCoordinates(nextCoordinates);
    // }

    useEffect(() => {
        if (resetCoordinates == 1){
            setCoordinates([]);
        }
        else if (currentLatitude != 0 && currentLongitude != 0) {
            if (firstCoordinate == 0){
                let newCoordinate = { latitude: currentLatitude, longitude: currentLongitude };
                setCoordinates([newCoordinate]);
                firstCoordinate++;
            }
            else{
                let newCoordinate = { latitude: currentLatitude, longitude: currentLongitude };
                setCoordinates(prevCoordinates => [...prevCoordinates, newCoordinate]);
            }
        }
    }, [currentLongitude]);

    useEffect(() => {
        const subscription = bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral, characteristic, service }) => {
                //console.log(String.fromCharCode(...value)); //console logging received data
                incomingNotification = (String.fromCharCode(...value));
                if (incomingNotification.includes("Waiting")) {
                    console.log(incomingNotification);
                }
                else if (incomingNotification.includes("LA:")) {
                    shiftFlag = false;
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    tempLat = incomingNotification;
                    //setCurrentLatitude(incomingNotification);
                    console.log("Latitude: ", incomingNotification);
                }
                else if (incomingNotification.includes("LO:")) {
                    //console.log(incomingNotification);
                    //incomingNotification = incomingNotification.substring(5);
                    incomingNotification = incomingNotification.replace("LO:", "");
                    //console.log("before ParseFloat: " + incomingNotification);
                    incomingNotification = parseFloat(incomingNotification);

                    //setCurrentLongitude(incomingNotification);
                    //console.log(Math.abs(incomingNotification - longitude[0]) + Math.abs(latitude[0] - latitude[1]));
                    console.log("Longitude: ", incomingNotification);
                    //longitude.unshift(incomingNotification);
                    //if (((typeof incomingNotification) != "number") || ((typeof tempLat) != "number")){
                    if (!Number.isFinite(incomingNotification) || !Number.isFinite(tempLat)) {
                        console.log("invalid lat/long");
                    }
                    // else if (count > 0) {
                    //     console.log("Lat&Long Difference: ",Math.abs(incomingNotification - currentLongitude) + Math.abs(tempLat - currentLatitude));
                    //     if ((Math.abs(incomingNotification - currentLongitude) + Math.abs(tempLat - currentLatitude)) > 0.000000000) {
                    //         //latitude.unshift(tempLat);
                    //         //longitude.unshift(incomingNotification);
                    //         //coordinates.unshift({ latitude: latitude[0], longitude: longitude[0] });
                    //         //setCurrentCoordinate(coordinates[0]);
                    //         setCurrentLongitude(incomingNotification);
                    //         setCurrentLatitude(tempLat);
                    //         updateCoordinates();
                    //         console.log("Longitude: ", incomingNotification);
                    //         count++;
                    //     }
                    // }
                    else {
                        latitude.unshift(tempLat);
                        longitude.unshift(incomingNotification);
                        setCurrentLatitude(tempLat);
                        setCurrentLongitude(incomingNotification);
                        console.log("Adding Lat: " + currentLatitude + " and Long: " + currentLongitude);
                        // let newCoordinate = {latitude: currentLatitude, longitude: currentLongitude};
                        // console.log("New coordinates: ", newCoordinate);
                        // setCoordinates(coordinates => [...coordinates, newCoordinate]);
                        // console.log("All Coordinates are", coordinates);
                        //updateCoordinates();nnnn    nn
                        count++;
                    }
                }



                else if (incomingNotification.includes("AL:") && shiftFlag == false) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    setCurrentAltitude(incomingNotification);
                    altitude.unshift(incomingNotification);
                    console.log("Altitude: ", incomingNotification);

                }
                else if (incomingNotification.includes("SP:") && shiftFlag == false) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    setCurrentSpeed(incomingNotification);
                    if (maxSpeed < incomingNotification) {
                        maxSpeed = incomingNotification;
                    }
                    speed.unshift(incomingNotification);
                    console.log("Speed: ", incomingNotification);

                }
                else if (incomingNotification.includes("TA:") && shiftFlag == false) {
                    incomingNotification = incomingNotification.substring(3);
                    incomingNotification = parseFloat(incomingNotification);
                    setCurrentAngle(incomingNotification);
                    angle.unshift(incomingNotification);
                    console.log("Track Angle: ", incomingNotification);

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
                        coordinate={{ latitude: currentLatitude, longitude: currentLongitude }}
                    />


                    <Polyline
                        coordinates={coordinates}
                        strokeColor={"#000000"}
                        strokeWidth={5}
                    />

                    {/* <Polyline
                        coordinates={currentCoordinate}
                        strokeColor="#000"
                        strokeWidth={6}
                    /> */}

                    {/* d.segments.map((c) => (
                    <Polyline
                        coordinates={c.coordinates.map(c => ({ latitude: c[0], longitude: c[1] }))}
                        strokeColor="#000"
                        strokeWidth={6}>
                    </Polyline>
                    )) */}


                    {/* {
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
                        )} */}
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
            <Text>Speed: {currentSpeed} mph</Text>
            <Text>Heading: {currentAngle} °X</Text>
            <Text>Altitude: {currentAltitude} ft</Text>
            <Text>Latitude: {currentLatitude} °</Text>
            <Text>Longitude: {currentLongitude} °</Text>
            <Text>Distance: _____ ft</Text>

            {/* Incoming Bluetooth Notification */}
            <Text>Message: {incomingNotification}</Text>

            <Button
                color="#71dc71"
                title="Reset"

                onPress={() => {
                    console.log("Reset Button Pressed");
                    console.log(coordinates);
                    console.log("Latitude Length", latitude.length);
                    maxSpeed = 0;
                    console.log("Max Speed: ", maxSpeed);
                    count = 0;
                    resetCoordinates = 1;
                    setCurrentAltitude(null);
                    setCurrentLatitude(0);
                    setCurrentLongitude(0);
                    setCurrentSpeed(0);
                    setCurrentAngle(0);
                }}
            />

            <View style={{ padding: '5%' }}>
                <Button
                    color="#0082FC"
                    title="Reconnect"
                    onPress={() => {
                        console.log("Reconnecting to: ", BLEname);
                        startScan();
                    }}
                />
            </View>
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