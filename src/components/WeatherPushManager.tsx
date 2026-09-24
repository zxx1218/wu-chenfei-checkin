import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { weatherPushApi } from '@/lib/api';
import { Cloud, Clock, Send, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface WeatherSubscription {
  id: string;
  target: string;
  device_key: string;
  push_time: string;
  enabled: number;
  created_at: string;
}

export const WeatherPushManager = () => {
  const [subscriptions, setSubscriptions] = useState<WeatherSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    target: '小菲',
    device_key: '7eBD3zF6E66Wqq7cCEjTBA',
    push_time: '07:00'
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

  // 添加新订阅
  const handleAdd = async () => {
    if (!formData.target || !formData.device_key) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      await weatherPushApi.create(formData);
      toast.success('添加成功');
      setShowAddForm(false);
      setFormData({ target: '小菲', device_key: '7eBD3zF6E66Wqq7cCEjTBA', push_time: '07:00' });
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
        enabled: sub.enabled
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
  const toggleEnabled = async (sub: WeatherSubscription) => {
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
  const startEdit = (sub: WeatherSubscription) => {
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

  return (
    <Card className="bg-card rounded-3xl shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Cloud className="w-6 h-6 text-blue-500" />
            <span>每日天气推送</span>
            <Badge variant="secondary" className="ml-2">
              {subscriptions.length} 个订阅
            </Badge>
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTriggerPush()}
              className="rounded-full gap-1.5"
            >
              <Send className="w-4 h-4" />
              测试推送
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-full gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Plus className="w-4 h-4" />
              添加订阅
            </Button>
          </div>
        </div>

        {/* 添加订阅表单 */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">接收人</Label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="小菲">👸 小菲</option>
                  <option value="zxx">🤴 zxx</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">推送时间</Label>
                <Input
                  type="time"
                  value={formData.push_time}
                  onChange={(e) => setFormData({ ...formData, push_time: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">设备Key</Label>
              <Input
                type="text"
                value={formData.device_key}
                onChange={(e) => setFormData({ ...formData, device_key: e.target.value })}
                placeholder="输入Bark设备key"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-blue-500 hover:bg-blue-600">
                确认添加
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 订阅列表 */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Cloud className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无订阅，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  sub.enabled 
                    ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.target === '小菲' ? '👸' : '🤴'}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{sub.target}</p>
                      <p className="text-xs text-gray-500">{sub.device_key.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!sub.enabled}
                      onCheckedChange={() => toggleEnabled(sub)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => editingId === sub.id ? cancelEdit() : startEdit(sub)}
                      className="h-8 w-8 p-0"
                    >
                      {editingId === sub.id ? <RefreshCw className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(sub.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingId === sub.id ? (
                  <div className="space-y-3 mt-3 pt-3 border-t border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="text-sm border-blue-200"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">设备Key</Label>
                      <Input
                        type="text"
                        value={sub.device_key}
                        onChange={(e) => updateSubscription(sub.id, 'device_key', e.target.value)}
                        className="text-sm border-blue-200"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(sub.id)} className="flex-1 bg-blue-500 hover:bg-blue-600">
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>每天 {sub.push_time}</span>
                    </div>
                    <Badge variant={sub.enabled ? 'default' : 'secondary'} className="text-xs">
                      {sub.enabled ? '已启用' : '已禁用'}
                    </Badge>
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
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          💡 提示：每天会在设定时间自动推送可爱的天气消息给指定的人哦~
        </p>
      </CardContent>
    </Card>
  );
};
