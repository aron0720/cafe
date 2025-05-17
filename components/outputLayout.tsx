import { useEffect, useState, useRef, use } from 'react';
import { View, Text, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { getParsedElementFromWebView } from '@/hooks/getParsedElementFromWebView';
import { translateText } from '@/hooks/useTranslate';
import { updateTranslationMapToWebView } from '@/hooks/updateTranslationMapToWebView';

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

    // 번역 API가 완전히 종료되었는지를 확인하는 state
    const [isTrnaslationAPICompleted, setIsTranslationAPICompleted] = useState(true);

    // 현재 webView의 translationMap과 javaScript injection에 따른 변역 작업이 완료되었나 저장하는 변수
    let isTranslationDone = true;

    function openWebView() {
        setWebViewLoading(true); // 웹뷰 로딩 상태 설정
        setIsTranslated(false); // 번역 상태 초기화
        setUrl(url); // 현재 URL 업데이트
        setOpen(true); // 웹뷰 열기
    } // 버튼 클릭 시 웹뷰 열기(닫혀있다면)

    function closeWebView() {
        setOpen(false);
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

        console.log("isTranslationDone", isTranslationDone, "translationMap", translationMap);

        // 번역이 완료되지 않은 경우 return
        if (!isTranslationDone) return;

        // 웹뷰의 처리를 완료되지 않음으로 설정
        isTranslationDone = false;

        // 가장 마지막의 translationMap element는 아직 갱신이 되지 않았을 수 있기 때문에, 맨 마지막의 원소는 제외하고 전달.
        // 단, 이때, 마지막의 원소를 제외했을 때 비었다면 return
        const modifiedTranslationMap = translationMap.slice(0, -1);
        if (modifiedTranslationMap.length == 0) return;

        if (webViewRef.current){
            updateTranslationMapToWebView(modifiedTranslationMap, webViewRef);
        }
    }, [translationMap]);

    // parsedElements 상태가 변경될 때 마다 API를 호출해 번역 저장
    // parsedElements의 주요 변경은 "창 열기" 버튼 클릭 시 발생
    useEffect(() => {

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
            </View>
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

                    // 만약 event.nativeEvent.data가 "Webpage Elements:"로 시작한다면, parsedElements를 업데이트 하기 위한 return임.
                    if (event.nativeEvent.data.startsWith("Webpage Elements:")) {
                        const data = JSON.parse(event.nativeEvent.data.replace("Webpage Elements:", ""));
                        try {
                            setParsedElements([]);
                            setTranslationMap([]);
                            
                            // 만약 data가 비어있거나 original, translated 형식이라면 아래 코드 스킵
                            if (data.length == 0 || (data[0].hasOwnProperty('original') && data[0].hasOwnProperty('translated'))) {
                                return;
                            }
                            setParsedElements(data);
                            setFirstTranslate(false);
                        } catch (e) {
                            console.warn("❌ JSON 파싱 오류:", e);
                        }
                    }

                    // Translation Done이라는 메시지가 오면 번역 완료 상태 업데이트 (updateTranslationMapToWebView.ts)
                    if (event.nativeEvent.data === "Translation Done") {
                        isTranslationDone = true;
                        console.log("✅ 번역 완료");
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