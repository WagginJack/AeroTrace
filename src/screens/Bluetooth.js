// import { View, Text, StyleSheet ,
//     Platform,
//     NativeModules,
//     useColorScheme,
//     NativeEventEmitter,
//     PermissionsAndroid,
//   } from 'react-native';
// import React from 'react'
// import BleManager from 'react-native-ble-manager';
// import { NavigationContainer } from "@react-navigation/native"


// BleManager.start({ showAlert: false }).then(() => {
//     // Success code
//     console.log("Module initialized");
//   });


// //   BleManager.scan([], 5, true).then(() => {
// //     // Success code
// //     console.log("Scan started");
// //   });

// const Bluetooth = () => {
//     BleManager.enableBluetooth()
//         .then(() => {
//             // Success code
//             console.log("The bluetooth is already enabled or the user confirm");
//         })
//         .catch((error) => {
//             // Failure code
//             console.log("The user refuse to enable bluetooth");
//         });
//     BleManager.scan([], 5, true).then(() => {
//         //success
//         console.log("Scan Started")
//     });

//     BleManager.stopScan().then(() => {
//         // Success code
//         console.log("Scan stopped");
//       });

//     return (
//         <View>
//             <Text>Configure Bluetooth here</Text>
//         </View>
//     )
// }

// export default Bluetooth

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center"
//     },
//     smallText: {
//         color: "#000000"
//     }
// })

/*

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, {useState, useEffect} from 'react';
import {
  Text,
  Alert,
  View,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {DeviceList} from '../../components/DeviceList';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const Bluetooth = () => {
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);

  const handleLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.log('Error requesting location permission:', error);
      }
    }
  };

  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals([]).then(results => {
      for (let i = 0; i < results.length; i++) {
        let peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      }
    });
  };

  useEffect(() => {
    handleLocationPermission();

    BleManager.enableBluetooth().then(() => {
      console.log('Bluetooth is turned on!');
    });

    BleManager.start({showAlert: false}).then(() => {
      console.log('BleManager initialized');
      handleGetConnectedDevices();
    });

    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        peripherals.set(peripheral.id, peripheral);
        setDiscoveredDevices(Array.from(peripherals.values()));
      },
    );

    let stopConnectListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      peripheral => {
        console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );

    let stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('scan stopped');
      },
    );

    return () => {
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
    };
  }, []);

  const scan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const connect = peripheral => {
    BleManager.createBond(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        let devices = Array.from(peripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        console.log('BLE device paired successfully');
      })
      .catch(() => {
        throw Error('failed to bond');
      });
  };

  const disconnect = peripheral => {
    BleManager.removeBond(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        let devices = Array.from(peripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        throw Error('fail to remove the bond');
      });
  };

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView >
      <StatusBar
      />
      <View >
        <Text
          >
          React Native BLE Manager Tutorial
        </Text>
        <TouchableOpacity
          onPress={scan}
          activeOpacity={0.5}
          >
          <Text >
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>

        <Text
          >
          Discovered Devices:
        </Text>
        {discoveredDevices.length > 0 ? (
          <FlatList
            data={discoveredDevices}
            renderItem={({item}) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text >No Bluetooth devices found</Text>
        )}

        <Text
          >
          Connected Devices:
        </Text>
        {connectedDevices.length > 0 ? (
          <FlatList
            data={connectedDevices}
            renderItem={({item}) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text >No connected devices</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Bluetooth;