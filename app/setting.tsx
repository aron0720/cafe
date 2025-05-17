import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import BasicsSetupDetails from "@/components/basicsSetupDetails";
import PromptSetupDetails from "@/components/promptSetupDetails";
import InnerHeader from "@/components/innerHeader";

export default function Setting() {
    const [apiKey, setApiKey] = useState(''); // API key state
    const [prompt, setPrompt] = useState(''); // Prompt state
    const [additionalPrompt, setAdditionalPrompt] = useState(''); // Additional prompt state

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
        </ScrollView>
    );
}