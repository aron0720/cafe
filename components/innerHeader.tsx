import { View, Dimensions, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

export default function InnerHeader() {
    const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기

    const Router = useRouter(); // 라우터 가져오기

    return (
        <View style={{ padding: 10,  backgroundColor: '#eee', borderRadius: 8, width: width, flexDirection: 'row' }}>
            <TouchableOpacity 
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginLeft: 5 }}
                onPress={() => Router.back()}
            >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>나가기</Text>
            </TouchableOpacity>
        </View>
    )
}