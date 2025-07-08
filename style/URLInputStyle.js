import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const URLInputStyle = StyleSheet.create({
    total_container: {
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: 10,
        borderRadius: 8, 
        width: width,
        flexDirection: 'row',
    },

    text_input: {
        backgroundColor: '#2e2e2e',
        borderWidth: 1,
        borderColor: '#555',
        padding: 5, 
        marginTop: 10,
        color: '#ffffff',
        width: width * 0.7,
        borderRadius: 5,
    },
});