import InnerHeader from "@/components/innerHeader";
import { ScrollView, TouchableOpacity, Text, Dimensions, View } from "react-native";
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

    async function deleteTabsButtonHandler(index: number) {3
        
        const newTitleList = [...titleList.slice(0, index), ...titleList.slice(index + 1)];
        const newTabList = [...tabList.slice(0, index), ...tabList.slice(index + 1)];

        setTitleList(newTitleList);
        setTabList(newTabList);

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
                <View 
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    key={index}
                >
                    <TouchableOpacity
                        onPress={() => tabsButtonHandler(index)}
                        style={{ padding: 10, backgroundColor: '#eee', marginBottom: 10, width: width * 0.75 }}
                        >
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{ width: '100%' }}
                        >{pageTitle.pageTitle}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ padding: 10, backgroundColor: '#eee', marginBottom: 10, width: width * 0.15, marginLeft: 5, alignItems: 'center' }}
                        onPress={() => deleteTabsButtonHandler(index)}
                    >
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >삭제</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity
                onPress={addTabsButtonHandler}
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, width: width * 0.9 }}>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>추가하기</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}