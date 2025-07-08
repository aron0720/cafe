import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';

// style
import { bookMarkDetailsStyle } from "@/style/bookMarkDetailsStyle.js";

interface BookMark {
    id: string;
    title: string;
    url: string;
}

interface BookMarkDetailsProps {
    bookmarks: BookMark[];
    onSelect: (bookmark: BookMark) => void;
    onDelete: (id: string) => void;
    onAdd: (bookmark: BookMark) => void; // 북마크 추가 함수
}

export default function BookMarkDetails({
    bookmarks,
    onSelect,
    onDelete,
    onAdd,
}: BookMarkDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const handleAddBookmark = () => {
        if (newTitle.trim() && newUrl.trim()) {
            const newBookmark: BookMark = {
                id: Date.now().toString(),
                title: newTitle,
                url: newUrl,
            };
            onAdd(newBookmark);
            setNewTitle('');
            setNewUrl('');
        }
    };

    return (
        <>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={bookMarkDetailsStyle.header}>
                <Text style={bookMarkDetailsStyle.toggleIcon}>{isExpanded ? '북마크 ▲' : '북마크 ▼'}</Text>
            </TouchableOpacity>
            {isExpanded && (
                <View>
                    <Text style={bookMarkDetailsStyle.header}>북마크 목록</Text>

                    {/* 북마크 추가 입력 필드 */}
                    <View style={{ marginBottom: 10 }}>
                        <TextInput
                            style={bookMarkDetailsStyle.input}
                            placeholder="북마크 제목"
                            placeholderTextColor="#808080"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />
                        <TextInput
                            style={bookMarkDetailsStyle.input}
                            placeholder="북마크 URL"
                            placeholderTextColor="#808080"
                            value={newUrl}
                            onChangeText={setNewUrl}
                        />
                        <TouchableOpacity onPress={handleAddBookmark} style={bookMarkDetailsStyle.addButton}>
                            <Text style={bookMarkDetailsStyle.addButtonText}>추가</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 북마크 목록 내용 */}
                    {bookmarks.length === 0 ? (
                        <Text style={bookMarkDetailsStyle.emptyText}>저장된 북마크가 없습니다.</Text>
                    ) : (
                        <FlatList
                            data={bookmarks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={bookMarkDetailsStyle.bookmarkItem}>
                                    <TouchableOpacity onPress={() => {
                                        onSelect(item);
                                        setIsExpanded(false);
                                    }} style={{ marginRight: 10 }}>
                                        <Text style={bookMarkDetailsStyle.bookmarkTitle}>{item.title}</Text>
                                        <Text style={bookMarkDetailsStyle.bookmarkUrl}>{item.url}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => onDelete(item.id)} style={bookMarkDetailsStyle.deleteButton}>
                                        <Text style={bookMarkDetailsStyle.deleteButtonText}>삭제</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </View>
            )}
        </>
    );
}