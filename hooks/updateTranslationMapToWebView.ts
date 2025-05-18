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

                    // translationMap을 사용하여 HTML 내용에 대응
                    translationMap.forEach(item => {
                        if (item.original.includes(parsed.text)) {
                            html = html.replaceAll(item.original, item.translated);
                        }
                    });
                    element.innerHTML = html;
                }
            });
            true;
        })();
    `;

    // WebView에 JavaScript 코드 주입
    (webViewRef.current as any).injectJavaScript(translationScript);
}