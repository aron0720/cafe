import { ScrollView, TouchableOpacity, Text, Dimensions, View, Alert, TextInput } from "react-native";
import { useEffect, useState } from "react";
import InnerHeader from "@/components/innerHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Setting() {

    // 화면 정보를 위한 state
    const { width, height } = Dimensions.get('window'); 

    // translationMapStorage 저장을 위한 state
    const [translationMapStorage, setTranslationMapStorage] = useState<{ original: string, translated: string }[]>([]);

    // 현재 검색 항목을 알기 위한 state
    const [searchItem, setSearchItem] = useState<string>('');

    // ScrollView 내부에 렌더링된 항목 표시
    const [renderedItems, setRenderedItems] = useState<JSX.Element[]>([]);

    // 각 항목의 수정 상태를 관리
    const [editedItems, setEditedItems] = useState<{ original: string; translated: string }[]>([]);

    // 초기화를 위한 useEffect
    useEffect(() => {
        const loadTranslationMapStorage = async () => {
            try {
                const translationMapStorage = await AsyncStorage.getItem('translationMapStorage');
                if (translationMapStorage) {
                    setTranslationMapStorage(JSON.parse(translationMapStorage));
                }
            } catch (error) {
                console.error('Error loading translation map storage:', error);
                Alert.alert('Error', 'Translation map storage could not be loaded.');
            }
        }

        loadTranslationMapStorage();
    }, []);
    
    // translationMapStorage가 바뀌면, 해당 mapping 내용을 scrollView에 보여주기 위한 useEffect
    // scrollView 내부에 생성되어야 할 mapping 내용은 original, translated가 기본값으로 있는 TextInput(좌측)과 삭제와 저장하기 버튼(우측)으로 구성되어야 함
    useEffect(() => {

        // ScrollView에 표시할 내용을 렌더링
        const renderMappingItems = () => {
            return translationMapStorage.map((item, index) => {

                // 상태를 상위에서 관리
                const editedOriginal = editedItems[index]?.original || item.original;
                const editedTranslated = editedItems[index]?.translated || item.translated;
    
                const saveChanges = async () => {
                    try {
                        
                        // translationMapStorage 업데이트
                        const updatedStorage = [...translationMapStorage];
                        updatedStorage[index] = { original: editedOriginal, translated: editedTranslated };
                        setTranslationMapStorage(updatedStorage);
    
                        // AsyncStorage 업데이트
                        await AsyncStorage.setItem('translationMapStorage', JSON.stringify(updatedStorage));
                        Alert.alert('저장 완료', '변경된 내용이 저장되었습니다.');
                    } catch (error) {
                        console.error('저장 오류:', error);
                        Alert.alert('저장 실패', '변경된 내용을 저장하지 못했습니다.');
                    }
                };
    
                return (
                    <View
                        key={index}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: width * 0.9,
                            marginBottom: 10,
                            padding: 10,
                            backgroundColor: '#fff',
                            borderRadius: 5,
                            borderWidth: 1,
                            borderColor: '#ccc',
                        }}
                    >
                        {/* Original TextInput */}
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                padding: 10,
                                borderRadius: 5,
                                width: width * 0.4,
                            }}
                            value={editedOriginal}
                            onChangeText={(text) => handleEdit(index, 'original', text)}
                        />
    
                        {/* Translated TextInput */}
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                padding: 10,
                                borderRadius: 5,
                                width: width * 0.4,
                            }}
                            value={editedTranslated}
                            onChangeText={(text) => handleEdit(index, 'translated', text)}
                        />
    
                        {/* 저장 버튼 */}
                        <TouchableOpacity
                            style={{
                                padding: 10,
                                backgroundColor: '#4CAF50',
                                borderRadius: 5,
                                marginLeft: 10,
                            }}
                            onPress={saveChanges}
                        >
                            <Text style={{ color: '#fff', fontSize: 14 }}>저장</Text>
                        </TouchableOpacity>
                    </View>
                );
            });
        };
    
        // ScrollView에 렌더링할 항목 설정
        setRenderedItems(renderMappingItems());
    }, [translationMapStorage, editedItems]);
    
    // 항목 수정 핸들러
    const handleEdit = (index: number, field: 'original' | 'translated', value: string) => {
        setEditedItems((prev) => {
            const updated = [...prev];
            if (!updated[index]) {
                updated[index] = { original: '', translated: '' };
            }
            updated[index][field] = value;
            return updated;
        });
    };
    
    return (
        <>
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: '#eee', gap: 10 }}>
                <InnerHeader />
                <TextInput
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, width: width * 0.7 }}
                    placeholder="검색할 문장 입력"
                    value={searchItem}
                    onChangeText={setSearchItem}
                />
            </View>
    
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
                {renderedItems}
            </ScrollView>
        </>
    );
}