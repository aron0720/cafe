import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const outputLayoutStyle = StyleSheet.create({
    total_container: {
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: 10,
        borderRadius: 8,
        width: width,
        height: height * 0.89,
    },

    webview: {
        width: '100%',
        height: height * 0.75,
        backgroundColor: '#2e2e2e',
        color: '#d4d4d4',
    }
});