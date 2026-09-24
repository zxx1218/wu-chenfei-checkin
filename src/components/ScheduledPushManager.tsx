import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { weatherPushApi } from '@/lib/api';
import { Cloud, Clock, Send, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface ScheduledSubscription {
  id: string;
  push_type?: string;
  target: string;
  device_key: string;
  push_time: string;
  enabled: number;
  message_template?: string | null;
  created_at: string;
}

// 推送模块配置
const PUSH_MODULES = [
  {
    id: 'weather',
    name: '天气推送',
    icon: Cloud,
    description: '每天自动推送天气消息',
    color: 'blue'
  }
  // 未来可以添加更多模块，例如：
  // {
  //   id: 'reminder',
  //   name: '提醒推送',
  //   icon: Bell,
  //   description: '定时发送提醒消息',
  //   color: 'orange'
  // }
];

export const ScheduledPushManager = () => {
  const [subscriptions, setSubscriptions] = useState<ScheduledSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('weather');
  
  // 表单数据
  const [formData, setFormData] = useState({
    target: '小菲',
    device_key: '7eBD3zF6E66Wqq7cCEjTBA',
    push_time: '07:00',
    message_template: '',
    push_type: 'weather'
  });

  // 加载订阅列表
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await weatherPushApi.getAll();
      if (response && response.data) {
        setSubscriptions(response.data);
      }
    } catch (error) {
      console.error('获取订阅列表失败:', error);
      toast.error('获取订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据模块过滤订阅
  const getModuleSubscriptions = (moduleId: string) => {
    return subscriptions.filter(sub => (sub.push_type || 'weather') === moduleId);
  };

  // 添加新订阅
  const handleAdd = async () => {
    if (!formData.target || !formData.device_key) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      await weatherPushApi.create({
        ...formData,
        push_type: activeModule
      });
      toast.success('添加成功');
      setShowAddForm(false);
      setFormData({ 
        target: '小菲', 
        device_key: '7eBD3zF6E66Wqq7cCEjTBA', 
        push_time: '07:00', 
        message_template: '',
        push_type: activeModule
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('添加失败:', error);
      toast.error('添加失败');
    }
  };

  // 更新订阅
  const handleUpdate = async (id: string) => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub) return;

      await weatherPushApi.update(id, {
        target: sub.target,
        device_key: sub.device_key,
        push_time: sub.push_time,
        enabled: sub.enabled,
        message_template: sub.message_template || null,
        push_type: sub.push_type || 'weather'
      });
      toast.success('更新成功');
      setEditingId(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  // 删除订阅
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个订阅吗？')) return;

    try {
      await weatherPushApi.delete(id);
      toast.success('删除成功');
      fetchSubscriptions();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 切换启用状态
  const toggleEnabled = async (sub: ScheduledSubscription) => {
    try {
      await weatherPushApi.update(sub.id, {
        ...sub,
        enabled: sub.enabled ? 0 : 1
      });
      toast.success(sub.enabled ? '已禁用' : '已启用');
      fetchSubscriptions();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  // 手动触发推送
  const handleTriggerPush = async (target?: string) => {
    try {
      const result = await weatherPushApi.trigger(target);
      if (result.success) {
        toast.success('推送成功');
      } else {
        toast.error('推送失败');
      }
    } catch (error) {
      console.error('推送失败:', error);
      toast.error('推送失败');
    }
  };

  // 开始编辑
  const startEdit = (sub: ScheduledSubscription) => {
    setEditingId(sub.id);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
  };

  // 更新订阅字段
  const updateSubscription = (id: string, field: string, value: any) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, [field]: value } : sub
      )
    );
  };

  // 渲染订阅列表
  const renderSubscriptionList = (moduleId: string) => {
    const moduleSubs = getModuleSubscriptions(moduleId);
    
    if (loading) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">加载中...</div>
      );
    }

    if (moduleSubs.length === 0) {
      const moduleConfig = PUSH_MODULES.find(m => m.id === moduleId);
      const IconComponent = moduleConfig?.icon || Cloud;
      return (
        <div className="text-center py-8 text-muted-foreground">
          <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无订阅，点击上方按钮添加</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {moduleSubs.map((sub) => (
          <div
            key={sub.id}
            className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
              sub.enabled 
                ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            {/* 卡片头部 - 移动端垂直布局 */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span className="text-xl sm:text-2xl flex-shrink-0">{sub.target === '小菲' ? '👸' : '🤴'}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{sub.target}</p>
                  <p className="text-xs text-gray-500 truncate">{sub.device_key.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
                <Switch
                  checked={!!sub.enabled}
                  onCheckedChange={() => toggleEnabled(sub)}
                  className="scale-90 sm:scale-100"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editingId === sub.id ? cancelEdit() : startEdit(sub)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  {editingId === sub.id ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(sub.id)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {editingId === sub.id ? (
              // 编辑模式
              <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">接收人</Label>
                    <select
                      value={sub.target}
                      onChange={(e) => updateSubscription(sub.id, 'target', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-blue-200 rounded bg-white"
                    >
                      <option value="小菲">👸 小菲</option>
                      <option value="zxx">🤴 zxx</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">推送时间</Label>
                    <Input
                      type="time"
                      value={sub.push_time}
                      onChange={(e) => updateSubscription(sub.id, 'push_time', e.target.value)}
                      className="w-full text-sm border-blue-200"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">设备Key</Label>
                  <Input
                    type="text"
                    value={sub.device_key}
                    onChange={(e) => updateSubscription(sub.id, 'device_key', e.target.value)}
                    className="w-full text-sm border-blue-200"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">
                    消息模板（可选）
                    <span className="text-[10px] text-gray-500 font-normal ml-1">变量：{'{target}'}, {'{temp}'}, {'{text}'}</span>
                  </Label>
                  <textarea
                    value={sub.message_template || ''}
                    onChange={(e) => updateSubscription(sub.id, 'message_template', e.target.value)}
                    placeholder="自定义推送消息，留空使用默认模板"
                    rows={3}
                    className="w-full px-2 py-1.5 text-sm border border-blue-200 rounded bg-white resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(sub.id)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm">
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} className="text-xs sm:text-sm">
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              // 查看模式 - 移动端垂直布局
              <div className="flex flex-col gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                    <span>每天 {sub.push_time}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={sub.enabled ? 'default' : 'secondary'} className="text-xs">
                      {sub.enabled ? '已启用' : '已禁用'}
                    </Badge>
                    {sub.message_template && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                        ✏️ 自定义模板
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTriggerPush(sub.target)}
                      className="h-7 px-2 text-xs hover:bg-blue-100 text-blue-600"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      立即推送
                    </Button>
                  </div>
                </div>
                
                {/* 模板内容预览 */}
                {sub.message_template && (
                  <div className="p-2 sm:p-3 bg-white/80 rounded-lg border border-blue-100">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">📝 当前模板：</p>
                    <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words font-sans leading-relaxed">
                      {sub.message_template}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card rounded-3xl shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}>
      <CardContent className="p-4 sm:p-6">
        {/* 头部区域 - 移动端垂直布局 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap">
            <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
            <span>定时推送管理</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {subscriptions.length} 个订阅
            </Badge>
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTriggerPush()}
              className="rounded-full gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">测试推送</span>
              <span className="sm:hidden">测试</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-full gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">添加订阅</span>
              <span className="sm:hidden">添加</span>
            </Button>
          </div>
        </div>

        {/* 添加订阅表单 */}
        {showAddForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">接收人</Label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="小菲">👸 小菲</option>
                  <option value="zxx">🤴 zxx</option>
                </select>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">推送时间</Label>
                <Input
                  type="time"
                  value={formData.push_time}
                  onChange={(e) => setFormData({ ...formData, push_time: e.target.value })}
                  className="w-full text-sm border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">设备Key</Label>
              <Input
                type="text"
                value={formData.device_key}
                onChange={(e) => setFormData({ ...formData, device_key: e.target.value })}
                placeholder="输入Bark设备key"
                className="w-full text-sm border-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                消息模板（可选）
                <span className="text-xs text-gray-500 font-normal ml-1">支持变量：{'{target}'}, {'{temp}'}, {'{text}'}</span>
              </Label>
              <textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                placeholder="自定义推送消息模板，留空则使用默认模板。示例：&#10;☀️ 早安{target}！今天温度{temp}°C，天气{text}~"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-blue-500 hover:bg-blue-600 text-sm">
                确认添加
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-sm">
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 模块标签页 */}
        <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-4">
            {PUSH_MODULES.map((module) => {
              const IconComponent = module.icon;
              const count = getModuleSubscriptions(module.id).length;
              return (
                <TabsTrigger key={module.id} value={module.id} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span>{module.name}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {PUSH_MODULES.map((module) => (
            <TabsContent key={module.id} value={module.id}>
              <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  💡 {module.description}
                </p>
              </div>
              {renderSubscriptionList(module.id)}
            </TabsContent>
          ))}
        </Tabs>

        <p className="text-xs text-muted-foreground mt-3 sm:mt-4 text-center px-2">
          💡 提示：每天会在设定时间自动推送消息给指定的人哦~（当前支持天气推送）
        </p>
      </CardContent>
    </Card>
  );
};
