import InnerHeader from "@/components/innerHeader";
import { ScrollView, TouchableOpacity, Text, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Tabs() {
    const { width, height } = Dimensions.get('window'); // Get screen dimensions
    const [tabList, setTabList] = useState<any[]>([]);
    const [usingTabs, setUsingTabs] = useState(null);

    useEffect(() => {
        const loadTabs = async () => {
            try {
                const tabs = await AsyncStorage.getItem('tabs');
                const usingTabs = await AsyncStorage.getItem('usingTabs');
                if (tabs) {
                    setTabList(JSON.parse(tabs));
                    console.log('Loaded tabs:', JSON.parse(tabs));
                }
                console.log(usingTabs);
            } catch (error) {
                console.error('Error loading tabs:', error); 
            }
        }

        loadTabs();
    }, []);

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} // scroll view to allow scrolling
        >
            <InnerHeader />
            {tabList.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    style={{ padding: 10, backgroundColor: '#eee', marginBottom: 10, width: width * 0.9 }}
                    >
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ width: width * 0.7 }}
                    >{tab.url}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
                style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5, width: width * 0.9 }}>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>추가하기</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}