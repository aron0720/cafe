import { ScrollView, TouchableOpacity, Text, Dimensions, View, Alert, TextInput } from "react-native";
import { useEffect, useState } from "react";
import InnerHeader from "@/components/innerHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderMappingItem } from "@/components/renderMappingItem";

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

    // 현재 보고있는 page를 저장하기 위한 state
    const [currentPage, setCurrentPage] = useState<number>(0);

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

        // 한 화면에 보여줄 수 있는 항목 수는 40개로 제한
        const itemsPerPage = 40;
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // 검색어가 존재한다면, 해당 검색어를 포함하는 항목만 필터링
        const filteredItems = translationMapStorage.filter(item => 
            item.original.includes(searchItem) || item.translated.includes(searchItem)
        );

        // 필터링된 항목을 페이지에 맞게 잘라냄
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        // ScrollView에 표시할 내용을 렌더링
        const renderMappingItems = () => {
            return paginatedItems.map((item, index) => {

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

                return renderMappingItem(index, width, editedOriginal, editedTranslated, saveChanges, setEditedItems);
            });
        }
    
        // ScrollView에 렌더링할 항목 설정
        setRenderedItems(renderMappingItems());
    }, [translationMapStorage, editedItems, searchItem, currentPage]);
    
    return (
        <>
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: '#eee', gap: 10 }}>
                <InnerHeader />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: width * 0.9, marginBottom: 10 }}>
                    <TextInput
                        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, width: width * 0.7 }}
                        placeholder="검색할 문장 입력"
                        value={searchItem}
                        onChangeText={setSearchItem}
                    />

                    {/* 페이지 넘기기, 뒤로가기 버튼 */}
                    <TouchableOpacity
                        style={{ backgroundColor: currentPage > 0 ? '#007BFF' : '#ccc', padding: 10, borderRadius: 5, width: width * 0.07, alignItems: 'center' }}
                        onPress={() => {
                            if (currentPage > 0) {
                                setCurrentPage(currentPage - 1);
                            }
                        }}
                        disabled={currentPage === 0}
                    >
                        <Text style={{ color: '#fff', fontSize: 14 }}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ backgroundColor: renderedItems.length === 40 ? '#007BFF' : '#ccc', padding: 10, borderRadius: 5, width: width * 0.07, alignItems: 'center' }}
                        onPress={() => {
                            if (renderedItems.length === 40) {
                                setCurrentPage(currentPage + 1);
                            }
                        }}
                        disabled={renderedItems.length < 40}
                    >
                        <Text style={{ color: '#fff', fontSize: 14 }}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
    
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
                {renderedItems}
            </ScrollView>
        </>
    );
}