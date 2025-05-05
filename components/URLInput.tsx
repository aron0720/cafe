import { View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';

interface URLInputProps {
    url: string; // URL state
    setUrl: (url: string) => void; // function to set URL state
} // URLInput component props

export default function URLInput({ url, setUrl }: URLInputProps) {    
  const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기 

  return (
    <View style={{ padding: 10, margin: 5, backgroundColor: '#eee', borderRadius: 8, width: width * 0.75 }}>
        <TextInput 
            multiline={true} // allow multiline input
            placeholder="URL을 입력하세요..." 
            style={{ borderWidth: 1, padding: 5, marginTop: 10, color: 'black', textAlignVertical: 'top' }} // text input for URL
            value={url} // url state
            onChangeText={setUrl} // update URL state on change
        />

        <TouchableOpacity 
            onPress={() => setUrl('')} 
            style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10 }} // button to clear URL
        >       
                <Text style={{ fontSize: 16, textAlign: 'center' }}>URL 초기화</Text>
        </TouchableOpacity> 
    </View>
  );
}