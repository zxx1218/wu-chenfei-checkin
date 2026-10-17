import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { incomePushApi, pushHistoryApi, getDeviceKeyByTarget } from '@/lib/api';
import {
  DollarSign, Clock, Send, Plus, Trash2, Edit2, Loader2, History,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Coins,
} from 'lucide-react';

interface IncomeConfig {
  id: string;
  target: string;
  device_key: string;
  item_name: string;
  item_type: string;
  push_time: string;
  push_day: number;
  push_frequency: string;
  amount: number;
  salary_details: Record<string, number> | null;
  push_message: string | null;
  enabled: number;
  created_at: string;
}

interface SalaryField {
  key: string;
  label: string;
  icon: string;
  type: 'income' | 'deduction';
}

interface PushRecord {
  id: string;
  title: string;
  body: string;
  target: string;
  status: string;
  push_type: string;
  created_at: string;
}

const ITEM_TYPES = [
  { value: 'salary', label: '工资', icon: '💼', color: 'blue' },
  { value: 'freelance', label: '兼职', icon: '🔧', color: 'green' },
  { value: 'other', label: '其他', icon: '💎', color: 'purple' },
];

const EMPTY_FORM = {
  target: 'zxx',
  device_key: '',
  item_name: '',
  item_type: 'salary',
  push_time: '10:00',
  push_frequency: 'daily',
  push_day: 1,
  amount: 0,
  salary_details: { working_days: 21.75 } as Record<string, number>,
  push_message: '',
};

const PUSH_FREQUENCIES = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
];

const WEEK_DAYS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' },
];

const DEFAULT_SALARY_FIELDS: SalaryField[] = [
  { key: 'base_salary', label: '基本工资', icon: '💼', type: 'income' },
  { key: 'position_allowance', label: '岗位津贴', icon: '📋', type: 'income' },
  { key: 'performance', label: '绩效工资', icon: '🏆', type: 'income' },
  { key: 'overtime_pay', label: '加班费', icon: '⏰', type: 'income' },
  { key: 'bonus', label: '奖金', icon: '🎁', type: 'income' },
  { key: 'subsidy', label: '指尖饭卡补贴', icon: '📦', type: 'income' },
  { key: 'other_income', label: '其他收入', icon: '💎', type: 'income' },
  { key: 'pension_insurance', label: '养老保险', icon: '🧓', type: 'deduction' },
  { key: 'medical_insurance', label: '医疗保险', icon: '🏥', type: 'deduction' },
  { key: 'unemployment_insurance', label: '失业保险', icon: '🛡️', type: 'deduction' },
  { key: 'housing_fund', label: '公积金', icon: '🏠', type: 'deduction' },
  { key: 'enterprise_annuity', label: '企业年金', icon: '🏦', type: 'deduction' },
  { key: 'tax', label: '个税', icon: '💸', type: 'deduction' },
  { key: 'other_deduction', label: '其他扣款', icon: '📉', type: 'deduction' },
];

