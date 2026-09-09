import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { barkApi } from '@/lib/barkApi';
import { pushHistoryApi } from '@/lib/api';
import { 
  Heart, Sparkles, Gift, Send, ArrowLeft,
  Music, BookOpen, RotateCcw, Calendar
} from 'lucide-react';

// 推送目标配置
const PUSH_TARGETS: Record<string, string> = {
  'zxx': 'XpwbpgBSezBmKajzcGaDG6',
  '小菲': '7eBD3zF6E66Wqq7cCEjTBA'
};

// 可爱有趣的推送消息模板
const FUN_MESSAGES = [
  {
    id: 'miss-you',
    icon: '💕',
    title: '想你啦',
    messages: [
      { title: '💕 甜蜜提醒', body: '主人，有人在想你哦~快去看看是谁吧！😘' },
      { title: '💌 心动信号', body: '滴！你的小可爱正在想念你，请及时回应~ 💖' },
      { title: '🌸 思念警报', body: '检测到强烈的思念波动！来源：你的另一半 💫' },
    ]
  },
  {
    id: 'praise',
    icon: '✨',
    title: '夸夸你',
    messages: [
      { title: '⭐ 今日份夸奖', body: '你就是全世界最棒的人！不接受反驳~ ✨' },
      { title: '🌟 闪闪发光', body: '今天的你也超级耀眼呢！继续加油哦~ 💫' },
      { title: '🎉 优秀认证', body: '恭喜你获得"最可爱人类"称号！请继续保持~ 🏆' },
    ]
  },
  {
    id: 'care',
    icon: '🌙',
    title: '关心你',
    messages: [
      { title: '🌙 温馨提醒', body: '该休息啦！熬夜会变丑的哦（虽然你已经很好看了）😴' },
      { title: '☀️ 早安问候', body: '新的一天开始啦！记得吃早餐哦~ 🥐' },
      { title: '💧 喝水提醒', body: '咕噜咕噜~该喝水啦！保持水分很重要哦 💦' },
    ]
  },
  {
    id: 'funny',
    icon: '😂',
    title: '逗你笑',
    messages: [
      { title: '🤣 冷笑话', body: '为什么程序员分不清万圣节和圣诞节？因为 Oct 31 == Dec 25 😂' },
      { title: '😜 调皮一下', body: '警告！你的对象正在进行非法卖萌行为，请立即制止！🚨' },
      { title: '🎭 角色扮演', body: '叮！您的专属小可爱已上线，请问需要什么服务？😊' },
    ]
  },
  {
    id: 'encourage',
    icon: '💪',
    title: '鼓励你',
    messages: [
      { title: '🔥 加油打气', body: '困难都是暂时的！你一定可以克服的！冲鸭！💪' },
      { title: '🌈 正能量', body: '每一天都是新的开始，相信自己！你超棒的！✨' },
      { title: '🎯 目标提醒', body: '距离梦想又近了一步！继续努力，胜利在望！🏆' },
    ]
  },
  {
    id: 'romantic',
    icon: '🌹',
    title: '浪漫时刻',
    messages: [
      { title: '🌹 情话时间', body: '你是我的今天，以及所有的明天。💕' },
      { title: '💝 爱的告白', body: '遇见你是我这辈子最美的意外~ 💖' },
      { title: '💫 甜蜜暴击', body: '我想把世界上最好的都给你，却发现世上最好的就是你 💗' },
    ]
  },
];

// Bark音效列表
const BARK_SOUNDS = [
  'multiwayinvitation',
  'alarm',
  'anticipation',
  'bell',
  'birds',
  'bloom',
  'calm',
  'chime',
  'descent',
  'electronic',
  'fanfare',
  'glass',
  'gotosleep',
  'healthnotification',
  'incoming',
  'mailsent',
  'minimal',
  'moneyreceived',
  'news',
  'noir',
  'paymentsuccess',
  'shake',
  'sherwoodforest',
  'silence',
  'spell',
  'suspense',
  'telegraph',
  'tiptoes',
  'typewriters',
  'update'
];

