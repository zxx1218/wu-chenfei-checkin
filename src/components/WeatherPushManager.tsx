import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { weatherPushApi, getDeviceKeyByTarget } from '@/lib/api';
import { Cloud, Clock, Send, Plus, Trash2, Edit, RefreshCw, FileText } from 'lucide-react';

interface WeatherSubscription {
  id: string;
  target: string;
  device_key: string;
  push_time: string;
  enabled: number;
  message_template?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export const WeatherPushManager = () => {
  const [subscriptions, setSubscriptions] = useState<WeatherSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 表单数据 - 从环境变量读取默认设备ID
  const [formData, setFormData] = useState({
    target: '小菲',
    device_key: getDeviceKeyByTarget('小菲'),
    push_time: '07:00',
    message_template: '',
    location_name: '',
    latitude: '',
    longitude: ''
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
      await weatherPushApi.create({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        location_name: formData.location_name || null
      });
      toast.success('添加成功');
      setShowAddForm(false);
      setFormData({ 
        target: '小菲', 
        device_key: getDeviceKeyByTarget('小菲'),
        push_time: '07:00', 
        message_template: '',
        location_name: '',
        latitude: '',
        longitude: ''
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
        location_name: sub.location_name || null,
        latitude: sub.latitude || null,
        longitude: sub.longitude || null
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
                  onChange={(e) => {
                    const newTarget = e.target.value;
                    setFormData({ 
                      ...formData, 
                      target: newTarget,
                      device_key: getDeviceKeyByTarget(newTarget)
                    });
                  }}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">推送地区</Label>
                <select
                  value={formData.location_name}
                  onChange={(e) => {
                    const selected = e.target.value;
                    let lat = '', lon = '';
                    if (selected === '浙江省湖州市德清县') {
                      lat = '30.5333';
                      lon = '120.0833';
                    } else if (selected === '浙江省湖州市吴兴区') {
                      lat = '30.8703';
                      lon = '120.1094';
                    } else if (selected === '浙江省杭州市吴兴区') {
                      lat = '30.2741';
                      lon = '120.1551';
                    } else if (selected === '山西省太原市小店区') {
                      lat = '37.8706';
                      lon = '112.5617';
                    } else if (selected === '山西省太原市杏花岭区') {
                      lat = '37.8894';
                      lon = '112.5644';
                    } else if (selected === '北京市') {
                      lat = '39.9042';
                      lon = '116.4074';
                    }
                    setFormData({ 
                      ...formData, 
                      location_name: selected,
                      latitude: lat,
                      longitude: lon
                    });
                  }}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="">选择预设城市（可选）</option>
                  <option value="浙江省湖州市德清县">📍 浙江省湖州市德清县</option>
                  <option value="浙江省湖州市吴兴区">📍 浙江省湖州市吴兴区</option>
                  <option value="浙江省杭州市吴兴区">📍 浙江省杭州市吴兴区</option>
                  <option value="山西省太原市小店区">📍 山西省太原市小店区</option>
                  <option value="山西省太原市杏花岭区">📍 山西省太原市杏花岭区</option>
                  <option value="北京市">📍 北京市</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">纬度</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="30.5333"
                  className="text-sm border-blue-200"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">经度</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="120.0833"
                  className="text-sm border-blue-200"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">地区名称</Label>
                <Input
                  type="text"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="自定义地区名"
                  className="text-sm border-blue-200"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              💡 选择预设城市或手动输入经纬度，留空则使用默认地区
            </p>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                消息模板（可选）
                <Badge variant="outline" className="ml-2 text-xs">✏️ 自定义</Badge>
              </Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                placeholder="留空则使用默认可爱模板&#10;&#10;可用变量：&#10;{target} - 昵称&#10;{temp} - 温度&#10;{text} - 天气&#10;{windDir} - 风向&#10;{windScale} - 风力&#10;{humidity} - 湿度&#10;{location} - 地区"
                rows={4}
                className="border-blue-200 focus:border-blue-400 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 第一行作为标题，其余为内容。留空使用系统默认模板
              </p>
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
                          onChange={(e) => {
                            const newTarget = e.target.value;
                            updateSubscription(sub.id, 'target', newTarget);
                            // 自动更新对应的设备Key
                            updateSubscription(sub.id, 'device_key', getDeviceKeyByTarget(newTarget));
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-blue-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                          className="text-sm border-blue-200 w-full max-w-[200px]"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">设备Key</Label>
                      <Input
                        type="text"
                        value={sub.device_key}
                        readOnly
                        placeholder="从环境变量自动获取"
                        className="text-sm border-blue-200 bg-gray-50 cursor-not-allowed opacity-75"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 根据接收人自动从.env配置中读取
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-3">
                        <Label className="text-xs text-gray-600 mb-1 block">推送地区</Label>
                        <select
                          value={sub.location_name || ''}
                          onChange={(e) => {
                            const selected = e.target.value;
                            let lat = null, lon = null;
                            if (selected === '浙江省湖州市德清县') {
                              lat = 30.5333;
                              lon = 120.0833;
                            } else if (selected === '浙江省湖州市吴兴区') {
                              lat = 30.8703;
                              lon = 120.1094;
                            } else if (selected === '浙江省杭州市吴兴区') {
                              lat = 30.2741;
                              lon = 120.1551;
                            } else if (selected === '山西省太原市小店区') {
                              lat = 37.8706;
                              lon = 112.5617;
                            } else if (selected === '山西省太原市杏花岭区') {
                              lat = 37.8894;
                              lon = 112.5644;
                            } else if (selected === '北京市') {
                              lat = 39.9042;
                              lon = 116.4074;
                            }
                            updateSubscription(sub.id, 'location_name', selected);
                            updateSubscription(sub.id, 'latitude', lat);
                            updateSubscription(sub.id, 'longitude', lon);
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-blue-200 rounded bg-white"
                        >
                          <option value="">选择预设城市（可选）</option>
                          <option value="浙江省湖州市德清县">📍 浙江省湖州市德清县</option>
                          <option value="浙江省湖州市吴兴区">📍 浙江省湖州市吴兴区</option>
                          <option value="浙江省杭州市吴兴区">📍 浙江省杭州市吴兴区</option>
                          <option value="山西省太原市小店区">📍 山西省太原市小店区</option>
                          <option value="山西省太原市杏花岭区">📍 山西省太原市杏花岭区</option>
                          <option value="北京市">📍 北京市</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">纬度</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={sub.latitude || ''}
                          onChange={(e) => updateSubscription(sub.id, 'latitude', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="30.5333"
                          className="text-sm border-blue-200"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">经度</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={sub.longitude || ''}
                          onChange={(e) => updateSubscription(sub.id, 'longitude', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="120.0833"
                          className="text-sm border-blue-200"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">地区名称</Label>
                        <Input
                          type="text"
                          value={sub.location_name || ''}
                          onChange={(e) => updateSubscription(sub.id, 'location_name', e.target.value || null)}
                          placeholder="自定义地区名"
                          className="text-sm border-blue-200"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      💡 选择预设城市或手动输入经纬度，留空则使用默认地区
                    </p>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        消息模板（可选）
                      </Label>
                      <Textarea
                        value={sub.message_template || ''}
                        onChange={(e) => updateSubscription(sub.id, 'message_template', e.target.value)}
                        placeholder="留空则使用默认可爱模板&#10;&#10;可用变量：&#10;{target} - 昵称&#10;{temp} - 温度&#10;{text} - 天气&#10;{windDir} - 风向&#10;{windScale} - 风力&#10;{humidity} - 湿度&#10;{location} - 地区"
                        rows={4}
                        className="text-sm border-blue-200 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 第一行作为标题，其余为内容。留空使用系统默认模板
                      </p>
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>每天 {sub.push_time}</span>
                      </div>
                      <Badge variant={sub.enabled ? 'default' : 'secondary'} className="text-xs">
                        {sub.enabled ? '已启用' : '已禁用'}
                      </Badge>
                      {sub.location_name && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                          📍 {sub.location_name}
                        </Badge>
                      )}
                      {!sub.location_name && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                          🌍 默认地区
                        </Badge>
                      )}
                      {sub.message_template && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
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
                    
                    {/* 显示当前使用的模板 */}
                    {sub.message_template && (
                      <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-purple-700 mb-1">当前使用的自定义模板：</p>
                            <pre className="text-xs text-purple-600 whitespace-pre-wrap break-words font-sans">
                              {sub.message_template}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                    {!sub.message_template && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Cloud className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-blue-600">
                              📝 使用系统默认的可爱风格模板（根据天气类型自动选择）
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
