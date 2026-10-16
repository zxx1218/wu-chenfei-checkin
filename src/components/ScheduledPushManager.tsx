import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { weatherPushApi, pushHistoryApi, getDeviceKeyByTarget } from '@/lib/api';
import { Cloud, Clock, Send, Plus, Trash2, Edit2, MapPin, Eye, Loader2, History, CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface WeatherSubscription {
  id: string;
  push_type?: string;
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

interface PresetTemplate {
  id: string;
  name: string;
  template: string;
}

interface TemplateVariable {
  key: string;
  label: string;
  desc: string;
  example: string;
}

interface DefaultTemplates {
  sunny: string;
  cloudy: string;
  rainy: string;
  default: string;
}

interface WeatherPushRecord {
  id: string;
  title: string;
  body: string;
  target: string;
  status: string;
  push_type: string;
  created_at: string;
}

const PRESET_LOCATIONS = [
  { name: '浙江省湖州市德清县', latitude: 30.5425, longitude: 119.9774 },
  { name: '浙江省湖州市吴兴区', latitude: 30.8575, longitude: 120.1255 },
  { name: '山西省太原市小店区', latitude: 37.7356, longitude: 112.6159 },
  { name: '山西省太原市杏花岭区', latitude: 37.8905, longitude: 112.5644 },
  { name: '北京市', latitude: 39.9042, longitude: 116.4074 },
];

const EMPTY_FORM = {
  target: '小菲',
  device_key: '',
  push_time: '07:00',
  message_template: '',
  location_name: '浙江省湖州市德清县',
  latitude: 30.5425 as number | null,
  longitude: 119.9774 as number | null,
};

const DEFAULT_TEMPLATE_LABELS: Record<string, { emoji: string; label: string }> = {
  sunny: { emoji: '☀️', label: '晴天模板' },
  cloudy: { emoji: '☁️', label: '多云模板' },
  rainy: { emoji: '🌧️', label: '雨天模板' },
  default: { emoji: '🌈', label: '默认模板' },
};

export const ScheduledPushManager = () => {
  const [subscriptions, setSubscriptions] = useState<WeatherSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [preview, setPreview] = useState<{ title: string; body: string; fullText: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [presets, setPresets] = useState<PresetTemplate[]>([]);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<DefaultTemplates | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedDefault, setExpandedDefault] = useState<string | null>(null);

  // 推送历史
  const [pushHistory, setPushHistory] = useState<WeatherPushRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await weatherPushApi.getAll();
      if (response?.data) setSubscriptions(response.data);
    } catch {
      toast.error('获取订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await weatherPushApi.getPresets();
      if (response?.data) {
        setPresets(response.data);
        setVariables(response.variables || []);
        if (response.defaultTemplates) setDefaultTemplates(response.defaultTemplates);
      }
    } catch {
      setVariables([
        { key: '{target}', label: '称呼', desc: '接收人昵称', example: '我的小公主' },
        { key: '{temp}', label: '温度', desc: '当前温度', example: '22' },
        { key: '{text}', label: '天气', desc: '天气状况', example: '晴' },
        { key: '{windDir}', label: '风向', desc: '风的方向', example: '东南风' },
        { key: '{windScale}', label: '风力', desc: '风力等级', example: '2' },
        { key: '{humidity}', label: '湿度', desc: '空气湿度', example: '45' },
        { key: '{location}', label: '地区', desc: '地区名称', example: '浙江省湖州市德清县' },
      ]);
    }
  };

  const fetchPushHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await pushHistoryApi.getByType('weather', 50);
      if (response?.data) setPushHistory(response.data);
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchPresets();
    fetchPushHistory();
  }, []);

  const openAddDialog = () => {
    const deviceKey = getDeviceKeyByTarget('小菲');
    setForm({ ...EMPTY_FORM, device_key: deviceKey });
    setEditingId(null);
    setPreview(null);
    setDialogOpen(true);
  };

  const openEditDialog = (sub: WeatherSubscription) => {
    setForm({
      target: sub.target,
      device_key: sub.device_key,
      push_time: sub.push_time,
      message_template: sub.message_template || '',
      location_name: sub.location_name || '',
      latitude: sub.latitude || null,
      longitude: sub.longitude || null,
    });
    setEditingId(sub.id);
    setPreview(null);
    setDialogOpen(true);
  };

  const handleTargetChange = (target: string) => {
    const deviceKey = target ? getDeviceKeyByTarget(target) : '';
    setForm({ ...form, target, device_key: deviceKey });
  };

  const handleLocationChange = (locationName: string) => {
    const loc = PRESET_LOCATIONS.find(l => l.name === locationName);
    if (loc) {
      setForm({ ...form, location_name: loc.name, latitude: loc.latitude, longitude: loc.longitude });
    } else {
      setForm({ ...form, location_name: locationName });
    }
  };

  const insertVariable = (varKey: string) => {
    setForm({ ...form, message_template: (form.message_template || '') + varKey });
  };

  const applyPreset = (preset: PresetTemplate) => {
    setForm({ ...form, message_template: preset.template });
  };

  const handlePreview = useCallback(async () => {
    if (!form.message_template?.trim()) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await weatherPushApi.preview(form.message_template, form.target, form.location_name || undefined);
      setPreview(res.data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [form.message_template, form.target, form.location_name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.message_template?.trim() && dialogOpen) {
        handlePreview();
      } else {
        setPreview(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.message_template, form.target, form.location_name, dialogOpen, handlePreview]);

  const handleSubmit = async () => {
    if (!form.target) {
      toast.error('请选择接收人');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        push_type: 'weather',
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        message_template: form.message_template?.trim() || null,
        enabled: 1,
      };

      if (editingId) {
        await weatherPushApi.update(editingId, payload);
        toast.success('更新成功');
      } else {
        await weatherPushApi.create(payload);
        toast.success('添加成功');
      }
      setDialogOpen(false);
      fetchSubscriptions();
    } catch {
      toast.error(editingId ? '更新失败' : '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个订阅吗？')) return;
    try {
      await weatherPushApi.delete(id);
      toast.success('删除成功');
      fetchSubscriptions();
    } catch {
      toast.error('删除失败');
    }
  };

  const toggleEnabled = async (sub: WeatherSubscription) => {
    try {
      await weatherPushApi.update(sub.id, { ...sub, enabled: sub.enabled ? 0 : 1 });
      toast.success(sub.enabled ? '已禁用' : '已启用');
      fetchSubscriptions();
    } catch {
      toast.error('更新状态失败');
    }
  };

  const handleTestPush = async (target?: string) => {
    try {
      const result = await weatherPushApi.trigger(target);
      if (result.success) {
        toast.success('推送成功 💕');
        setTimeout(fetchPushHistory, 1000);
      } else toast.error('推送失败');
    } catch {
      toast.error('推送失败');
    }
  };

  const isPreset = (name: string) => PRESET_LOCATIONS.some(l => l.name === name);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hour}:${min}`;
  };

  return (
    <>
      {/* 订阅管理卡片 */}
      <Card className="bg-card rounded-3xl shadow-sm border border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">定时推送</h2>
                <p className="text-xs text-muted-foreground">{subscriptions.length} 个订阅</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleTestPush()} className="rounded-xl h-9 text-xs">
                <Send className="w-3.5 h-3.5 mr-1" />
                测试
              </Button>
              <Button size="sm" onClick={openAddDialog} className="rounded-xl h-9 text-xs bg-blue-500 hover:bg-blue-600">
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">加载中...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10">
              <Cloud className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">还没有订阅</p>
              <p className="text-xs text-muted-foreground/60 mt-1">点击上方「添加」创建第一个推送订阅</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map(sub => (
                <div
                  key={sub.id}
                  className={`relative rounded-2xl border-2 p-4 transition-all ${
                    sub.enabled
                      ? 'border-blue-200 bg-gradient-to-br from-blue-50/80 to-cyan-50/50'
                      : 'border-gray-200 bg-gray-50/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{sub.target === '小菲' ? '👸' : '🤴'}</span>
                      <div>
                        <p className="font-bold text-sm text-foreground">{sub.target}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            每天 {sub.push_time}
                          </span>
                          {sub.location_name && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {sub.location_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Switch checked={!!sub.enabled} onCheckedChange={() => toggleEnabled(sub)} className="scale-90" />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(sub)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(sub.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={sub.enabled ? 'default' : 'secondary'} className="text-[10px] h-5">
                      {sub.enabled ? '✓ 运行中' : '○ 已暂停'}
                    </Badge>
                    {sub.message_template ? (
                      <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-600 border-blue-200">
                        自定义模板
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-5 bg-amber-50 text-amber-600 border-amber-200">
                        ✨ 默认模板
                      </Badge>
                    )}
                    <Button
                      size="sm" variant="ghost"
                      className="h-6 px-2 text-[10px] ml-auto text-blue-600 hover:bg-blue-100"
                      onClick={() => handleTestPush(sub.target)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      立即推送
                    </Button>
                  </div>

                  {/* 自定义模板预览 */}
                  {sub.message_template && (
                    <div className="mt-3 p-2.5 bg-white/70 rounded-xl border border-blue-100">
                      <p className="text-[10px] text-muted-foreground/60 mb-1 font-medium">模板预览</p>
                      <p className="text-xs text-foreground/80 whitespace-pre-line line-clamp-3 leading-relaxed">
                        {sub.message_template}
                      </p>
                    </div>
                  )}

                  {/* 默认模板展示 */}
                  {!sub.message_template && defaultTemplates && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setExpandedDefault(expandedDefault === sub.id ? null : sub.id)}
                        className="flex items-center gap-1.5 text-[11px] text-amber-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        查看默认模板内容
                        {expandedDefault === sub.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {expandedDefault === sub.id && (
                        <div className="mt-2 space-y-2 animate-fade-in">
                          {Object.entries(defaultTemplates).map(([key, template]) => {
                            const meta = DEFAULT_TEMPLATE_LABELS[key];
                            return (
                              <div key={key} className="p-2.5 bg-white/70 rounded-xl border border-amber-100">
                                <p className="text-[10px] text-amber-600 font-medium mb-1">
                                  {meta?.emoji} {meta?.label}
                                </p>
                                <p className="text-[11px] text-foreground/75 whitespace-pre-line leading-relaxed line-clamp-4">
                                  {template}
                                </p>
                              </div>
                            );
                          })}
                          <p className="text-[10px] text-muted-foreground/50 text-center">
                            系统会根据当天天气自动选择对应模板
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground/60 text-center mt-4">
            每天会在设定时间自动推送天气消息
          </p>
        </CardContent>
      </Card>

      {/* 推送历史卡片 */}
      <Card className="bg-card rounded-3xl shadow-sm border border-border/50 mt-4">
        <CardContent className="p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <History className="w-5 h-5 text-violet-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-foreground">推送历史</h2>
                <p className="text-xs text-muted-foreground">{pushHistory.length} 条记录</p>
              </div>
            </div>
            {historyExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {historyExpanded && (
            <div className="mt-4 animate-fade-in">
              {historyLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  加载中...
                </div>
              ) : pushHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-10 h-10 mx-auto mb-2 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">暂无推送记录</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">推送成功后会自动记录在这里</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {pushHistory.map(record => (
                    <div
                      key={record.id}
                      className={`rounded-xl border p-3 transition-all cursor-pointer ${
                        record.status === 'success'
                          ? 'border-green-200 bg-green-50/50 hover:bg-green-50'
                          : 'border-red-200 bg-red-50/50 hover:bg-red-50'
                      } ${expandedRecord === record.id ? 'ring-2 ring-violet-200' : ''}`}
                      onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {record.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <span className="text-2xl">{record.target === '小菲' ? '👸' : '🤴'}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground leading-tight">
                              {record.target}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatTime(record.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${
                            record.status === 'success'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {record.status === 'success' ? '成功' : '失败'}
                        </Badge>
                      </div>

                      {/* 展开显示完整内容 */}
                      {expandedRecord === record.id && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 animate-fade-in">
                          <div className="p-3 bg-white/80 rounded-lg">
                            <p className="text-sm font-bold text-foreground mb-1.5">{record.title}</p>
                            <p className="text-xs text-foreground/75 whitespace-pre-line leading-relaxed">
                              {record.body}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Cloud className="w-5 h-5 text-blue-500" />
              {editingId ? '编辑订阅' : '添加订阅'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">接收人</Label>
              <div className="flex gap-2">
                {['小菲', 'zxx'].map(t => (
                  <Button
                    key={t}
                    type="button"
                    variant={form.target === t ? 'default' : 'outline'}
                    onClick={() => handleTargetChange(t)}
                    className={`flex-1 rounded-xl h-11 transition-all ${
                      form.target === t
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                        : 'border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {t === '小菲' ? '👸' : '🤴'} {t}
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                设备Key：{form.target ? (form.device_key ? '已自动配置 ✓' : '未配置') : '请先选择接收人'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">推送时间</Label>
              <Input
                type="time"
                value={form.push_time}
                onChange={e => setForm({ ...form, push_time: e.target.value })}
                className="rounded-xl h-11 border-blue-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">推送地区</Label>
              <Select value={form.location_name || ''} onValueChange={handleLocationChange}>
                <SelectTrigger className="rounded-xl h-11 border-blue-200">
                  <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PRESET_LOCATIONS.map(loc => (
                    <SelectItem key={loc.name} value={loc.name}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isPreset(form.location_name || '') && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">纬度</Label>
                    <Input
                      type="number" step="0.0001"
                      value={form.latitude || ''}
                      onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || null })}
                      placeholder="30.5425"
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">经度</Label>
                    <Input
                      type="number" step="0.0001"
                      value={form.longitude || ''}
                      onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || null })}
                      placeholder="119.9774"
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">消息模板</Label>
                <Badge variant="outline" className="text-[10px]">可选</Badge>
              </div>

              {presets.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground font-medium">快速选择模板</p>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map(p => (
                      <Button
                        key={p.id} type="button" size="sm" variant="outline"
                        className={`h-7 text-[11px] rounded-lg transition-all ${
                          form.message_template === p.template
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'hover:bg-blue-50'
                        }`}
                        onClick={() => applyPreset(p)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  value={form.message_template || ''}
                  onChange={e => setForm({ ...form, message_template: e.target.value })}
                  placeholder="留空使用默认模板，或自定义消息内容..."
                  rows={4}
                  className="rounded-xl border-blue-200 resize-none text-sm leading-relaxed"
                />

                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground font-medium">
                    点击插入变量
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map(v => (
                      <Button
                        key={v.key} type="button" size="sm" variant="ghost"
                        className="h-7 text-[11px] rounded-lg border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 px-2"
                        onClick={() => insertVariable(v.key)}
                        title={`${v.desc}，例如：${v.example}`}
                      >
                        {v.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {previewLoading ? (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">预览生成中...</span>
                </div>
              ) : preview ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-[11px] text-muted-foreground font-medium">推送预览</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <p className="text-sm font-bold text-foreground mb-1">{preview.title}</p>
                    <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{preview.body}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">
                    * 预览使用模拟天气数据，实际推送时会获取实时天气
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.target}
              className="rounded-xl bg-blue-500 hover:bg-blue-600"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 保存中...</>
              ) : (
                editingId ? '保存更改' : '确认添加'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
