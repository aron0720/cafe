import streamTranslateText from "@/apis/translateApi";

async function translateText(apikey: string, prompt: string, additionalPrompt: string, text: { tag: string, text: string }[]) {
    let temp = ""; // 임시 텍스트

    let translatedText: { tag: string, text: string }[] = []; // 번역된 텍스트 배열

    for (let i = 0; i < text.length; i++) {
        const element = text[i]; // 현재 요소
        const tag = element.tag; // 태그
        const content = element.text; // 내용

        await streamTranslateText(content, apikey, prompt, additionalPrompt, (chunkText: string) => {
            temp += chunkText; // 조각 텍스트 추가
        });

        translatedText.push({ tag: tag, text: temp }); // 번역된 텍스트 추가
        temp = ""; // 임시 텍스트 초기화
    }

    return translatedText; // 번역된 텍스트 반환
}

export default translateText;