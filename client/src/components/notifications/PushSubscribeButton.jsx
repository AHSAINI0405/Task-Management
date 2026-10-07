import { usePushNotifications } from '../../hooks/usePushNotifications.js';
import Button from '../ui/Button.jsx';

export default function PushSubscribeButton({ className = '' }) {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <span className="text-xs text-gray-400 italic">
        Push notifications unsupported in this browser
      </span>
    );
  }

  return (
    <Button
      variant={isSubscribed ? 'secondary' : 'primary'}
      size="sm"
      loading={loading}
      onClick={isSubscribed ? unsubscribe : subscribe}
      className={className}
    >
      {isSubscribed ? '🔔 Push Enabled (Disable)' : '🔕 Enable Browser Push'}
    </Button>
  );
}
