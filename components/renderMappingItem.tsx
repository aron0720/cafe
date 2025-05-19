import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';

/**
 * 항목 수정을 위한 핸들러 함수
 * 
 * @param index 
 * @param field 
 * @param value 
 * @param setEditedItems 
 */
function handleEdit (
    index: number,
    field: 'original' | 'translated',
    value: string,
    setEditedItems: React.Dispatch<React.SetStateAction<{ original: string; translated: string }[]>>
) {
    setEditedItems((prev) => {
        const updated = [...prev];
        if (!updated[index]) {
            updated[index] = { original: '', translated: '' };
        }
        updated[index][field] = value;
        return updated;
    });
};

/**
 * 항목 삭제를 위한 핸들러 함수
 * 
 * @param index 
 * @param setEditedItems 
 * @param setTranslationMapStorage
 */
function handleRemove(
    index: number,
    setTranslationMapStorage: React.Dispatch<React.SetStateAction<{ original: string; translated: string }[]>>,
    setEditedItems: React.Dispatch<React.SetStateAction<{ original: string; translated: string }[]>>
) {
    setTranslationMapStorage((prev) => {
        const updated = [...prev];
        updated.splice(index, 1); // index 위치의 항목을 삭제
        return updated;
    });

    setEditedItems((prev) => {
        const updated = [...prev];
        updated.splice(index, 1); // index 위치의 항목을 삭제
        return updated;
    });
}

/**
 * 번역 mapping 화면에서 사용할 요소 하나를 반환하는 함수
 * 
 * @param index 
 * @param width 
 * @param editedOriginal 
 * @param editedTranslated 
 * @param saveChanges 
 * @param setEditedItems 
 * @returns 
 */
export function renderMappingItem(
    index: number,
    width: number,
    editedOriginal: string, 
    editedTranslated: string,
    saveChanges: () => void,
    setEditedItems: React.Dispatch<React.SetStateAction<{ original: string; translated: string }[]>>,
    setTranslationMapStorage: React.Dispatch<React.SetStateAction<{ original: string; translated: string }[]>>
) {
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
                    width: width * 0.35,
                }}
                editable={false}
                value={editedOriginal}
                onChangeText={(text) => handleEdit(index, 'original', text, setEditedItems)}
            />

            {/* Translated TextInput */}
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    borderRadius: 5,
                    width: width * 0.35,
                }}
                value={editedTranslated}
                onChangeText={(text) => handleEdit(index, 'translated', text, setEditedItems)}
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

            {/* 삭제 버튼 */}
            <TouchableOpacity
                style={{
                    padding: 10,
                    backgroundColor: '#F44336',
                    borderRadius: 5,
                    marginLeft: 10,
                }}
                onPress={() => handleRemove(index, setTranslationMapStorage, setEditedItems)}
            >
                <Text style={{ color: '#fff', fontSize: 14 }}>삭제</Text>
            </TouchableOpacity>
        </View>
    ); 
}