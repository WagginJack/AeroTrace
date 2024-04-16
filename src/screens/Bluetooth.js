import React, { useState, useEffect } from 'react';
import {
  Text,
  Alert,
  ScrollView,
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
  StyleSheet,
  Dimensions,
} from 'react-native';
import BleManager from 'react-native-ble-manager';//still planning to use PLX Instead of this today
import { DeviceList } from '../../components/DeviceList';
import { Colors } from 'react-native/Libraries/NewAppScreen';

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

    BleManager.start({ showAlert: false }).then(() => {
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
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{ pdadingHorizontal: 20 }}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          Bluetooth Connect
        </Text>
        <TouchableOpacity
          onPress={scan}
          activeOpacity={0.5}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          Discovered Devices:
        </Text>
        {discoveredDevices.length > 0 ? (
          <FlatList
          style={styles.FlatList}
            data={discoveredDevices}
            renderItem={({ item }) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
        )}

        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          Connected Devices:
        </Text>
        {connectedDevices.length > 0 ? (
          <FlatList
          style={styles.FlatList}
            data={connectedDevices}
            renderItem={({ item }) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noDevicesText}>No connected devices</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Bluetooth;

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: windowHeight,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 10,
    marginTop: 20,
  },
  scanButton: {
    backgroundColor: '#71dc71',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  FlatList: {
    maxHeight: 150,
  }
})

// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */

// import React, {Component} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableHighlight,
//   NativeEventEmitter,
//   NativeModules,
//   Platform,
//   PermissionsAndroid,
//   FlatList,
//   ScrollView,
//   AppState,
//   Dimensions,
//   Item,
// } from 'react-native';

// import BleManager from 'react-native-ble-manager';
// const window = Dimensions.get('window');
// const BleManagerModule = NativeModules.BleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// export default class Bluetooth extends Component {
//   constructor() {
//     super();

//     this.state = {
//       scanning: false,
//       peripherals: new Map(),
//       appState: '',
//     };

//     this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
//     this.handleStopScan = this.handleStopScan.bind(this);
//     this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
//       this,
//     );
//     this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
//       this,
//     );
//     this.handleAppStateChange = this.handleAppStateChange.bind(this);
//   }

//   componentDidMount() {
//     AppState.addEventListener('change', this.handleAppStateChange);

//     BleManager.start({showAlert: false});

//     this.handlerDiscover = bleManagerEmitter.addListener(
//       'BleManagerDiscoverPeripheral',
//       this.handleDiscoverPeripheral,
//     );
//     this.handlerStop = bleManagerEmitter.addListener(
//       'BleManagerStopScan',
//       this.handleStopScan,
//     );
//     this.handlerDisconnect = bleManagerEmitter.addListener(
//       'BleManagerDisconnectPeripheral',
//       this.handleDisconnectedPeripheral,
//     );
//     this.handlerUpdate = bleManagerEmitter.addListener(
//       'BleManagerDidUpdateValueForCharacteristic',
//       this.handleUpdateValueForCharacteristic,
//     );

//     if (Platform.OS === 'android' && Platform.Version >= 23) {
//       PermissionsAndroid.check(
//         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//       ).then(result => {
//         if (result) {
//           console.log('Permission is OK');
//         } else {
//           PermissionsAndroid.requestPermission(
//             PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//           ).then(result => {
//             if (result) {
//               console.log('User accept');
//             } else {
//               console.log('User refuse');
//             }
//           });
//         }
//       });
//     }
//   }

//   handleAppStateChange(nextAppState) {
//     if (
//       this.state.appState.match(/inactive|background/) &&
//       nextAppState === 'active'
//     ) {
//       console.log('App has come to the foreground!');
//       BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
//         console.log('Connected peripherals: ' + peripheralsArray.length);
//       });
//     }
//     this.setState({appState: nextAppState});
//   }

//   componentWillUnmount() {
//     this.handlerDiscover.remove();
//     this.handlerStop.remove();
//     this.handlerDisconnect.remove();
//     this.handlerUpdate.remove();
//   }

//   handleDisconnectedPeripheral(data) {
//     let peripherals = this.state.peripherals;
//     let peripheral = peripherals.get(data.peripheral);
//     if (peripheral) {
//       peripheral.connected = false;
//       peripherals.set(peripheral.id, peripheral);
//       this.setState({peripherals});
//     }
//     console.log('Disconnected from ' + data.peripheral);
//   }

//   handleUpdateValueForCharacteristic(data) {
//     console.log(
//       'Received data from ' +
//         data.peripheral +
//         ' characteristic ' +
//         data.characteristic,
//       data.value,
//     );
//   }

//   handleStopScan() {
//     console.log('Scan is stopped');
//     this.setState({scanning: false});
//   }

//   startScan() {
//     if (!this.state.scanning) {
//       this.setState({peripherals: new Map()});
//       BleManager.scan([], 3, true).then(results => {
//         console.log('Scanning...');
//         this.setState({scanning: true});
//       });
//     }
//   }

//   retrieveConnected() {
//     BleManager.getConnectedPeripherals([]).then(results => {
//       if (results.length == 0) {
//         console.log('No connected peripherals');
//       }
//       console.log(results);
//       var peripherals = this.state.peripherals;
//       for (var i = 0; i < results.length; i++) {
//         var peripheral = results[i];
//         peripheral.connected = true;
//         peripherals.set(peripheral.id, peripheral);
//         this.setState({peripherals});
//       }
//     });
//   }

//   handleDiscoverPeripheral(peripheral) {
//     var peripherals = this.state.peripherals;
//     if (!peripherals.has(peripheral.id)) {
//       peripherals.set(peripheral.id, peripheral);
//       this.setState({peripherals});
//     }
//   }

//   test(peripheral) {
//     if (peripheral) {
//       if (peripheral.connected) {
//         BleManager.disconnect(peripheral.id);
//       } else {
//         BleManager.connect(peripheral.id)
//           .then(() => {
//             let peripherals = this.state.peripherals;
//             let p = peripherals.get(peripheral.id);
//             if (p) {
//               p.connected = true;
//               peripherals.set(peripheral.id, p);
//               this.setState({peripherals});
//             }
//             console.log('Connected to ' + peripheral.id);

//             setTimeout(() => {
//               /* Test read current RSSI value
//             BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
//               console.log('Retrieved peripheral services', peripheralData);
//               BleManager.readRSSI(peripheral.id).then((rssi) => {
//                 console.log('Retrieved actual RSSI value', rssi);
//               });
//             });*/

//               // Test using bleno's pizza example
//               // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
//               BleManager.retrieveServices(peripheral.id).then(
//                 peripheralInfo => {
//                   console.log(peripheralInfo);
//                   var service = 'FFFF';
//                   var readAndNotiService =
//                     'FF02';
//                   var writeService = 'FF01';

//                   setTimeout(() => {
//                     BleManager.startNotification(
//                       peripheral.id,
//                       service,
//                       readAndNotiService,
//                     )
//                       .then(() => {
//                         console.log('Started notification on ' + peripheral.id);
//                         setTimeout(() => {
//                           BleManager.write(
//                             peripheral.id,
//                             service,
//                             writeService,
//                             [0],
//                           ).then(() => {
//                             console.log('Writed NORMAL crust');
//                             BleManager.write(
//                               peripheral.id,
//                               service,
//                               writeService,
//                               [1, 95],
//                             ).then(() => {
//                               console.log(
//                                 'Writed 351 temperature, the pizza should be BAKED',
//                               );
//                               /*
//                         var PizzaBakeResult = {
//                           HALF_BAKED: 0,
//                           BAKED:      1,
//                           CRISPY:     2,
//                           BURNT:      3,
//                           ON_FIRE:    4
//                         };*/
//                             });
//                           });
//                         }, 500);
//                       })
//                       .catch(error => {
//                         console.log('Notification error', error);
//                       });
//                   }, 200);
//                 },
//               );
//             }, 900);
//           })
//           .catch(error => {
//             console.log('Connection error', error);
//           });
//       }
//     }
//   }

//   render() {
//     const list = Array.from(this.state.peripherals.values());
//     console.log(list);
//     return (
//       <View style={styles.container}>
//         <TouchableHighlight
//           style={{
//             marginTop: 40,
//             margin: 20,
//             padding: 20,
//             backgroundColor: '#ccc',
//           }}
//           onPress={() => this.startScan()}>
//           <Text>Scan Bluetooth ({this.state.scanning ? 'on' : 'off'})</Text>
//         </TouchableHighlight>
//         <TouchableHighlight
//           style={{
//             marginTop: 0,
//             margin: 20,
//             padding: 20,
//             backgroundColor: '#ccc',
//           }}
//           onPress={() => this.retrieveConnected()}>
//           <Text>Retrieve connected peripherals</Text>
//         </TouchableHighlight>
//         <ScrollView style={styles.scroll}>
//           {list.length == 0 && (
//             <View style={{flex: 1, margin: 20}}>
//               <Text style={{textAlign: 'center'}}>No peripherals</Text>
//             </View>
//           )}
//           <FlatList
//             data={list}
//             renderItem={({item}) => {
//               // console.log(item);
//               // const color = item.connected ? 'green' : '#fff';
//               return (
//                 <TouchableHighlight onPress={() => this.test(item)}>
//                   <View style={[styles.row, {backgroundColor: '#fff'}]}>
//                     <Text
//                       style={{
//                         fontSize: 12,
//                         textAlign: 'center',
//                         color: '#333333',
//                         padding: 10,
//                       }}>
//                       {item.name}
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 8,
//                         textAlign: 'center',
//                         color: '#333333',
//                         padding: 10,
//                       }}>
//                       {item.id}
//                     </Text>
//                   </View>
//                 </TouchableHighlight>
//               );
//             }}
//             // keyExtractor={item => item.id}
//           />
//         </ScrollView>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//     width: window.width,
//     height: window.height,
//   },
//   scroll: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//     margin: 10,
//   },
//   row: {
//     margin: 10,
//   },
// });