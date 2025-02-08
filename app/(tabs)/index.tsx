import { Image, StyleSheet, Platform, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useState, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
  const [isEnabled, setIsEnabled] = useState(false);

  // 스위치 상태가 변경될 때마다 알림 스케줄 설정
  useEffect(() => {
    scheduleNotifications();
  }, [isEnabled]);

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

      if (isEnabled) {
        await addWeekdayNotification({
          title: '비타민 챙겨 먹기',
          hour: 14,
          minute: 0,
        });

        await addWeekdayNotification({
          title: '어머니 전화',
          hour: 15,
          minute: 0,
        });
      }
    } catch (error: any) {
      alert(error?.message);
    }
  };

  // 스위치 상태 변경 처리
  const toggleSwitch = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      setIsEnabled((previousState) => !previousState);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.notificationContainer}>
        <ThemedText type="subtitle">⏰ 알림 설정</ThemedText>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <ThemedText>
          {isEnabled ? '알림이 설정되었습니다!' : '알림을 설정해주세요!'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">비타민 알림</ThemedText>
        <ThemedText>
          비타민을 챙겨 먹기 위한 알림 설정이 돼 있습니다.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">어머니 전화</ThemedText>
        <ThemedText>
          어머니께 전화를 하기 위한 알림 설정이 돼 있습니다.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
  },
  notificationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
  },
});
