
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD_qJ4483uJkwMNUcL4gVaaRasPuJcAsM8",
  authDomain: "shopnaija-6960f.firebaseapp.com",
  projectId: "shopnaija-6960f",
  storageBucket: "shopnaija-6960f.firebasestorage.app",
  messagingSenderId: "282021173324",
  appId: "1:282021173324:web:6dee9b6bdf8a7a30a3fce9",
  measurementId: "G-CBDD84PF21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const vapidKey = "BMLD7VerB0gEaLcUgPTswV6Ldt4J9BxZiEhGEZS_BFUJjDmMOA8FEudH4867HA5qSvnBZlz5plCbWQ7Xbj_wru4";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Token:', token);
      
      // Store the token for the current user if logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        localStorage.setItem(`fcm_token_${user.id}`, token);
      }
      
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      resolve(payload);
    });
  });

// Function to send notification using the FCM REST API (alternative to server key)
export const sendNotificationToUser = async (userToken: string, title: string, body: string, data?: any) => {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${vapidKey}` // Using VAPID key as fallback
      },
      body: JSON.stringify({
        to: userToken,
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        },
        data: data || {}
      })
    });
    
    if (response.ok) {
      console.log('Notification sent successfully');
      return true;
    } else {
      console.error('Failed to send notification:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

export { messaging };
