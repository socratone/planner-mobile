import { Button, ScrollView, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TimeInput from '@/components/form/TimeInput';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
  title: string;
  body?: string;
  hour: number;
  minute: number;
};

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [vitaminTime, setVitaminTime] = useState(['', '']);
  const [motherCallTime, setMotherCallTime] = useState(['', '']);

  /** 알림 권한 요청 */
  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('알림 권한이 필요합니다!');
      return false;
    }
    return true;
  };

  /** 평일 반복 notification */
  const addWeekdayNotification = async ({
    title,
    body,
    hour,
    minute,
  }: Notification) => {
    return Promise.all(
      // 2 ~ 6은 평일에 해당하는 number
      [2, 3, 4, 5, 6].map((weekday) => {
        return Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            hour,
            minute,
            weekday,
          },
        });
      })
    );
  };

  /** 알림 스케줄 설정 */
  const scheduleNotifications = async () => {
    try {
      // 기존 알림 모두 취소
      // https://docs.expo.dev/versions/latest/sdk/notifications/#cancelallschedulednotificationsasync
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (vitaminTime[0].length > 0 && vitaminTime[1].length > 0) {
        await addWeekdayNotification({
          title: '비타민 챙겨 먹기',
          hour: parseInt(vitaminTime[0]),
          minute: parseInt(vitaminTime[1]),
        });
      }

      if (motherCallTime[0].length > 0 && motherCallTime[1].length > 0) {
        await addWeekdayNotification({
          title: '어머니 전화',
          hour: parseInt(motherCallTime[0]),
          minute: parseInt(motherCallTime[1]),
        });
      }
    } catch (error: any) {
      alert(error?.message);
    }
  };

  /** 설정 버튼 클릭 핸들러 */
  const handleSubmit = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      scheduleNotifications();
    }
  };

  return (
    // https://docs.expo.dev/versions/latest/sdk/safe-area-context/
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">비타민 알림</ThemedText>
          <TimeInput value={vitaminTime} onChange={setVitaminTime} />
          <ThemedText type="subtitle">어머니 전화</ThemedText>
          <TimeInput value={motherCallTime} onChange={setMotherCallTime} />
        </ThemedView>
        <Button onPress={handleSubmit} title="설정" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  stepContainer: {
    flex: 1,
    gap: 8,
    marginBottom: 16,
  },
});
