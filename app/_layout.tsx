import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index"
                options={{ 
                    headerShown: false,  // 헤더 숨기기
                    navigationBarHidden: true, // 네비게이션 바 숨기기
                }}
            />
            <Stack.Screen 
                name="tab"
                options={{ 
                    headerShown: false,
                    navigationBarHidden: true,
                }}
            />
            <Stack.Screen 
                name="setting"
                options={{ 
                    headerShown: false,
                    navigationBarHidden: true,
                }}
            />
            <Stack.Screen 
                name="translationMap"
                options={{ 
                    headerShown: false,
                    navigationBarHidden: true,
                }}
            />
        </Stack>
    )
}