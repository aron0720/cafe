import { View, TextInput, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useRouter } from 'expo-router';

interface URLInputProps {
    url: string; // URL state
    setUrl: (url: string) => void; // function to set URL state
} // URLInput component props

export default function URLInput({ url, setUrl }: URLInputProps) {    
    const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기 
    const [tempValue, setTempValue] = useState(url); // 임시 URL 상태

    useEffect(() => {
        setTempValue(url); // URL이 변경될 때 임시 URL 상태 업데이트
    }, [url]);

    return (
        <View style={{ padding: 10,  backgroundColor: '#eee', borderRadius: 8, width: width, flexDirection: 'row' }}>
            <TextInput 
                selectTextOnFocus={true} // 텍스트 선택 가능
                placeholder="URL을 입력하세요..." 
                style={{ borderWidth: 1, padding: 5, marginTop: 10, color: 'black', width: width * 0.7 }} // text input for URL
                value={tempValue} // url state
                onChangeText={setTempValue} // update URL state on change
                onSubmitEditing={() => {
                    setUrl(tempValue); // set URL state
                    setTempValue(''); // clear input field
                }} // submit URL on enter
                returnKeyType="done"
            />
            <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10, marginLeft: 5 }} 
                onPress={() => router.push('/tab')}
            >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>탭</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10, marginLeft: 5 }} 
                onPress={() => router.push('/setting')}
            >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10, marginLeft: 5 }} 
                onPress={() => router.push('/translationMap')}
            >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>번역 Mapping</Text>
            </TouchableOpacity>
        </View>
    );
}