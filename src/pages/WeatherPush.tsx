import { Link } from 'react-router-dom';
import { WeatherPushManager } from '@/components/WeatherPushManager';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WeatherPush = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 重定向到新的定时推送管理页面
    navigate('/scheduled-push', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">正在跳转到定时推送管理页面...</p>
      </div>
    </div>
  );
};

export default WeatherPush;
