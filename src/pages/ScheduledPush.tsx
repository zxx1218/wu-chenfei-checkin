import { Link } from 'react-router-dom';
import { ScheduledPushManager } from '@/components/ScheduledPushManager';
import { IncomePushManager } from '@/components/IncomePushManager';
import { ArrowLeft } from 'lucide-react';

const ScheduledPush = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <header className="text-center mb-6 sm:mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 sm:mb-4">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            返回首页
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            ⏰ 定时推送管理
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            配置天气消息和收入提醒的自动推送
          </p>
        </header>

        <div className="space-y-4">
          <ScheduledPushManager />
          <IncomePushManager />
        </div>
      </div>
    </div>
  );
};

export default ScheduledPush;
