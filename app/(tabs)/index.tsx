import { Button, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/ThemedView';
import TimeInput from '@/components/form/TimeInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/form/CustomButton';

type Notification = {
  id: string;
  title: string;
  body?: string;
  hour: string;
  minute: string;
};

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY_NOTIFICATIONS = '@notifications';

export default function HomeScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /** 앱 시작 시 저장된 값 로드 */
  useEffect(() => {
    const loadStoredNotifications = async () => {
      const storedNotifications = await AsyncStorage.getItem(
        STORAGE_KEY_NOTIFICATIONS
      );

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    };

    loadStoredNotifications();
  }, []);

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
  }: Omit<Notification, 'id'>) => {
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
            hour: Number(hour),
            minute: Number(minute),
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

      await Promise.all(
        notifications.map(({ title, hour, minute }) =>
          addWeekdayNotification({ title, hour, minute })
        )
      );
    } catch (error: any) {
      alert(error?.message || '에러가 발생했습니다.');
    }
  };

  /** 설정 버튼 클릭 핸들러 */
  const handleSubmit = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        await scheduleNotifications();

        // 상태를 AsyncStorage에 저장
        await AsyncStorage.setItem(
          STORAGE_KEY_NOTIFICATIONS,
          JSON.stringify(notifications)
        );
      }

      alert('저장되었습니다.');
    } catch (error: any) {
      alert(error?.message || '에러가 발생했습니다.');
    }
  };

  /** 새 알림 추가 */
  const addNotification = () => {
    setNotifications((prevState) => [
      ...prevState,
      { id: Date.now().toString(), title: '', hour: '', minute: '' },
    ]);
  };

  /** 알림 삭제 */
  const removeNotification = (id: string) => {
    setNotifications((prevState) =>
      prevState.filter((notification) => notification.id !== id)
    );
  };

  const handleTitleChange = (id: string, title: string) => {
    setNotifications((prevState) =>
      prevState.map((notification) =>
        notification.id === id ? { ...notification, title } : notification
      )
    );
  };

  const handleTimeChange = (id: string, time: string[]) => {
    setNotifications((prevState) =>
      prevState.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              hour: time[0],
              minute: time[1],
            }
          : notification
      )
    );
  };

  return (
    // https://docs.expo.dev/versions/latest/sdk/safe-area-context/
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.stepContainer}>
          <CustomButton onPress={handleSubmit} title="저장" />
          {notifications.map((notification) => (
            <ThemedView
              key={notification.id}
              style={styles.notificationContainer}
            >
              <View style={styles.titleInputContainer}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="알림 제목"
                  placeholderTextColor="gray"
                  value={notification.title}
                  onChangeText={(value) =>
                    handleTitleChange(notification.id, value)
                  }
                />
                <CustomButton
                  title="삭제"
                  onPress={() => removeNotification(notification.id)}
                />
              </View>
              <TimeInput
                value={[notification.hour, notification.minute]}
                onChange={(time) => handleTimeChange(notification.id, time)}
              />
            </ThemedView>
          ))}
          <CustomButton title="새 알림 추가" onPress={addNotification} />
        </ThemedView>
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
  notificationContainer: {
    gap: 8,
  },
  titleInputContainer: { flexDirection: 'row', gap: 8 },
  titleInput: {
    flex: 1,
    borderRadius: 8,
    height: 48,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    color: 'white',
  },
});
