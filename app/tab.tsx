import InnerHeader from "@/components/innerHeader";
import { ScrollView, TouchableOpacity, Text, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Tabs() {
    const { width, height } = Dimensions.get('window'); // Get screen dimensions
    const [tabList, setTabList] = useState<any[]>([]);
    const [titleList, setTitleList] = useState<any[]>([]);
    const [usingTabs, setUsingTabs] = useState<number>();

    const router = useRouter();

    useEffect(() => {
        const loadTabs = async () => {
            try {
                const tabs = await AsyncStorage.getItem('tabs');
                const usingTabs = await AsyncStorage.getItem('usingTabs');
                const title = await AsyncStorage.getItem('pageTitle')
                if (tabs) {
                    setTabList(JSON.parse(tabs));
                    console.log('Loaded tabs:', JSON.parse(tabs));
                }
                if (title) {
                    setTitleList(JSON.parse(title));
                    console.log('Loaded title:', JSON.parse(title));
                }
                if (usingTabs) {
                    setUsingTabs(Number(usingTabs));
                    console.log('loaded number: ', usingTabs);
                }
            } catch (error) {
                console.error('Error loading tabs:', error); 
            }
        }

        loadTabs();
    }, []);

    async function addTabsButtonHandler() {
        const newTitleList = [...titleList, {"pageTitle": "새 탭"}];
        const newTabList = [...tabList, {"url": ""}];

        setTitleList(newTitleList);
        setTabList(newTabList);
        console.log(newTitleList);
        console.log(newTabList);

        await AsyncStorage.setItem('pageTitle', JSON.stringify(newTitleList));
        await AsyncStorage.setItem('tabs', JSON.stringify(newTabList));
    }

    async function tabsButtonHandler(index: number) {
        await AsyncStorage.setItem("usingTabs", String(index));
        router.back();
    }

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} // scroll view to allow scrolling
        >
            <InnerHeader />
            {titleList.map((pageTitle, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => tabsButtonHandler(index)}
                    style={{ padding: 10, backgroundColor: '#eee', marginBottom: 10, width: width * 0.9 }}
                    >
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ width: width * 0.7 }}
                    >{pageTitle.pageTitle}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
                onPress={addTabsButtonHandler}
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, width: width * 0.9 }}>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>추가하기</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}