export const IncomePushManager = () => {
  const [configs, setConfigs] = useState<IncomeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [salaryFields, setSalaryFields] = useState<SalaryField[]>(DEFAULT_SALARY_FIELDS);
  const [preview, setPreview] = useState<{ title: string; body: string; fullText: string } | null>(null);

  // 推送历史
  const [pushHistory, setPushHistory] = useState<PushRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const el = textareaRef.current;
    if (!el) {
      setForm({ ...form, push_message: (form.push_message || '') + variable });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = form.push_message || '';
    const newText = text.slice(0, start) + variable + text.slice(end);
    setForm({ ...form, push_message: newText });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await incomePushApi.getAll();
      if (res?.data) {
        setConfigs(res.data.map((c: any) => ({
          ...c,
          salary_details: typeof c.salary_details === 'string' ? JSON.parse(c.salary_details) : c.salary_details,
        })));
      }
    } catch {
      toast.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPushHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await pushHistoryApi.getByType('income', 50);
      if (res?.data) setPushHistory(res.data);
    } catch { /* silent */ } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchPushHistory();
    incomePushApi.getSalaryFields().then(res => {
      if (res?.data) setSalaryFields(res.data);
    }).catch(() => {});
  }, []);

  const openAddDialog = () => {
    const deviceKey = getDeviceKeyByTarget('zxx');
    setForm({ ...EMPTY_FORM, device_key: deviceKey, salary_details: { working_days: 21.75 } });
    setEditingId(null);
    setPreview(null);
    setDialogOpen(true);
  };

  const openEditDialog = (config: IncomeConfig) => {
    const details = config.salary_details || {};
    setForm({
      target: config.target,
      device_key: config.device_key,
      item_name: config.item_name,
      item_type: config.item_type,
      push_time: config.push_time,
      push_frequency: config.push_frequency || 'daily',
      push_day: config.push_day || 1,
      amount: config.amount,
      salary_details: { working_days: 21.75, ...details },
      push_message: config.push_message || '',
    });
    setEditingId(config.id);
    setPreview(null);
    setDialogOpen(true);
  };

  const handleTargetChange = (target: string) => {
    setForm({ ...form, target, device_key: getDeviceKeyByTarget(target) });
  };

  const handleSalaryDetailChange = (key: string, value: string) => {
    const num = parseFloat(value) || 0;
    setForm({
      ...form,
      salary_details: { ...form.salary_details, [key]: num },
    });
  };

  const calcNetPay = () => {
    const details = form.salary_details || {};
    const income = salaryFields
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + (Number(details[f.key]) || 0), 0);
    const deductions = salaryFields
      .filter(f => f.type === 'deduction')
      .reduce((sum, f) => sum + (Number(details[f.key]) || 0), 0);
    return income - deductions;
  };

  const calcDailyWage = () => {
    const workingDays = Number(form.salary_details?.working_days) || 21.75;
    return calcNetPay() / workingDays;
  };

  const handlePreview = useCallback(async () => {
    try {
      const res = await incomePushApi.preview({
        ...form,
        amount: form.item_type === 'salary' ? calcNetPay() : form.amount,
      });
      if (res?.data) setPreview(res.data);
    } catch {
      setPreview(null);
    }
  }, [form]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dialogOpen) handlePreview();
    }, 500);
    return () => clearTimeout(timer);
  }, [form.item_type, form.item_name, form.amount, form.salary_details, form.push_message, dialogOpen]);

  const handleSubmit = async () => {
    if (!form.target || !form.item_name) {
      toast.error('请填写项目名称');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: form.item_type === 'salary' ? calcNetPay() : form.amount,
        salary_details: form.item_type === 'salary' ? form.salary_details : null,
        push_message: form.push_message?.trim() || null,
        enabled: 1,
      };

      if (editingId) {
        await incomePushApi.update(editingId, payload);
        toast.success('更新成功');
      } else {
        await incomePushApi.create(payload);
        toast.success('添加成功');
      }
      setDialogOpen(false);
      fetchConfigs();
    } catch {
      toast.error(editingId ? '更新失败' : '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;
    try {
      await incomePushApi.delete(id);
      toast.success('删除成功');
      fetchConfigs();
    } catch {
      toast.error('删除失败');
    }
  };

  const toggleEnabled = async (config: IncomeConfig) => {
    try {
      await incomePushApi.update(config.id, { enabled: config.enabled ? 0 : 1 });
      toast.success(config.enabled ? '已禁用' : '已启用');
      fetchConfigs();
    } catch {
      toast.error('更新状态失败');
    }
  };

  const handleTrigger = async (id: string) => {
    try {
      const result = await incomePushApi.trigger(id);
      if (result.success) {
        toast.success('推送成功 💰');
        setTimeout(fetchPushHistory, 1000);
      } else toast.error('推送失败');
    } catch {
      toast.error('推送失败');
    }
  };

  const formatMoney = (n: number) =>
    Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getItemTypeMeta = (type: string) => ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[2];

  return (
    <>
      {/* 收入推送模块 */}
      <Card className="bg-card rounded-3xl shadow-sm border border-border/50 mt-4">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">收入推送</h2>
                <p className="text-xs text-muted-foreground">{configs.length} 个配置 · {pushHistory.length} 条记录</p>
              </div>
            </div>
            <Button size="sm" onClick={openAddDialog} className="rounded-xl h-9 text-xs bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-3.5 h-3.5 mr-1" />
              添加
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">加载中...</div>
          ) : configs.length === 0 ? (
            <div className="text-center py-10">
              <Coins className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">还没有收入配置</p>
              <p className="text-xs text-muted-foreground/60 mt-1">点击上方「添加」记录你的收入来源</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map(config => {
                const meta = getItemTypeMeta(config.item_type);
                return (
                  <div
                    key={config.id}
                    className={`relative rounded-2xl border-2 p-4 transition-all ${
                      config.enabled
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-green-50/50'
                        : 'border-gray-200 bg-gray-50/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <p className="font-bold text-sm text-foreground">{config.item_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {config.item_type === 'salary'
                                ? `每天 ${config.push_time}`
                                : (config.push_frequency || 'daily') === 'daily'
                                  ? `每天 ${config.push_time}`
                                  : (config.push_frequency || 'daily') === 'weekly'
                                    ? `每周${WEEK_DAYS.find(d => d.value === config.push_day)?.label || ''} ${config.push_time}`
                                    : `每月${config.push_day}号 ${config.push_time}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Switch checked={!!config.enabled} onCheckedChange={() => toggleEnabled(config)} className="scale-90" />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(config)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(config.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={config.enabled ? 'default' : 'secondary'} className="text-[10px] h-5">
                        {config.enabled ? '✓ 运行中' : '○ 已暂停'}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] h-5 ${
                        config.item_type === 'salary' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        config.item_type === 'freelance' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-purple-50 text-purple-600 border-purple-200'
                      }`}>
                        {meta.icon} {meta.label}
                      </Badge>
                      <span className="text-sm font-bold text-emerald-600 ml-auto">
                        {config.item_type === 'salary'
                          ? `日均 ¥${formatMoney((() => {
                              const d = config.salary_details || {};
                              const wd = Number(d.working_days) || 21.75;
                              const inc = salaryFields.filter(f => f.type === 'income').reduce((s, f) => s + (Number(d[f.key]) || 0), 0);
                              const ded = salaryFields.filter(f => f.type === 'deduction').reduce((s, f) => s + (Number(d[f.key]) || 0), 0);
                              return (inc - ded) / wd;
                            })())}`
                          : `¥${formatMoney(config.amount)}`
                        }
                      </span>
                    </div>

                    {config.item_type === 'salary' && config.salary_details && Object.values(config.salary_details).some(v => v !== 0) && (
                      <div className="mt-3 p-2.5 bg-white/70 rounded-xl border border-emerald-100">
                        <p className="text-[10px] text-muted-foreground/60 mb-1 font-medium">工资明细</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                          {salaryFields.filter(f => config.salary_details?.[f.key]).map(f => (
                            <div key={f.key} className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">{f.icon} {f.label}</span>
                              <span className={f.type === 'deduction' ? 'text-red-500' : 'text-foreground/80'}>
                                {f.type === 'deduction' ? '-' : ''}¥{formatMoney(Math.abs(config.salary_details![f.key]))}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-dashed border-emerald-200 space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">📆 月工作天数</span>
                            <span className="text-foreground/80">{Number(config.salary_details?.working_days) || 21.75} 天</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-emerald-600">💰 日均工资</span>
                            <span className="text-emerald-600">¥{formatMoney((() => {
                              const d = config.salary_details!;
                              const wd = Number(d.working_days) || 21.75;
                              const inc = salaryFields.filter(f => f.type === 'income').reduce((s, f) => s + (Number(d[f.key]) || 0), 0);
                              const ded = salaryFields.filter(f => f.type === 'deduction').reduce((s, f) => s + (Number(d[f.key]) || 0), 0);
                              return (inc - ded) / wd;
                            })())}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 px-3 text-[11px] text-emerald-600 hover:bg-emerald-100"
                        onClick={() => handleTrigger(config.id)}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        立即推送
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 推送历史（合并在同一卡片内） */}
          <div className="mt-5 pt-4 border-t-2 border-dashed border-border/40">
            <button
              type="button"
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-foreground">推送历史</span>
                <Badge variant="outline" className="text-[10px] h-5 bg-amber-50 text-amber-600 border-amber-200">
                  {pushHistory.length} 条
                </Badge>
              </div>
              {historyExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {historyExpanded && (
              <div className="mt-3 animate-fade-in">
                {historyLoading ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />加载中...
                  </div>
                ) : pushHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground/60">暂无推送记录</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {pushHistory.map(record => (
                      <div
                        key={record.id}
                        className={`rounded-xl border p-3 transition-all cursor-pointer ${
                          record.status === 'success'
                            ? 'border-green-200 bg-green-50/50 hover:bg-green-50'
                            : 'border-red-200 bg-red-50/50 hover:bg-red-50'
                        } ${expandedRecord === record.id ? 'ring-2 ring-emerald-200' : ''}`}
                        onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {record.status === 'success'
                              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                            <span className="text-lg">💰</span>
                            <div>
                              <p className="text-sm font-medium text-foreground leading-tight">{record.target}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(record.created_at)}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[10px] h-5 ${
                            record.status === 'success' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {record.status === 'success' ? '成功' : '失败'}
                          </Badge>
                        </div>
                        {expandedRecord === record.id && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 animate-fade-in">
                            <div className="p-3 bg-white/80 rounded-lg">
                              <p className="text-sm font-bold text-foreground mb-1.5">{record.title}</p>
                              <p className="text-xs text-foreground/75 whitespace-pre-line leading-relaxed">{record.body}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              {editingId ? '编辑收入配置' : '添加收入配置'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* 接收人 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">推送给谁</Label>
              <div className="flex gap-2">
                {['zxx', '小菲'].map(t => (
                  <Button
                    key={t} type="button"
                    variant={form.target === t ? 'default' : 'outline'}
                    onClick={() => handleTargetChange(t)}
                    className={`flex-1 rounded-xl h-11 transition-all ${
                      form.target === t ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' : 'border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {t === '小菲' ? '👸' : '🤴'} {t}
                  </Button>
                ))}
              </div>
            </div>

            {/* 收入类型 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">收入类型</Label>
              <div className="flex gap-2">
                {ITEM_TYPES.map(t => (
                  <Button
                    key={t.value} type="button"
                    variant={form.item_type === t.value ? 'default' : 'outline'}
                    onClick={() => setForm({ ...form, item_type: t.value, item_name: form.item_name || t.label })}
                    className={`flex-1 rounded-xl h-11 transition-all ${
                      form.item_type === t.value
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                        : 'border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {t.icon} {t.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 项目名称 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">项目名称</Label>
              <Input
                value={form.item_name}
                onChange={e => setForm({ ...form, item_name: e.target.value })}
                placeholder="例如：10月工资、设计兼职..."
                className="rounded-xl h-11 border-emerald-200"
              />
            </div>

            {/* 推送时间 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">推送时间</Label>
              <Input
                type="time"
                value={form.push_time}
                onChange={e => setForm({ ...form, push_time: e.target.value })}
                className="rounded-xl h-11 border-emerald-200"
              />
            </div>

            {/* 推送频率（非工资类型） */}
            {form.item_type !== 'salary' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">推送频率</Label>
                <div className="flex gap-2">
                  {PUSH_FREQUENCIES.map(f => (
                    <Button
                      key={f.value} type="button"
                      variant={form.push_frequency === f.value ? 'default' : 'outline'}
                      onClick={() => setForm({ ...form, push_frequency: f.value, push_day: f.value === 'weekly' ? 1 : 1 })}
                      className={`flex-1 rounded-xl h-10 transition-all text-sm ${
                        form.push_frequency === f.value
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                          : 'border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
                {form.push_frequency === 'weekly' && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {WEEK_DAYS.map(d => (
                      <Button
                        key={d.value} type="button"
                        size="sm"
                        variant={form.push_day === d.value ? 'default' : 'outline'}
                        onClick={() => setForm({ ...form, push_day: d.value })}
                        className={`rounded-lg h-8 px-3 text-xs ${
                          form.push_day === d.value
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>
                )}
                {form.push_frequency === 'monthly' && (
                  <div className="mt-2">
                    <label className="text-[11px] text-muted-foreground mb-1 block">每月几号推送</label>
                    <Input
                      type="number" min={1} max={31}
                      value={form.push_day}
                      onChange={e => setForm({ ...form, push_day: parseInt(e.target.value) || 1 })}
                      className="h-9 rounded-lg text-sm border-emerald-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 工资明细（仅工资类型） */}
            {form.item_type === 'salary' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">💼 工资明细</Label>
                <p className="text-[11px] text-muted-foreground">填写各项金额，系统自动计算日均工资并每天推送</p>

                {/* 月工作天数 */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">📆 月工作天数（用于计算日均工资）</label>
                  <Input
                    type="number" step="0.25" min="1" max="31"
                    value={form.salary_details.working_days ?? 21.75}
                    onChange={e => setForm({
                      ...form,
                      salary_details: { ...form.salary_details, working_days: parseFloat(e.target.value) || 21.75 },
                    })}
                    placeholder="21.75"
                    className="h-9 rounded-lg text-sm border-emerald-200"
                  />
                  <p className="text-[10px] text-muted-foreground/60">法定月计薪天数 21.75 天</p>
                </div>

                {/* 收入项 */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-emerald-600">收入项目</p>
                  <div className="grid grid-cols-2 gap-2">
                    {salaryFields.filter(f => f.type === 'income').map(field => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">{field.icon} {field.label}</label>
                        <Input
                          type="number" step="0.01" min="0"
                          value={form.salary_details[field.key] || ''}
                          onChange={e => handleSalaryDetailChange(field.key, e.target.value)}
                          placeholder="0.00"
                          className="h-9 rounded-lg text-sm border-emerald-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 扣款项 */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-red-500">扣除项目</p>
                  <div className="grid grid-cols-2 gap-2">
                    {salaryFields.filter(f => f.type === 'deduction').map(field => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">{field.icon} {field.label}</label>
                        <Input
                          type="number" step="0.01" min="0"
                          value={form.salary_details[field.key] || ''}
                          onChange={e => handleSalaryDetailChange(field.key, e.target.value)}
                          placeholder="0.00"
                          className="h-9 rounded-lg text-sm border-red-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 实发 & 日均计算 */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-700">✅ 月实发工资</span>
                    <span className="text-base font-bold text-emerald-600">¥{formatMoney(calcNetPay())}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-emerald-300">
                    <span className="text-sm font-bold text-emerald-700">💰 日均工资</span>
                    <span className="text-lg font-extrabold text-emerald-600">¥{formatMoney(calcDailyWage())}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 text-center">
                    ¥{formatMoney(calcNetPay())} ÷ {Number(form.salary_details?.working_days) || 21.75}天 = ¥{formatMoney(calcDailyWage())}/天
                  </p>
                </div>
              </div>
            )}

            {/* 非工资类型的金额输入 */}
            {form.item_type !== 'salary' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">💵 金额</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">¥</span>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.amount || ''}
                    onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="rounded-xl h-11 pl-8 border-emerald-200 text-lg font-bold"
                  />
                </div>
              </div>
            )}

            {/* 自定义消息（可选） */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">自定义消息</Label>
                <Badge variant="outline" className="text-[10px]">可选</Badge>
              </div>
              <Textarea
                ref={textareaRef}
                value={form.push_message || ''}
                onChange={e => setForm({ ...form, push_message: e.target.value })}
                placeholder="留空使用默认模板，点击下方变量可快速插入..."
                rows={3}
                className="rounded-xl border-emerald-200 resize-none text-sm"
              />
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground/60 font-medium">点击插入变量：</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.item_type === 'salary' ? (
                    <>
                      <button type="button" onClick={() => insertVariable('{daily_wage}')}
                        className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 hover:bg-emerald-100 transition-colors">
                        {'{daily_wage}'} <span className="text-emerald-400 ml-1">今日到手</span>
                      </button>
                      <button type="button" onClick={() => insertVariable('{monthly_net}')}
                        className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 hover:bg-emerald-100 transition-colors">
                        {'{monthly_net}'} <span className="text-emerald-400 ml-1">月实发</span>
                      </button>
                      <button type="button" onClick={() => insertVariable('{working_days}')}
                        className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 hover:bg-emerald-100 transition-colors">
                        {'{working_days}'} <span className="text-emerald-400 ml-1">工作天数</span>
                      </button>
                      <button type="button" onClick={() => insertVariable('{item_name}')}
                        className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 hover:bg-emerald-100 transition-colors">
                        {'{item_name}'} <span className="text-emerald-400 ml-1">项目名称</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => insertVariable('{amount}')}
                        className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 hover:bg-emerald-100 transition-colors">
                        {'{amount}'} <span className="text-emerald-400 ml-1">收入金额</span>
                      </button>
                      <button type="button" onClick={() => insertVariable('{item_name}')}
                        className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 hover:bg-emerald-100 transition-colors">
                        {'{item_name}'} <span className="text-emerald-400 ml-1">项目名称</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 预览 */}
            {preview && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <span>👀</span> 推送预览
                </p>
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <p className="text-sm font-bold text-foreground mb-1">{preview.title}</p>
                  <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{preview.body}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">取消</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.target || !form.item_name}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 保存中...</> : (editingId ? '保存更改' : '确认添加')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
