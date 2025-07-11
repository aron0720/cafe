import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { getParsedElementFromWebView } from '@/hooks/getParsedElementFromWebView';
import { translateText } from '@/hooks/useTranslate';
import { updateTranslationMapToWebView } from '@/hooks/updateTranslationMapToWebView';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';

// style
import { outputLayoutStyle } from '@/style/outputLayoutStyle';

interface outputLayoutProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    additionalPrompt: string;
    setAdditionalPrompt: (prompt: string) => void;
    url: string;
    setUrl: (url: string) => void;
    pageTitle: string;
    setPageTitle: (pageTitle: string) => void;
}

export default function OutputLayout({ apiKey, setApiKey, prompt, setPrompt, additionalPrompt, setAdditionalPrompt, url, setUrl, pageTitle, setPageTitle }: outputLayoutProps) {
    const [open, setOpen] = useState(false); // 웹뷰 열기 상태
    const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기
    const webViewRef = useRef<WebView>(null); // 웹뷰 참조
    const [parsedElements, setParsedElements] = useState<{ xpath: string, text: string }[]>([]);
    const [firstTrsnslate, setFirstTranslate] = useState(true); // 첫 번째 번역 상태
    const [webViewLoading, setWebViewLoading] = useState(false); // 웹뷰 열기 상태
    const [navstate, setNavState] = useState<WebViewNavigation | null>(null); // 웹뷰 내비게이션 상태
    const [storedTabs, setStoredTabs] = useState<any[]>([]);
    const [usingtab, setUsingTab] = useState<number>();

    // 원본, 번역 대응 표를 저장하는 state
    const [translationMap, setTranslationMap] = useState<{ original: string, translated: string }[]>([]);

    // 원본, 번역 대응 표의 저장소가 될 state
    const [translationMapStorage, setTranslationMapStorage] = useState<{ original: string, translated: string }[]>([]);

    // 번역 API가 완전히 종료되었는지를 확인하는 state
    const [isTranslationAPICompleted, setIsTranslationAPICompleted] = useState(true);

    // 이 화면이 focus 되었을 때, AsyncStorage에서 번역된 결과를 불러오기 위해 사용하는 state
    const isFocused = useIsFocused();

    async function openWebView() {
        setWebViewLoading(true); // 웹뷰 로딩 상태 설정
        setOpen(true); // 웹뷰 열기
    } // 버튼 클릭 시 웹뷰 열기(닫혀있다면)

    function closeWebView() {
        setOpen(false);
    } // 웹뷰 닫기

    useFocusEffect(
        useCallback(() => {
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
            };

            const loadTabs = async () => {
                try {
                    const storedTabs = await AsyncStorage.getItem('tabs');
                    const usingTabs = await AsyncStorage.getItem('usingTabs');
                    const titles = await AsyncStorage.getItem('pageTitle');
                    let storedTabsJson = storedTabs ? JSON.parse(storedTabs) : null;
                    let usingTabsNumber = usingTabs ? Number(usingTabs) : 0;
                    let titleJson = titles ? JSON.parse(titles) : null;

                    if (!storedTabs) {
                    const dataInit = [{ url }];
                    await AsyncStorage.setItem('tabs', JSON.stringify(dataInit));
                    storedTabsJson = dataInit;
                    }

                    if (!usingTabs) {
                    await AsyncStorage.setItem('usingTabs', '0');
                    }

                    if (!titleJson) {
                        await AsyncStorage.setItem('pageTitle', '[{"pageTitle":""}]')
                    }

                    setStoredTabs(storedTabsJson);
                    setUsingTab(usingTabsNumber);

                    setUrl(storedTabsJson[usingTabsNumber].url);
                    setPageTitle(titleJson[usingTabsNumber].pageTitle);
                    
                } catch (error) {
                    console.error('Error loading tabs:', error);
                }
            };

            loadSetting();
            loadTabs();
            openWebView();
            return (() => {

            })
        }, []) 
    ); // 설정 및 탭 정보 불러오기 

    useFocusEffect(
    useCallback(() => {
        const onBackPress = () => {
            if (navstate?.canGoBack) {
                webViewRef.current?.goBack();
                return true;
            } else {
                setOpen(false); // 웹뷰 닫기
                return false;   // 앱이 닫히거나 이전 화면으로 이동
            }
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
            subscription.remove(); // 포커스가 벗어나면 리스너 제거
        };
    }, [navstate?.canGoBack])
    );

    useEffect(() => {
        if (!navstate) return; // navstate가 null인 경우 처리 중지

        if (navstate.url !== url) {
            setFirstTranslate(true); // 첫 번째 번역 상태 초기화
            setUrl(navstate.url); // URL 업데이트
        }
    }, [navstate]); // 웹뷰 내비게이션 상태 변경 시 처리

    // translationMap 상태 변경 시 WebView에 번역된 텍스트 업데이트
    useEffect(() => {

        // 가장 마지막의 translationMap element는 아직 갱신이 되지 않았을 수 있기 때문에, 맨 마지막의 원소는 제외하고 전달.
        // 단, 이때, 마지막의 원소를 제외했을 때 비었다면 return
        const modifiedTranslationMap = translationMap.slice(0, -1);
        if (webViewRef.current) {
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

            // translationMap 중 storage에 저장되지 않은 것들만 필터링해서 저장
            if (translationMap.length > 0) {
                const filteredTranslationMap = translationMap.filter((item) => {
                    return !translationMapStorage.some((storedItem) => storedItem.original === item.original);
                });
                setTranslationMapStorage((prev) => [...prev, ...filteredTranslationMap]);
                console.log("✅ 번역된 결과를 storage에 저장, 저장된 원소 개수: ", filteredTranslationMap.length);
            }
            setParsedElements([]);
        }

        console.log("pasedele", parsedElements)
    }, [isTranslationAPICompleted]);

    // parsedElements 상태가 변경될 때 마다 API를 호출해 번역 저장
    // parsedElements의 주요 변경은 "클릭하여 시작하기" 버튼 클릭 시 webView의 onLoadEnd에서 발생
    useEffect(() => {

        if (parsedElements.length == 0) return;

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

        // API 호출
        translateText(apiKey, prompt, additionalPrompt, filteredParsedElements, translationMapAlreadyStored, setTranslationMap, setIsTranslationAPICompleted);
    }, [parsedElements]);

    // translationMapStorage 상태가 변경될 때 마다 AsyncStorage에 저장
    useEffect(() => {
        const saveTranslationMap = async () => {
            try {
                await AsyncStorage.setItem('translationMapStorage', JSON.stringify(translationMapStorage));
                console.log("✅ 번역된 결과 저장 완료");
            } catch (error) {
                console.error("❌ 번역된 결과 저장 오류:", error);
            }
        };

        saveTranslationMap();
    }, [translationMapStorage]);

    // isFocused가 바뀌면, 해당 상태가 true일때 AsyncStorage에서 번역된 결과를 불러옴
    useEffect(() => {
        if (isFocused) {
            console.log("isFocused 상태 변경:", isFocused);
            const loadTranslationMap = async () => {
                try {
                    const translationMapStorage = await AsyncStorage.getItem('translationMapStorage');
                    if (translationMapStorage) {
                        setTranslationMapStorage(JSON.parse(translationMapStorage));
                    }
                } catch (error) {
                    console.error('Error loading translation map storage:', error);
                }
            };

            loadTranslationMap();

            // 번역된 결과를 불러온 후, original, translated 짝에서 translated가 변한 것이 있다면, 해당 내용을 translationMap에 업데이트
            // 만약, original, translated 짝이 없다면, 해당 요소가 삭제된 것이므로 translationMap에서 삭제
            let updatedTranslationMap = translationMapStorage.map((item) => {
                const storedItem = translationMapStorage.find((storedItem) => storedItem.original === item.original);
                return storedItem ? { ...item, translated: storedItem.translated } : item;
            });
            updatedTranslationMap = updatedTranslationMap.filter((item) => item.translated !== undefined);
            setTranslationMap(updatedTranslationMap);
            console.log(updatedTranslationMap.length)
        }
    }, [isFocused]);

    return (
        <View style={outputLayoutStyle.total_container}>

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

        {storedTabs.map((tab, index) => 
            (index === usingtab) ? (
            <WebView 
                mixedContentMode='always'
                key={index}
                originWhitelist={['*']}
                pullToRefreshEnabled={true} // 새로고침 가능
                ref={webViewRef} // 웹뷰 참조
                nestedScrollEnabled={true} // 스크롤 가능
                javaScriptEnabled={true} // 자바스크립트 사용 가능
                source={{ uri: url }} // URL을 웹뷰에 로드
                allowFileAccess={true} // 파일 접근 허용
                style={{ width: '100%', height: height * 0.75 }}
                
                // 다크 모드
                injectedJavaScript={`
                    document.body.style.backgroundColor = '#2e2e2e';
                    document.body.style.color = '#d4d4d4';
                    true;
                `}

                onNavigationStateChange={(newState) => {
                    setNavState(newState);
                }}
                onMessage={(event) => {

                    // 만약 event.nativeEvent.data가 "Webpage Elements:"로 시작한다면, parsedElements를 업데이트 하기 위한 return임.
                    if (event.nativeEvent.data.startsWith("Webpage Elements:")) {
                        const data = JSON.parse(event.nativeEvent.data.replace("Webpage Elements:", ""));
                        try {
                            setTranslationMap([]);
                            
                            // 만약 data가 비어있거나 original, translated 형식이라면 아래 코드 스킵
                            if (data.length == 0 || (data[0].hasOwnProperty('original') && data[0].hasOwnProperty('translated'))) {
                                return;
                            }
                            setParsedElements(data);
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
                onLoadEnd={({nativeEvent}) => {

                    // // 로드가 끝나면 html 문서 전체를 가져오기
                    // webViewRef.current?.injectJavaScript(`window.ReactNativeWebView.postMessage("HTML:" + document.documentElement.outerHTML);`);

                    setIsTranslationAPICompleted(false);
                    getParsedElementFromWebView(webViewRef);

                    if (nativeEvent.title) {
                        setPageTitle(nativeEvent.title);
                    }
                }}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:');
                    console.error('  description:', nativeEvent.description);
                    console.error('errorCode:', nativeEvent.code);
                    console.error('domain:', nativeEvent.domain);
                    console.error('url:', nativeEvent.url);
                }}
            />
        ): null)}
    </View>
  );
}