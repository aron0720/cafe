import { StyleSheet } from 'react-native';

export const bookMarkDetailsStyle = StyleSheet.create({
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#d4d4d4', // VS Code 다크 모드 텍스트 색상
    },
    emptyText: {
        fontSize: 16,
        color: '#808080', // VS Code 다크 모드 비활성 텍스트 색상
        textAlign: 'center',
        marginTop: 20,
    },
    bookmarkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#252526', // VS Code 다크 모드 카드 배경색
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    bookmarkTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d4d4d4', // VS Code 다크 모드 텍스트 색상
    },
    bookmarkUrl: {
        fontSize: 14,
        color: '#9cdcfe', // VS Code 다크 모드 URL 색상
    },
    deleteButton: {
        backgroundColor: '#f44747', // VS Code 다크 모드 에러 색상
        padding: 5,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#ffffff', // 버튼 텍스트 색상
        fontSize: 14,
    },
    toggleIcon: {
        fontSize: 16,
        color: '#569cd6', // VS Code 다크 모드 강조 색상
        textAlign: 'right',
    },
    addButton: {
        backgroundColor: '#007acc', // VS Code 다크 모드 강조 색상
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    addButtonText: {
        color: '#ffffff', // 버튼 텍스트 색상
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#555555', // VS Code 다크 모드 입력 필드 테두리 색상
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: '#d4d4d4', // VS Code 다크 모드 입력 필드 텍스트 색상
        backgroundColor: '#1e1e1e', // VS Code 다크 모드 입력 필드 배경색
        marginBottom: 10,
    },
});