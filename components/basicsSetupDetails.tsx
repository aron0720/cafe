import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';

interface BasicsSetupDetailsProps {
  apiKey: string; // API key state
  setApiKey: (apiKey: string) => void; // function to set API key state
}

export default function BasicsSetupDetails({ apiKey, setApiKey }: BasicsSetupDetailsProps) {
  const [open, setOpen] = useState(false); // 디테일 오픈 상태 
  const {width, height} = Dimensions.get('window'); // 창 크기 가져오기 

  return (
    <View style={{ padding: 10, margin: 5, backgroundColor: '#eee', borderRadius: 8, width: width * 0.75 }}>
      
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}>
        <Text style={{ fontSize: 16 }}>{open ? '▼ 기본 설정' : '▶ 기본 설정'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 14 }}>AI API key</Text>
          <TextInput 
            placeholder="api key를 입력..." 
            style={{ borderWidth: 1, padding: 5, marginTop: 10, color: 'black' }}
            value={apiKey}
            onChangeText={setApiKey} 
          />
        </View>
        
      )}
    </View>
  );
}