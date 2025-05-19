import { useEffect, useState, useRef, use } from 'react';
import { View, Text, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { getParsedElementFromWebView } from '@/hooks/getParsedElementFromWebView';
import { translateText } from '@/hooks/useTranslate';
import { updateTranslationMapToWebView } from '@/hooks/updateTranslationMapToWebView';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [parsedElements, setParsedElements] = useState<{ xpath: string, text: string }[]>([]);
    const [firstTrsnslate, setFirstTranslate] = useState(true); // 첫 번째 번역 상태
    const [webViewLoading, setWebViewLoading] = useState(false); // 웹뷰 열기 상태
    const [navstate, setNavState] = useState<WebViewNavigation | null>(null); // 웹뷰 내비게이션 상태

    // 원본, 번역 대응 표를 저장하는 state
    const [translationMap, setTranslationMap] = useState<{ original: string, translated: string }[]>([]);

    // 원본, 번역 대응 표의 저장소가 될 state
    const [translationMapStorage, setTranslationMapStorage] = useState<{ original: string, translated: string }[]>([]);

    // 번역 API가 완전히 종료되었는지를 확인하는 state
    const [isTranslationAPICompleted, setIsTranslationAPICompleted] = useState(true);

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
        const loadSetting = async () => {
            try {
                const apiKey = await AsyncStorage.getItem('apiKey');
                const prompt = await AsyncStorage.getItem('prompt');
                const additionalPrompt = await AsyncStorage.getItem('additionalPrompt');

                if (apiKey) setApiKey(apiKey); 
                if (prompt) setPrompt(prompt); 
                if (additionalPrompt) setAdditionalPrompt(additionalPrompt); 
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }

        loadSetting(); // 컴포넌트 마운트 시 설정 로드
    }, []); // 저장된 설정 정보 로드 

    useEffect(() => {
        const loadTabs = async () => {
            try {
                const storedTabs = await AsyncStorage.getItem('tabs');
                const usingTabs = await AsyncStorage.getItem('usingTabs');
                let storedTabsJson = storedTabs ? JSON.parse(storedTabs) : null;
                let usingTabsNumber = usingTabs ? Number(usingTabs) : 0;

                if (!storedTabs) {
                    const dataInit = [
                        {"url": url}
                    ]
                    await AsyncStorage.setItem('tabs', JSON.stringify(dataInit));

                    storedTabsJson = dataInit
                }

                if (!usingTabs) {
                    await AsyncStorage.setItem('usingTabs', '0');
                }

                setUrl(storedTabsJson[usingTabsNumber].url); // URL 업데이트

            } catch (error) {
                console.error('Error loading tabs:', error);
            }
        }

        loadTabs(); // 컴포넌트 마운트 시 탭 로드
    }, []); // 저장된 탭 정보 로드 

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
        console.log("translationMap 상태 변경:", translationMap);

        // 가장 마지막의 translationMap element는 아직 갱신이 되지 않았을 수 있기 때문에, 맨 마지막의 원소는 제외하고 전달.
        // 단, 이때, 마지막의 원소를 제외했을 때 비었다면 return
        const modifiedTranslationMap = translationMap.slice(0, -1);
        if (webViewRef.current){
            updateTranslationMapToWebView(modifiedTranslationMap, webViewRef, parsedElements);
        }
        else console.log("webViewRef.current가 null입니다.");
    }, [translationMap]);

    // translationAPICompleted 상태가 변경되면 최종적으로 번역된 결과를 WebView에 업데이트
    // 이 useEffect가 반드시 필요한 이유는, translationMap useEffect에서 항상 맨 마지막 원소를 제외하고 webView에 업데이트 하기 때문에, 맨 마지막 원소를 반영해 줄 필요가 있기 때문
    useEffect(() => {
        console.log("translationAPICompleted 상태 변경:", isTranslationAPICompleted, "번역된 결과:", translationMap);

        if (isTranslationAPICompleted) {
            updateTranslationMapToWebView(translationMap, webViewRef, parsedElements);
        }

        // translationMap을 storage에 저장
        if (translationMap.length > 0) {
            setTranslationMapStorage((prev) => [...prev, ...translationMap]);
        }
    }, [isTranslationAPICompleted]);

    // parsedElements 상태가 변경될 때 마다 API를 호출해 번역 저장
    // parsedElements의 주요 변경은 "클릭하여 시작하기" 버튼 클릭 시 webView의 onLoadEnd에서 발생
    useEffect(() => {

        if (parsedElements.length == 0) return; // parsedElements가 비어있으면 처리 중지

        // parsedElements를 filtering해서 만약 해당 요소가 이미 stored되어 있다면, { original, translated } 형태로 translationMapAlreadyStored에 저장
        // 아니라면, { xpath, text } 형태로 filteredParsedElements에 저장
        // 이미 저장된 요소를 확인하기 위한 맵 생성
        const storedMap = new Map(
            translationMapStorage.map((item) => [item.original, item.translated])
        );

        // parsedElements를 필터링
        const translationMapAlreadyStored: { original: string; translated: string }[] = [];
        const filteredParsedElements: { xpath: string; text: string }[] = [];

        parsedElements.forEach((element) => {
            if (storedMap.has(element.text)) {

                // 이미 저장된 요소는 translationMapAlreadyStored에 추가
                translationMapAlreadyStored.push({
                    original: element.text,
                    translated: storedMap.get(element.text) || "",
                });
            } else {

                // 새 요소는 filteredParsedElements에 추가
                filteredParsedElements.push(element);
            }
        });

        console.log("✅ 이미 저장된 요소:", translationMapAlreadyStored);
        console.log("✅ 새로 번역할 요소:", filteredParsedElements);

        // filteredParsedElements가 비어있지 않은 경우에만 API 호출
        if (parsedElements.length > 0) 
            translateText(apiKey, prompt, additionalPrompt, filteredParsedElements, translationMapAlreadyStored, setTranslationMap, setIsTranslationAPICompleted);
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
        
        {/* 새로고침 버튼 */}
        {open && <TouchableOpacity
            onPress={() => {
                setParsedElements([]);
                setTranslationMap([]);
                if (webViewRef.current) webViewRef.current.reload();
            }}
            style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10 }}
        >
            <Text style={{ fontSize: 16, textAlign: 'center' }}>새로고침</Text>
        </TouchableOpacity>}

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
                        return
                    }

                    // WebView Update Done이라는 메시지가 오면 번역 완료 상태 업데이트 (updateTranslationMapToWebView.ts)
                    if (event.nativeEvent.data === "WebView Update Done") {
                        console.log("✅ 웹뷰 업데이트 완료");
                        return
                    }

                    // HTML:로 시작하는 경우, HTML 문서 전체를 가져오기 위한 메시지
                    if (event.nativeEvent.data.startsWith("HTML:")) {
                        const html = event.nativeEvent.data.replace("HTML:", "");
                        console.log("HTML 문서:", html);
                        return
                    }

                    console.log("event.nativeEvent.data:", event.nativeEvent.data);
                }}
                onLoadEnd={() => {

                    // 로드가 끝나면 html 문서 전체를 가져오기
                    webViewRef.current?.injectJavaScript(`window.ReactNativeWebView.postMessage("HTML:" + document.documentElement.outerHTML);`);

                    setIsTranslationAPICompleted(false);
                    getParsedElementFromWebView(webViewRef);
                }}
                onError={(error) => {
                    console.error("WebView error:", error);
                }}
            />
        )}
    </View>
  );
}