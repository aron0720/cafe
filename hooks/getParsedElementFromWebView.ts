import { WebView } from 'react-native-webview';

/**
 * webViewRef에서 parsedElements를 가져오는 함수
 * 추후, 다음과 같은 순서대로 parsedElements로 전달됩니다.
 * 
 * window.ReactNativeWebView.postMessage(JSON.stringify(result)); (본 함수)
 * const data = JSON.parse(event.nativeEvent.data);               (outputLayout.tsx)
 * setParsedElements(data);                                       (outputLayout.tsx)
 * 
 * @param webViewRef 
 * @param firstTrsnslate 
 * @param isTranslated 
 */
export function getParsedElementFromWebView(
    webViewRef: React.RefObject<WebView | null>,
    firstTrsnslate: boolean,
    isTranslated: boolean
) {
    if (webViewRef.current && firstTrsnslate && !isTranslated) {
        (webViewRef.current as any).injectJavaScript(`
            (function () {
                let translationId = 0; // 고유 ID를 위한 카운터

                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function (node) {
                            const parent = node.parentElement;
                            const isVisible = parent &&
                                window.getComputedStyle(parent).display !== 'none' &&
                                window.getComputedStyle(parent).visibility !== 'hidden' &&
                                parent.offsetParent !== null;

                            const isValidTag = parent && !['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'TITLE'].includes(parent.tagName);

                            return node.textContent.trim() && isVisible && isValidTag
                                ? NodeFilter.FILTER_ACCEPT
                                : NodeFilter.FILTER_SKIP;
                        }
                    },
                    false
                );

                const result = [];
                while (walker.nextNode()) {
                    const textNode = walker.currentNode;
                    const text = textNode.textContent.trim();

                    if (text) {
                        const parent = textNode.parentElement;
                        const id = 'translation-' + translationId++; // 고유 ID 생성

                        // 부모 요소에 고유 ID 추가
                        if (parent) {
                            parent.setAttribute('data-translation-id', id);
                        }

                        result.push({ id, text }); // ID와 텍스트를 결과에 추가
                    }
                }

                // React Native로 데이터 전송
                window.ReactNativeWebView.postMessage(JSON.stringify(result));
            })();
        `);
    }
}