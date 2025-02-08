import { Image, StyleSheet, Platform, Switch } from "react-native";
import * as Notifications from "expo-notifications";
import { useState, useEffect } from "react";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [isEnabled, setIsEnabled] = useState(false);

  // 알림 권한 요청
  async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("알림 권한이 필요합니다!");
      return false;
    }
    return true;
  }

  // 알림 스케줄 설정
  async function scheduleNotifications() {
    // 기존 알림 모두 취소
    // https://docs.expo.dev/versions/latest/sdk/notifications/#cancelallschedulednotificationsasync
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (isEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "알림",
          body: "약 먹어!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 0,
          minute: 32,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "알림",
          body: "밥 먹어!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 0,
          minute: 40,
        },
      });
    }
  }

  // 스위치 상태 변경 처리
  const toggleSwitch = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      setIsEnabled((previousState) => !previousState);
    }
  };

  // 스위치 상태가 변경될 때마다 알림 스케줄 설정
  useEffect(() => {
    scheduleNotifications();
  }, [isEnabled]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.notificationContainer}>
        <ThemedText type="subtitle">⏰ 알림 설정</ThemedText>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <ThemedText>
          {isEnabled ? "알림이 설정되었습니다!" : "알림을 설정해주세요!"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this
          starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{" "}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  notificationContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(161, 206, 220, 0.1)",
  },
});
