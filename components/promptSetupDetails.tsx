import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';

interface promptSetupDetailsProps {
  prompt: string; // 프롬프트
  setPrompt: (prompt: string) => void; // 프롬프트 설정 함수
  additionalPrompt: string; // 추가 프롬프트
  setAdditionalPrompt: (additionalPrompt: string) => void; // 추가 프롬프트 설정 함수
}

export default function PromptSetupDetails({ prompt, setPrompt, additionalPrompt, setAdditionalPrompt }: promptSetupDetailsProps) {
  const [open, setOpen] = useState(false); // details open/close state
  const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기

  return (
    <View style={{ padding: 10, margin: 5, backgroundColor: '#eee', borderRadius: 8, width: width * 0.75 }}>
      
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}>
        <Text style={{ fontSize: 16 }}>{open ? '▼ 프롬프트 설정' : '▶ 프롬프트 설정'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 14 }}>프롬프트</Text>
          <TextInput 
            placeholder="기본 프롬프트를 입력..." 
            value={prompt}
            onChangeText={setPrompt} // 프롬프트 설정 함수
            multiline={true} // allow multiline input
            style={{ borderWidth: 1, padding: 5, marginTop: 10, color: 'black', textAlignVertical: 'top', minHeight: 100 }} />
          <TextInput 
            value={additionalPrompt}
            onChangeText={setAdditionalPrompt} // 추가 프롬프트 설정 함수
            placeholder="추가 프롬프트를 입력..." 
            multiline={true} // allow multiline input
            style={{ borderWidth: 1, padding: 5, marginTop: 10, color: 'black', textAlignVertical: 'top', minHeight: 100 }} />
        </View>
      )}
    </View>
  );
}