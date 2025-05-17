import { fetch } from "expo/fetch"

/**
 * API로 부터 반환받은 답변에 대한 형식
 */
interface Candidate {
    content?: {
        parts?: { text: string }[];
    };
}

/**
 * 웹 페이지에서 parsing된 번역할 텍스트들을 받아서 번역한 후, translationMap으로 번역된 텍스트를 저장하는 함수
 * translationMap은 원본 텍스트와 번역된 텍스트를 매칭하는 배열이다.
 * 
 * @param apikey 
 * @param prompt 
 * @param additionalPrompt 
 * @param text 
 * @param setTranslationMap
 */
export async function translateText(
    apikey: string, 
    prompt: string, 
    additionalPrompt: string, 
    text: { index: string, text: string }[],
    translationMap: { original: string, translated: string }[],
    setTranslationMap: React.Dispatch<React.SetStateAction<{ original: string, translated: string }[]>>,
    setIsTranslationAPICompleted: React.Dispatch<React.SetStateAction<boolean>>
) {

    //console.log("translateText 함수 호출됨:", { apikey, prompt, additionalPrompt, text });
    
    // 받은 텍스트를 {숫자}||{내용}\n 헝태의 문자열로 변환
    const textToTranslate = text.map((item, index) => {
        return `${index}||${item.text}\n`;
    }).join('');

    // 텍스트와 프롬프트를 합쳐서 번역할 텍스트 생성
    const textWithPrompt = `${prompt}\n${additionalPrompt}\n\n${textToTranslate}`;

    // stream API 주소로 fetch
    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=' + apikey, {
        headers: { Accept: 'text/event-stream' },
        method: 'POST',
        body: JSON.stringify({"contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": textWithPrompt
                        }
                    ]
                }
            ]
        })
    });

    // resp가 비었을 때 오류 처리
    if (!resp.body) {
        throw new Error('Response body is empty');
    }

    const reader = resp.body.getReader();
    let combinedText = ""; // 번역된 텍스트를 누적할 변수
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        // chunks 원소의 형식은 다음과 같다.
        // "data: {"candidates": [{"content": {"parts": [{"text": "1"}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 4840,"totalTokenCount": 4840,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 4840}]},"modelVersion": "gemini-2.0-flash"}"
        // "data: {"candidates": [{"content": {"parts": [{"text": ". 소"}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 4840,"totalTokenCount": 4840,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 4840}]},"modelVersion": "gemini-2.0-flash"}"
        // "data: {"candidates": [{"content": {"parts": [{"text": "설 열람 기록\n2. 이용 약관\n3. FAQ\n4."}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 4840,"totalTokenCount": 4840,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 4840}]},"modelVersion": "gemini-2.0-flash"}"
        const decodedText = new TextDecoder("utf-8").decode(value);
        try {
            // 줄 단위로 나누고 "data:" 제거
            const lines = decodedText.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                if (line.startsWith('data:')) {
                    const cleanedText = line.replace(/^data:\s*/, '').trim();
    
                    // JSON 파싱
                    const jsonData = JSON.parse(cleanedText);
                    const candidates: Candidate[] = jsonData.candidates;
    
                    if (candidates && candidates.length > 0) {
                        candidates.forEach(candidate => {
                            if (candidate.content && candidate.content.parts) {
                                candidate.content.parts.forEach(part => {
                                    combinedText += part.text; // 텍스트 누적
                                });
                            }
                        });
                    }
                }
            });
    
            // combinedText를 translationMap에 반영
            parseListAndSetTranslatedText(combinedText, text, translationMap, setTranslationMap);
        } catch (error) {
            console.error("JSON 파싱 오류:", error, "디코딩된 텍스트:", decodedText);
        }
    }

    // API 호출이 완료되었음을 알림
    setIsTranslationAPICompleted(true);
}

/**
 * 번역된 텍스트를 원래의 텍스트와 매칭하여 translationMap에 저장하는 함수
 * translateText 함수 내부에서 사용될 함수.
 * 
 * @param combinedText
 * @param text
 * @param setTranslationMap
 */
function parseListAndSetTranslatedText(
    combinedText: string, 
    text: { index: string, text: string }[], 
    translationMap: { original: string, translated: string }[],
    setTranslationMap: React.Dispatch<React.SetStateAction<{ original: string, translated: string }[]>>
) {

    // combinedText를 줄 단위로 나누고, 각 줄을 "||"로 나누어 원래의 텍스트와 매칭
    const lines = combinedText.split('\n').filter(line => line.trim() !== '');
    const tempTranslationMap: { original: string, translated: string }[] = [];

    // 각 줄을 순서대로 original의 text와 translated로 나누어 tempTranslationMap에 추가
    lines.forEach((line, index) => {
        const parts = line.split('||');
        if (parts.length === 2) {

            // text 배열에서 원본 텍스트 가져오기
            const originalText = text[index]?.text.trim(); 
            const translatedText = parts[1].trim();
            if (originalText) {
                tempTranslationMap.push({ original: originalText, translated: translatedText });
            }
        }
    });

    // 이미 translationMap에 있는 요소를 제외한 후, 상태 업데이트
    const updatedTranslationMap = translationMap.filter(item => 
        !tempTranslationMap.some(tempItem => item.original === tempItem.original)
    );
    setTranslationMap([...updatedTranslationMap, ...tempTranslationMap]);
}