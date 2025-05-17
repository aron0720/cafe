import { WebView } from 'react-native-webview';

/**
 * webView로 번역된 결과인 translationMap을 반영하는 함수
 * translationMap의 길이가 0이면 즉시 종료
 * 
 * @param translationMap
 * @param webViewRef
 */
export function updateTranslationMapToWebView(
    translationMap: { original: string, translated: string }[],
    webViewRef: React.RefObject<WebView | null>,
) {

    // translationMap이 비어있으면 함수 종료
    if (translationMap.length === 0) return;

    // 번역된 텍스트를 WebView에 주입할 JavaScript 코드 생성
    const translationScript = `
        (function() {
            const translationMap = ${JSON.stringify(translationMap)};

            const elements = document.querySelectorAll('[data-translation-id]');
            elements.forEach(el => {
                let html = el.innerHTML;
                translationMap.forEach(item => {
                    html = html.replaceAll(item.original, item.translated);

                    // const regex = new RegExp(\`(?<![\\w<>])\${item.original}(?![\\w<>])\`, 'g');
                    // html = html.replace(regex, item.translated);
                });
                el.innerHTML = html;
            });

            // 번역 완료 상태 업데이트
            window.ReactNativeWebView.postMessage("Translation Done");

            true;
        })();
    `;

    // WebView에 JavaScript 코드 주입
    (webViewRef.current as any).injectJavaScript(translationScript);
}