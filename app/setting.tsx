import { ScrollView, TouchableOpacity, Text, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import BasicsSetupDetails from "@/components/basicsSetupDetails";
import PromptSetupDetails from "@/components/promptSetupDetails";
import InnerHeader from "@/components/innerHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Setting() {
    const [apiKey, setApiKey] = useState(''); // API key state
    const [prompt, setPrompt] = useState(''); // Prompt state
    const [additionalPrompt, setAdditionalPrompt] = useState(''); // Additional prompt state
    const { width, height } = Dimensions.get('window'); // Get screen dimensions

    function saveButtonHandler() {
        console.log('hanldle save button');

        const saveSetting = async () => {
            if (!apiKey || !prompt) {
                alert('api key와 기본 프롬프트는 반드시 입력되어야 합니다!'); // Alert if any field is empty
                return;
            }

            if (apiKey && prompt) {
                await AsyncStorage.setItem('apiKey', apiKey); // Save API key
                await AsyncStorage.setItem('prompt', prompt); // Save prompt
                if (additionalPrompt) {
                    await AsyncStorage.setItem('additionalPrompt', additionalPrompt); // Save additional prompt if it exists
                }
            }
            
            console.log('저장 완료'); // Log save completion
            alert('저장 완료'); // Alert save completion
        }

        saveSetting();
    }

    useEffect(() => {
        console.log('load setting');
        const loadSetting = async () => {
            try {
                const apiKey = await AsyncStorage.getItem('apiKey');
                const prompt = await AsyncStorage.getItem('prompt');
                const additionalPrompt = await AsyncStorage.getItem('additionalPrompt');

                if (apiKey) setApiKey(apiKey); 
                if (prompt) setPrompt(prompt); 
                if (additionalPrompt) setAdditionalPrompt(additionalPrompt); 
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }

        loadSetting(); // Load settings on component mount
    }, []); // 저장된 정보 로드

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} // scroll view to allow scrolling
        >
            <InnerHeader /> 
            <BasicsSetupDetails
                apiKey={apiKey} // API key state
                setApiKey={setApiKey} // function to set API key state
            />
            <PromptSetupDetails 
                prompt={prompt} // Prompt state
                setPrompt={setPrompt} // function to set prompt state
                additionalPrompt={additionalPrompt} // Additional prompt state
                setAdditionalPrompt={setAdditionalPrompt} // function to set additional prompt state
            />
            <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, width: width * 0.9 }}
                onPress={saveButtonHandler} // Save button handler
            >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>저장하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}