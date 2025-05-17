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
 */
export function getParsedElementFromWebView(
    webViewRef: React.RefObject<WebView | null>
) {
    if (webViewRef.current) {
        (webViewRef.current as any).injectJavaScript(`
            (function () {
                function getXPath(element) {
                    if (element.id) {
                        return 'id("' + element.id + '")';
                    }
                    if (element === document.body) {
                        return '/html/body';
                    }

                    let ix = 0;
                    const siblings = element.parentNode ? element.parentNode.childNodes : [];
                    for (let i = 0; i < siblings.length; i++) {
                        const sibling = siblings[i];
                        if (sibling === element) {
                            return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                        }
                        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                            ix++;
                        }
                    }
                }

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
                        const xpath = parent ? getXPath(parent) : null; // XPath 생성

                        if (xpath) {
                            result.push({ xpath, text }); // XPath와 텍스트를 결과에 추가
                        }
                    }
                }

                // React Native로 데이터 전송
                window.ReactNativeWebView.postMessage("Webpage Elements:" + JSON.stringify(result));
            })();
        `);
    }
}