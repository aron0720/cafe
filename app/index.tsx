import { Text, ScrollView, Dimensions } from "react-native";
import BasicsSetupDetails from "@/components/basicsSetupDetails";
import PromptSetupDetails from "@/components/promptSetupDetails";
import URLInput from "@/components/URLInput";
import OutputLayout from "@/components/outputLayout";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";

export default function Index() {
  const [url, setUrl] = useState(""); // URL state
  const [prompt, setPrompt] = useState("입력되는 텍스트를 한국어로 번역하세요. 단, 어떤 추가 문구 없이 번역한 텍스트만 출력하세요."); // 프롬프트 상태
  const [additionalPrompt, setAdditionalPrompt] = useState(""); // 추가 프롬프트 상태
  const [apiKey, setApiKey] = useState(""); // API 키 상태
  const navigation = useNavigation(); // 네비게이션 훅

  useEffect(() => {
    navigation.setOptions({ title: "Colomo" }); // 제목 설정 
  }, [navigation]);

  return (
    <ScrollView
      nestedScrollEnabled={true}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        padding: 20,
        minHeight: Dimensions.get("window").height
      }}
    >
      <Text>모바일 환경으로 개발 중인 유사 콜로모입니다!</Text>
      <BasicsSetupDetails 
        apiKey={apiKey}
        setApiKey={setApiKey}  
      /> {/* 기본 설정 */}
      <PromptSetupDetails 
        prompt={prompt}
        setPrompt={setPrompt}
        additionalPrompt={additionalPrompt}
        setAdditionalPrompt={setAdditionalPrompt}
      /> {/* 프롬프트 설정 */}
      <URLInput
        url={url}
        setUrl={setUrl} 
      /> {/* URL 입력 */}
      <OutputLayout 
        apiKey={apiKey}
        setApiKey={setApiKey}
        prompt={prompt}
        setPrompt={setPrompt}
        additionalPrompt={additionalPrompt}
        setAdditionalPrompt={setAdditionalPrompt}
        url={url}
        setUrl={setUrl}
      /> {/* 출력 레이아웃 */}
    </ScrollView>
    
    
  );
}
