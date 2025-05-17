import { WebView } from 'react-native-webview';

/**
 * webView로 번역된 결과인 translationMap을 반영하는 함수
 * translationMap의 길이가 0이면 즉시 종료
 * 
 * @param translationMap
 * @param webViewRef
 * @param parsedElements
 */
export function updateTranslationMapToWebView(
    translationMap: { original: string, translated: string }[],
    webViewRef: React.RefObject<WebView | null>,
    parsedElements: { xpath: string, text: string }[]
) {

    // translationMap이 비어있으면 함수 종료
    if (translationMap.length === 0) {
        console.log("translationMap is empty");
        return;
    }

    // 번역된 텍스트를 WebView에 주입할 JavaScript 코드 생성
    const translationScript = `
        (function() {
            const translationMap = ${JSON.stringify(translationMap)};
            const parsedElements = ${JSON.stringify(parsedElements)};

            // xpath를 기반으로 DOM 요소를 찾는 함수
            function getElementByXpath(xpath) {
                return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            }

            parsedElements.forEach(parsed => {
                const element = getElementByXpath(parsed.xpath);
                if (element) {
                    let html = element.innerHTML;
                    translationMap.forEach(item => {
                        if (parsed.text.includes(item.original)) {
                            html = html.replaceAll(item.original, item.translated);
                        }
                    });
                    element.innerHTML = html;
                }
            });

            // 번역 완료 상태 업데이트
            // window.ReactNativeWebView.postMessage("WebView Update Done");

            true;
        })();
    `;

    // WebView에 JavaScript 코드 주입
    (webViewRef.current as any).injectJavaScript(translationScript);
}