const PushFun = () => {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string>('multiwayinvitation');
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [pushHistory, setPushHistory] = useState<Array<{ 
    id: string; 
    title: string; 
    body: string; 
    time: string; 
    target: string;
    created_at: string;
    sound?: string;
  }>>([]);

  // 加载历史记录
  useEffect(() => {
    fetchPushHistory();
  }, []);

  const fetchPushHistory = async () => {
    try {
      const response = await pushHistoryApi.getAll();
      if (response && response.data) {
        setPushHistory(response.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          time: new Date(item.created_at).toLocaleString('zh-CN'),
          target: item.target,
          created_at: item.created_at,
          sound: item.sound || 'multiwayinvitation'
        })));
      }
    } catch (error) {
      console.error('获取推送历史失败:', error);
    }
  };

  const handleSendPush = async (message: { title: string; body: string }) => {
    if (!selectedTarget) {
      toast({
        title: '⚠️ 请选择接收人',
        description: '先选择要发送给谁哦~',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const deviceKey = PUSH_TARGETS[selectedTarget];
      const result = await barkApi.push({
        title: message.title,
        body: message.body,
        level: 'active',
        sound: selectedSound,
        icon: 'https://picsum.photos/id/237/400/300',
        group: '甜蜜推送',
        url: import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://cheerout.cn:40001',
        device_keys: [deviceKey]
      });

      if (result) {
        // 保存到数据库
        await pushHistoryApi.create({
          title: message.title,
          body: message.body,
          target: selectedTarget,
          device_key: deviceKey,
          sound: selectedSound,
          status: 'success'
        });

        toast({
          title: '✅ 发送成功',
          description: `已向 ${selectedTarget} 发送消息 💕`,
          className: 'bg-blue-50 border-blue-200 text-blue-800'
        });

        // 重新加载历史记录
        fetchPushHistory();

        // 清空自定义消息输入框
        setCustomTitle('');
        setCustomBody('');
      } else {
        toast({
          title: '❌ 发送失败',
          description: '推送服务暂时不可用，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('推送失败:', error);
      toast({
        title: '❌ 推送失败',
        description: '网络错误，请检查网络连接',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendCustomMessage = () => {
    if (!customTitle.trim() || !customBody.trim()) {
      toast({
        title: '⚠️ 请填写完整',
        description: '标题和内容都不能为空哦~',
        variant: 'destructive'
      });
      return;
    }
    handleSendPush({ title: customTitle, body: customBody });
  };

  // 再次发送功能
  const handleResend = async (item: any) => {
    setSelectedTarget(item.target);
    setSelectedSound(item.sound || 'multiwayinvitation');
    await handleSendPush({ title: item.title, body: item.body });
  };

  const getRandomMessage = (messages: Array<{ title: string; body: string }>) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm">
        <div className="container max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回</span>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            💌 给对方推点什么
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 接收人选择 */}
        <Card className="bg-white/90 backdrop-blur border-purple-100 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-gray-800">选择接收人</h2>
            </div>
            <div className="flex gap-3">
              {Object.keys(PUSH_TARGETS).map((target) => (
                <Button
                  key={target}
                  onClick={() => setSelectedTarget(target)}
                  variant={selectedTarget === target ? 'default' : 'outline'}
                  className={`flex-1 transition-all ${
                    selectedTarget === target
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  {target === '小菲' ? '👸' : '🤴'} {target}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 音效选择 */}
        <Card className="bg-white/90 backdrop-blur border-purple-100 shadow-lg animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-gray-800">提示音</h2>
            </div>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-700"
            >
              {BARK_SOUNDS.map((sound) => (
                <option key={sound} value={sound}>
                  {sound}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* 消息分类标签页 */}
        <Card className="bg-white/90 backdrop-blur border-purple-100 shadow-lg animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          <CardContent className="p-5">
            <Tabs defaultValue="miss-you" className="w-full">
              <TabsList className="grid grid-cols-3 gap-2 bg-purple-50 p-2 rounded-xl">
                <TabsTrigger value="miss-you" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  💕 想你啦
                </TabsTrigger>
                <TabsTrigger value="praise" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  ✨ 夸夸你
                </TabsTrigger>
                <TabsTrigger value="care" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  🌙 关心你
                </TabsTrigger>
                <TabsTrigger value="funny" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  😂 逗你笑
                </TabsTrigger>
                <TabsTrigger value="encourage" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  💪 鼓励你
                </TabsTrigger>
                <TabsTrigger value="romantic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  🌹 浪漫时刻
                </TabsTrigger>
              </TabsList>

              {FUN_MESSAGES.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-4">
                  <div className="space-y-3">
                    {category.messages.map((msg, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleSendPush(msg)}
                        disabled={sending || !selectedTarget}
                        variant="outline"
                        className="h-auto py-3 px-4 text-left border-purple-200 hover:border-purple-400 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all group w-full"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {msg.title.split(' ')[0]}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-800 text-sm mb-1">
                              {msg.title.split(' ').slice(1).join(' ')}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {msg.body}
                            </p>
                          </div>
                          <Send className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                    ))}
                    
                    {/* 随机发送按钮 */}
                    <Button
                      onClick={() => {
                        const randomMsg = getRandomMessage(category.messages);
                        handleSendPush(randomMsg);
                      }}
                      disabled={sending || !selectedTarget}
                      variant="ghost"
                      className="h-auto py-2 px-4 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm text-purple-600">随机发送一个</span>
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* 自定义消息 */}
        <Card className="bg-white/90 backdrop-blur border-purple-100 shadow-lg animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-gray-800">自定义消息</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="输入消息标题..."
                  maxLength={50}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="输入你想说的话..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-700 resize-none"
                />
              </div>
              
              <Button
                onClick={handleSendCustomMessage}
                disabled={sending || !selectedTarget || !customTitle.trim() || !customBody.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md transition-all"
              >
                <Send className="w-4 h-4 mr-2" />
                发送自定义消息
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                💡 小贴士：可以发送任何你想对TA说的话哦~
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 历史记录 */}
        {pushHistory.length > 0 && (
          <Card className="bg-white/90 backdrop-blur border-purple-100 shadow-lg animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <h2 className="font-semibold text-gray-800">历史记录</h2>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {pushHistory.length}
                </Badge>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(() => {
                  // 按日期分组
                  const groupedByDate: Record<string, any[]> = {};
                  pushHistory.forEach(item => {
                    const date = new Date(item.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    if (!groupedByDate[date]) {
                      groupedByDate[date] = [];
                    }
                    groupedByDate[date].push(item);
                  });

                  // 按日期排序（最新的在前）
                  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                    return new Date(b).getTime() - new Date(a).getTime();
                  });

                  return sortedDates.map((date) => (
                    <div key={date} className="space-y-2">
                      {/* 日期标题 */}
                      <div className="flex items-center gap-2 py-2 px-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700">{date}</span>
                      </div>
                      
                      {/* 该日期的记录 */}
                      <div className="space-y-2 pl-2">
                        {groupedByDate[date].map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-purple-600">
                                  {item.target === '小菲' ? '👸' : '🤴'} {item.target}
                                </span>
                                <span className="text-xs text-gray-500">{item.time.split(' ')[1]}</span>
                              </div>
                              <Button
                                onClick={() => handleResend(item)}
                                disabled={sending}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs hover:bg-purple-100"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                再次发送
                              </Button>
                            </div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部装饰 */}
        <div className="text-center pt-8 pb-4 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
          <div className="flex justify-center gap-2 mb-2">
            {['💕', '✨', '💖'].map((emoji, i) => (
              <span
                key={i}
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            让爱意随时传递 · 让每一天都充满惊喜 💝
          </p>
        </div>
      </div>

      {/* 浮动装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {['💕', '✨', '💫', '🌸', '💖', '⭐'][i]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PushFun;
