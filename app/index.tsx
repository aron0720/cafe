import { View } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import Constants from "expo-constants";

// components
import URLInput from "@/components/URLInput";
import OutputLayout from "@/components/outputLayout";
import BookMarkDetails from "@/components/bookMarkDetails";

// style
import { indexStyle } from "../style/indexStyle.js";

interface ManifestExtra {
	API_KEY: string;
};

export default function Index() {
	const initPage = "https://en-portal.g.kuroco-img.app/v=1750749084/files/user/character/manhattancafe/manhattancafe_01.png";
	const [url, setUrl] = useState("");
	const [prompt, setPrompt] = useState("다음과 같은 텍스트 리스트를 한국어로 번역하세요. # 어떤 추가 문구 없이 리스트만을 출력하세요. 개행문자 ||는 리스트의 형식에 포함됩니다. 절대로 리스트의 형식이 손상되거나 숫자가 변해서는 안됩니다!!! 되도록이면 한국어만 포함하세요.");
	const [additionalPrompt, setAdditionalPrompt] = useState(""); // 추가 프롬프트 상태
	const [apiKey, setApiKey] = useState<string>(
		(Constants.expoConfig?.extra as ManifestExtra)?.API_KEY
	);
	const [pageTitle, setPageTitle] = useState(''); // 페이지 타이틀 상태 
	const navigation = useNavigation(); // 네비게이션 훅

	const [bookmarks, setBookmarks] = useState([
		{ id: '1', title: '하멜른', url: 'https://syosetu.org' },
		{ id: '2', title: '소설가가 되자', url: 'https://syosetu.com' },
		{ id: '3', title: '카쿠요무', url: 'https://kakuyomu.jp' },
	]);

	useEffect(() => {
		navigation.setOptions({ title: "Cafe" }); // 제목 설정 
	}, [navigation]);

	useEffect(() => {
		if (!url) {
			setUrl(initPage); // 초기 URL 설정
		}
	}, [url, initPage]);

	useEffect(() => {
		console.log("북마크가 업데이트되었습니다:", bookmarks);
	}, [bookmarks])

	return (
		<View
			style={indexStyle.total_container}
		>
			<URLInput
				url={url}
				setUrl={setUrl}
				pageTitle={pageTitle}
				setPageTitle={setPageTitle}
			/>

			<BookMarkDetails
				bookmarks={bookmarks}
				onSelect={(bookmark) => {
					setUrl(bookmark.url);
					setPageTitle(bookmark.title);
				}}
				onDelete={(id) => {
					setBookmarks((prev) => prev.filter((b) => b.id !== id));
				}}
				onAdd={(bookmark) => {
					setBookmarks((prev) => [...prev, bookmark]);
				}}
			/>
			
			<OutputLayout 
				apiKey={apiKey}
				setApiKey={setApiKey}
				prompt={prompt}
				setPrompt={setPrompt}
				additionalPrompt={additionalPrompt}
				setAdditionalPrompt={setAdditionalPrompt}
				url={url}
				setUrl={setUrl}
				pageTitle={pageTitle}
				setPageTitle={setPageTitle}
			/>
		</View>
	);
}