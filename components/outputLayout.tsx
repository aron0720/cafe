import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import translateText from '@/hooks/useTranslate';

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

export default function OutputLayout({ apiKey, setApiKey, prompt, setPrompt, additionalPrompt, setAdditionalPrompt, url, setUrl }: outputLayoutProps) {
  const [open, setOpen] = useState(false); // 웹뷰 열기 상태
  const {width, height} = Dimensions.get('window'); // 화면 크기 가져오기
  const [currentUrl, setCurrentUrl] = useState(url); // 현재 URL 상태
  const [isTranslated, setIsTranslated] = useState(false); // 번역 상태
  const webViewRef = useRef(null); // 웹뷰 참조
  const [parsedElements, setParsedElements] = useState<{ tag: string, text: string }[]>([]);
  const [firstTrsnslate, setFirstTranslate] = useState(true); // 첫 번째 번역 상태
  const [translatedText, setTranslatedText] = useState<{ tag: string, text: string }[]>([]); // 번역된 텍스트 상태


  function openWebView() {
    setIsTranslated(false); // 번역 상태 초기화
    setCurrentUrl(url); // 현재 URL 업데이트
    setOpen(true); // 웹뷰 열기
  } // 버튼 클릭 시 웹뷰 열기(닫혀있다면)

  function closeWebView() {
    setOpen(false); // 웹뷰 닫기
  } // 웹뷰 닫기

  async function translate() {
    console.log("🔄 번역 시작"); // 번역 시작 로그
    if (webViewRef.current && firstTrsnslate) {
      (webViewRef.current as any).injectJavaScript(`
        (function () {
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
            const text = walker.currentNode.textContent.trim();
            if (text) {
              result.push({ text });
            }
          }

          window.ReactNativeWebView.postMessage(JSON.stringify(result));
        })();

      `);
    }

    try {
    const result = await translateText(apiKey, prompt, additionalPrompt, parsedElements); // 번역 함수 호출
    setTranslatedText(result);
    console.log("🔄 번역된 텍스트:", translatedText); // 번역된 텍스트 로그
    } catch (error) {
      console.error("번역 오류:", error); // 번역 오류 로그
    }

    if (isTranslated) {

      // 번역 복구 
    }

    if (!isTranslated) { 
      // 번역 
    }

    setIsTranslated(!isTranslated); // 번역 상태 토글
  } // 번역 함수(추후 구현 필요)

  useEffect(() => { 
    if (url == 'about:blank') {
      setUrl(''); // URL 초기화
      if (open == true) {
        setOpen(false); // 웹뷰 닫기
      }
    }
  }, [url]); // URL이 변경될 때마다 웹뷰를 업데이트

  return (
    <View style={{ padding: 10, margin: 5, backgroundColor: '#eee', borderRadius: 8, width: width * 0.75, height: height * 0.8 }}>

        {<TouchableOpacity 
            onPress={() => openWebView()} 
            style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10 }} 
        >       
                <Text style={{ fontSize: 16, textAlign: 'center' }}>창 열기
                </Text>
        </TouchableOpacity> }

        {open && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            
            <TouchableOpacity 
              onPress={() => translate()} 
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
          <Text>현재 URL: {currentUrl}</Text>
        )}

        {open && (
          <WebView 
            ref={webViewRef} // 웹뷰 참조 설정
            nestedScrollEnabled={true} // 스크롤 가능
            javaScriptEnabled={true} // 자바스크립트 사용 가능
            source={{ uri: currentUrl }} // URL을 웹뷰에 로드
            style={{ width: '100%', height: height * 0.75, marginTop: 10 }}
            onNavigationStateChange={(navState) => {
              // 웹뷰 내비게이션 상태 변경 시 처리
              if (navState.url !== currentUrl) {
                setFirstTranslate(true); // 첫 번째 번역 상태 초기화
                setCurrentUrl(navState.url); // URL 업데이트
              }
            }}
            onMessage={(event) => {
              try {
                console.log("📩 onMessage 호출됨");
                const data = JSON.parse(event.nativeEvent.data);
                //console.log("📄 받은 요소:", data);
                setParsedElements(data);
                setFirstTranslate(false); // 첫 번째 번역 상태 업데이트
              } catch (e) {
                console.warn("❌ JSON 파싱 오류:", e);
              }
            }}
          />
        )}

    </View>
  );
}