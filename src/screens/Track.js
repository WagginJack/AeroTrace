import { ImageBackground, Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ImageButton from '../../components/ImageButton';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const Track = ({ navigation }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Track screen</Text>
            <View style={styles.bluetooth}>
                <ImageButton
                    onPress={() => navigation.navigate('Bluetooth')}
                    imageStyle={styles.image_bluetooth}
                    source={require("../../assets/icon.png")}
                />
            </View>
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
        backgroundColor: "#71dc71",
    },
    bluetooth: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#71dc71",
        // when bluetooth is disconected use #dc7171
        borderRadius: 25
    },
})