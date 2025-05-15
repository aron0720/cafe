import { useEffect, useState, useRef, use } from 'react';
import { View, Text, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { getParsedElementFromWebView } from '@/hooks/getParsedElementFromWebView';
import { translateText } from '@/hooks/useTranslate';

interface outputLayoutProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    additionalPrompt: string;
    setAdditionalPrompt: (prompt: string) => void;
    url: string;
    setUrl: (url: string) => void;
}

export default function OutputLayout({ apiKey, setApiKey, prompt, setPrompt, additionalPrompt, setAdditionalPrompt, url, setUrl  }: outputLayoutProps) {
    const [open, setOpen] = useState(false); // 웹뷰 열기 상태
    const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기
    const [isTranslated, setIsTranslated] = useState(false); // 번역 상태
    const webViewRef = useRef<WebView>(null); // 웹뷰 참조
    const [parsedElements, setParsedElements] = useState<{ index: string, text: string }[]>([]);
    const [firstTrsnslate, setFirstTranslate] = useState(true); // 첫 번째 번역 상태
    const [webViewLoading, setWebViewLoading] = useState(false); // 웹뷰 열기 상태
    const [navstate, setNavState] = useState<WebViewNavigation | null>(null); // 웹뷰 내비게이션 상태

    // 원본, 번역 대응 표를 저장하는 state
    const [translationMap, setTranslationMap] = useState<{ original: string, translated: string }[]>([]);

    function openWebView() {
        setWebViewLoading(true); // 웹뷰 로딩 상태 설정
        setIsTranslated(false); // 번역 상태 초기화
        setUrl(url); // 현재 URL 업데이트
        setOpen(true); // 웹뷰 열기
    } // 버튼 클릭 시 웹뷰 열기(닫혀있다면)

    function closeWebView() {
        setOpen(false); // 웹뷰 닫기
    } // 웹뷰 닫기

    useEffect(() => {
        if (!navstate) return; // navstate가 null인 경우 처리 중지

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (navstate.canGoBack) {
                webViewRef.current?.goBack(); // 웹뷰에서 뒤로가기
                return true;
            } else {
                setOpen(false); // 웹뷰 닫기
                return false; // 기본 뒤로가기 동작 수행
            }
        })

        return () => {
            subscription.remove(); // 컴포넌트 언마운트 시 이벤트 리스너 제거
        };

    }, [navstate?.canGoBack]);

    useEffect(() => {
        if (!navstate) return; // navstate가 null인 경우 처리 중지

        if (navstate.url !== url) {
            setFirstTranslate(true); // 첫 번째 번역 상태 초기화
            setUrl(navstate.url); // URL 업데이트
        }
    }, [navstate]); // 웹뷰 내비게이션 상태 변경 시 처리

    // translationMap 상태 변경 시 WebView에 번역된 텍스트 업데이트
    useEffect(() => {
        //console.log("translationMap 상태 변경됨:", translationMap);

        if (webViewRef.current) {

            // 번역된 텍스트를 WebView에 주입할 JavaScript 코드 생성
            const translationScript = `
                (function() {
                    const translationMap = ${JSON.stringify(translationMap)};

                    const elements = document.querySelectorAll('[data-translation-id]');
                    elements.forEach(el => {
                        let html = el.innerHTML;
                        translationMap.forEach(item => {
                            html = html.replaceAll(item.original, item.translated);
                        });
                        el.innerHTML = html;
                    });

                    true;
                })();
            `;

            // WebView에 JavaScript 코드 주입
            (webViewRef.current as any).injectJavaScript(translationScript);
        }
    }, [translationMap]);

    // parsedElements 상태가 변경될 때 마다 API를 호출해 번역 저장
    // parsedElements의 주요 변경은 "창 열기" 버튼 클릭 시 발생
    useEffect(() => {
        //console.log("parsedElements 상태 변경됨:", parsedElements);

        // parsedElements가 비어있지 않은 경우에만 API 호출
        if (parsedElements.length > 0) {
            translateText(apiKey, prompt, additionalPrompt, parsedElements, setTranslationMap)
        }
    }, [parsedElements]);

    useEffect(() => { 
        if ((url == 'about:blank') || (url == '') && !webViewLoading) {
            setUrl(''); // URL 초기화
            if (open == true) {
                setOpen(false); // 웹뷰 닫기
            }
        }
    }, [url]); // URL이 변경될 때마다 웹뷰를 업데이트

    return (
        <View style={{ padding: 10, backgroundColor: '#eee', borderRadius: 8, width: width, height: height * 0.89}}>

        {!open &&<TouchableOpacity 
            onPress={() => openWebView()} 
            style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10 }} 
        >       
                <Text style={{ fontSize: 16, textAlign: 'center' }}>클릭하여 시작하기</Text>
        </TouchableOpacity> }

        {false && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                
                <TouchableOpacity 
                onPress={() => { 
                    setIsTranslated(!isTranslated);
                }}
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, flex: 1, marginRight: 5 }}
                >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>{isTranslated ? '원문 표시' : '번역 표시'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                onPress={() => closeWebView()} 
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, flex: 1, marginLeft: 5 }}
                >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>창 닫기</Text>
                </TouchableOpacity>
            </View> // 이 부분은 표시되지 않음.
        )} 

        {open && (
            <WebView 
                pullToRefreshEnabled={true} // 새로고침 가능
                ref={webViewRef} // 웹뷰 참조
                nestedScrollEnabled={true} // 스크롤 가능
                javaScriptEnabled={true} // 자바스크립트 사용 가능
                source={{ uri: url }} // URL을 웹뷰에 로드
                style={{ width: '100%', height: height * 0.75}}
                onNavigationStateChange={(newState) => {
                    setNavState(newState);
                }}
                onMessage={(event) => {
                    try {
                        setParsedElements([]);
                        setTranslationMap([]);
                        const data = JSON.parse(event.nativeEvent.data);
                        console.log("📩 onMessage 데이터:", event.nativeEvent.data);
                        
                        // 만약 data가 비어있거나 original, translated 형식이라면 아래 코드 스킵
                        if (data.length == 0 || (data[0].hasOwnProperty('original') && data[0].hasOwnProperty('translated'))) {
                            return;
                        }
                        setParsedElements(data);
                        setFirstTranslate(false);
                    } catch (e) {
                        console.warn("❌ JSON 파싱 오류:", e);
                    }
                }}
                onLoadEnd={() => {
                    getParsedElementFromWebView(webViewRef, firstTrsnslate, isTranslated);
                    console.log("✅ WebView 로드 완료");
                }}
                onError={(error) => {
                    console.error("WebView error:", error);
                }}
            />
        )}
    </View>
  );
}