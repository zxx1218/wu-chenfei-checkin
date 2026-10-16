const WeatherPushSubscription = require('../models/WeatherPushSubscription');
const PushHistory = require('../models/PushHistory');
const loggerHelper = require('../utils/loggerHelper');
const https = require('https');

// 和风天气API配置
const WEATHER_API_KEY = process.env.VITE_WEATHER_API_KEY || '';
const WEATHER_API_URL = 'https://devapi.qweather.com/v7/weather/now';

// Bark设备Key配置（从环境变量读取，支持VITE_前缀）
const BARK_DEVICE_KEYS = {
  zxx: process.env.VITE_BARK_KEY_ZXX || process.env.BARK_KEY_ZXX || '',
  xiaofei: process.env.VITE_BARK_KEY_XIAOFEI || process.env.BARK_KEY_XIAOFEI || ''
};

// 检查环境变量是否正确加载
loggerHelper.logBusinessProcess(
  'WeatherPushService',
  '初始化Bark设备Key配置',
  {
    zxx_configured: !!BARK_DEVICE_KEYS.zxx,
    xiaofei_configured: !!BARK_DEVICE_KEYS.xiaofei,
    env_keys_present: {
      VITE_BARK_KEY_ZXX: !!process.env.VITE_BARK_KEY_ZXX,
      VITE_BARK_KEY_XIAOFEI: !!process.env.VITE_BARK_KEY_XIAOFEI
    }
  },
  'info'
);

// 根据target获取对应的device_key
function getDeviceKeyByTarget(target) {
  if (target === 'zxx') {
    const key = BARK_DEVICE_KEYS.zxx;
    if (!key) {
      loggerHelper.logBusinessProcess(
        'WeatherPushService',
        '未找到zxx的设备Key',
        { availableKeys: Object.keys(BARK_DEVICE_KEYS) },
        'warn'
      );
    }
    return key;
  } else if (target === '小菲') {
    const key = BARK_DEVICE_KEYS.xiaofei;
    if (!key) {
      loggerHelper.logBusinessProcess(
        'WeatherPushService',
        '未找到小菲的设备Key',
        { availableKeys: Object.keys(BARK_DEVICE_KEYS) },
        'warn'
      );
    }
    return key;
  }
  loggerHelper.logBusinessProcess(
    'WeatherPushService',
    `未知的推送目标: ${target}`,
    {},
    'warn'
  );
  return '';
}

class WeatherPushService {
  // 模板变量定义（供前后端共享）
  static TEMPLATE_VARIABLES = [
    { key: '{target}', label: '称呼', desc: '接收人的昵称', example: '我的小公主' },
    { key: '{temp}', label: '温度', desc: '当前温度（摄氏度）', example: '22' },
    { key: '{text}', label: '天气', desc: '天气状况文字', example: '晴' },
    { key: '{windDir}', label: '风向', desc: '风的方向', example: '东南风' },
    { key: '{windScale}', label: '风力', desc: '风力等级', example: '2' },
    { key: '{humidity}', label: '湿度', desc: '空气湿度（百分比）', example: '45' },
    { key: '{location}', label: '地区', desc: '推送的地区名称', example: '浙江省湖州市德清县' },
  ];

  // 预置模板
  static PRESET_TEMPLATES = [
    {
      id: 'cute_sunny',
      name: '☀️ 甜美晴天版',
      template: '☀️ 早安呀{target}！今天{location}阳光超级好哦~\n🌡️ 当前温度：{temp}°C\n😊 天气：{text}\n💨 风力：{windDir}{windScale}级\n💧 湿度：{humidity}%\n✨ 记得涂防晒，戴墨镜哦！爱你哟~ 💕',
    },
    {
      id: 'cute_rainy',
      name: '🌧️ 温柔雨天版',
      template: '🌧️ {target}，今天{location}下雨了呢！\n🌡️ 当前温度：{temp}°C\n☔ 天气：{text}\n💨 风力：{windDir}{windScale}级\n💧 湿度：{humidity}%\n☂️ 一定要带伞哦！别淋湿了，我会心疼的~ 💕',
    },
    {
      id: 'simple',
      name: '📋 简洁实用版',
      template: '📍 {location} 天气播报\n🌡️ 温度：{temp}°C | {text}\n💨 {windDir}{windScale}级 | 💧 湿度{humidity}%\n💡 出门注意天气变化哦~',
    },
    {
      id: 'romantic',
      name: '💕 浪漫关怀版',
      template: '💌 亲爱的{target}，新的一天~\n📍 {location} | 🌡️ {temp}°C | {text}\n🍃 {windDir}{windScale}级 | 💦 湿度{humidity}%\n🌸 不管天气怎样，有你的每天都是好天气 💖',
    },
  ];

  // 模拟天气数据（用于预览）
  static MOCK_WEATHER = {
    temp: '22', text: '晴', windDir: '东南风', windScale: '2', humidity: '45'
  };

  // 获取默认模板（供前端展示）
  static getDefaultTemplates() {
    const mockTarget = '小菲';
    const mockLocation = '浙江省湖州市德清县';
    const mockWeather = this.MOCK_WEATHER;
    const nickname = '我的小公主';

    return {
      sunny: `☀️ 早安呀${nickname}！今天${mockLocation}阳光超级好哦~\n🌡️ 当前温度：${mockWeather.temp}°C\n😊 天气：${mockWeather.text}\n💨 风力：${mockWeather.windDir}${mockWeather.windScale}级\n💧 湿度：${mockWeather.humidity}%\n✨ 记得涂防晒，戴墨镜哦！爱你哟~ 💕`,
      cloudy: `☁️ 宝贝，今天${mockLocation}是阴天呢，不过也很舒适哦~\n🌡️ 当前温度：${mockWeather.temp}°C\n🌤️ 天气：${mockWeather.text}\n💨 风力：${mockWeather.windDir}${mockWeather.windScale}级\n💧 湿度：${mockWeather.humidity}%\n🎀 这样的天气最适合散步啦，要不要一起走走？💖`,
      rainy: `🌧️ 小可爱，今天${mockLocation}下雨了呢！\n🌡️ 当前温度：${mockWeather.temp}°C\n☔ 天气：${mockWeather.text}\n💨 风力：${mockWeather.windDir}${mockWeather.windScale}级\n💧 湿度：${mockWeather.humidity}%\n☂️ 一定要带伞哦！别淋湿了，我会心疼的~ 💕`,
      default: `🌈 早安我的女孩！新的一天开始啦~\n📍 地区：${mockLocation}\n🌡️ 当前温度：${mockWeather.temp}°C\n🌤️ 天气：${mockWeather.text}\n💨 风力：${mockWeather.windDir}${mockWeather.windScale}级\n💧 湿度：${mockWeather.humidity}%\n✨ 今天也要元气满满哦！加油！💪💕`,
    };
  }

  // 替换模板中的变量
  static replaceTemplateVariables(template, weatherData, target, locationName) {
    const { temp, text, windDir, windScale, humidity } = weatherData;
    const nickname = target === '小菲' ? '我的小公主' : '亲爱的';
    const location = locationName || (target === '小菲' ? '浙江省湖州市德清县' : '浙江省湖州市吴兴区');
    
    return template
      .replace(/{target}/g, nickname)
      .replace(/{temp}/g, temp)
      .replace(/{text}/g, text)
      .replace(/{windDir}/g, windDir)
      .replace(/{windScale}/g, windScale)
      .replace(/{humidity}/g, humidity)
      .replace(/{location}/g, location);
  }

  // 预览模板渲染效果
  static previewTemplate(template, target = '小菲', locationName = '浙江省湖州市德清县') {
    if (!template || !template.trim()) {
      return { title: '', body: '', error: '模板内容为空' };
    }
    try {
      const rendered = this.replaceTemplateVariables(template, this.MOCK_WEATHER, target, locationName);
      const lines = rendered.split('\n');
      return {
        title: lines[0],
        body: lines.slice(1).join('\n'),
        fullText: rendered,
        error: null,
      };
    } catch (e) {
      return { title: '', body: '', error: '模板渲染失败: ' + e.message };
    }
  }

  // 可爱的天气消息模板
  static generateWeatherMessage(weatherData, target, locationName) {
    const { temp, text, windDir, windScale, humidity } = weatherData;
    
    // 地区名称
    const location = locationName || (target === '小菲' ? '浙江省湖州市德清县' : '浙江省湖州市吴兴区');
    
    // 根据天气状况选择不同的可爱模板
    const templates = {
      sunny: [
        `☀️ 早安呀${target === '小菲' ? '我的小公主' : '亲爱的'}！今天${location}阳光超级好哦~\n🌡️ 当前温度：${temp}°C\n😊 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n✨ 记得涂防晒，戴墨镜哦！爱你哟~ 💕`,
        `🌞 新的一天开始啦！今天${location}的阳光特别温暖呢~\n🌡️ 温度：${temp}°C\n☁️ 天气：${text}\n🍃 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n🌸 出门前记得喝水，保持好心情哦！😘`
      ],
      cloudy: [
        `☁️ ${target === '小菲' ? '宝贝' : '亲爱的'}，今天${location}是阴天呢，不过也很舒适哦~\n🌡️ 当前温度：${temp}°C\n🌤️ 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n🎀 这样的天气最适合散步啦，要不要一起走走？💖`,
        `🌥️ 早安！虽然看不到太阳，但心情要像晴天一样哦~\n🌡️ 温度：${temp}°C\n☁️ 天气：${text}\n🍂 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n💝 记得带件薄外套，别着凉啦！关心你~ 😊`
      ],
      rainy: [
        `🌧️ ${target === '小菲' ? '小可爱' : '亲爱的'}，今天${location}下雨了呢！\n🌡️ 当前温度：${temp}°C\n☔ 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n☂️ 一定要带伞哦！别淋湿了，我会心疼的~ 💕`,
        `☔ 下雨天也要开心哦！听雨声也是一种浪漫呢~\n🌡️ 温度：${temp}°C\n🌧️ 天气：${text}\n🍃 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n🚗 路滑小心，注意安全！想你啦~ 😘`
      ],
      default: [
        `🌈 早安${target === '小菲' ? '我的女孩' : '亲爱的'}！新的一天开始啦~\n📍 地区：${location}\n🌡️ 当前温度：${temp}°C\n🌤️ 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n✨ 今天也要元气满满哦！加油！💪💕`,
        `💫 美好的一天从查看天气开始！\n📍 ${location}\n🌡️ 温度：${temp}°C\n☁️ 天气：${text}\n🍂 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n🌸 记得照顾好自己，我永远关心你~ 😊💖`
      ]
    };

    // 根据天气类型选择模板
    let category = 'default';
    if (text.includes('晴')) category = 'sunny';
    else if (text.includes('云') || text.includes('阴')) category = 'cloudy';
    else if (text.includes('雨')) category = 'rainy';

    const categoryTemplates = templates[category];
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }

  // 获取城市天气信息（使用经纬度）
  static async getWeather(latitude = 30.8575, longitude = 120.1255) {
    const startTime = Date.now();
    try {
      if (!WEATHER_API_KEY) {
        loggerHelper.logBusinessProcess(
          'WeatherAPI',
          'API Key未配置，使用模拟数据',
          { latitude, longitude },
          'warn'
        );
        return this.getMockWeather();
      }

      const url = `${WEATHER_API_URL}?location=${longitude},${latitude}&key=${WEATHER_API_KEY}`;
      
      loggerHelper.logBusinessProcess(
        'WeatherAPI',
        '请求天气数据',
        { url: url.replace(WEATHER_API_KEY, '***') }
      );
      
      return new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.code === '200' && response.now) {
                loggerHelper.logPerformance(
                  'WeatherAPI_GetWeather',
                  Date.now() - startTime,
                  { 
                    statusCode: res.statusCode,
                    location: `${latitude},${longitude}`,
                    weatherText: response.now.text
                  }
                );
                resolve(response.now);
              } else {
                loggerHelper.logError('和风天气API返回错误', new Error(`API Error: ${response.code}`), [
                  '检查API Key是否正确',
                  '验证经纬度坐标是否有效',
                  '查看和风天气API文档'
                ]);
                resolve(this.getMockWeather());
              }
            } catch (error) {
              loggerHelper.logError('解析天气数据失败', error);
              resolve(this.getMockWeather());
            }
          });
        }).on('error', (error) => {
          loggerHelper.logError('天气API请求失败', error);
          resolve(this.getMockWeather());
        });
      });
    } catch (error) {
      loggerHelper.logError('获取天气数据异常', error);
      return this.getMockWeather();
    }
  }

  // 模拟天气数据（用于测试或API不可用时）
  static getMockWeather() {
    const weathers = [
      { temp: '22', text: '晴', windDir: '东南风', windScale: '2', humidity: '45' },
      { temp: '20', text: '多云', windDir: '北风', windScale: '3', humidity: '55' },
      { temp: '18', text: '小雨', windDir: '东风', windScale: '2', humidity: '70' },
      { temp: '25', text: '晴间多云', windDir: '南风', windScale: '1', humidity: '40' },
    ];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }

  // 推送天气消息到Bark
  static async pushWeatherMessage(subscription) {
    const startTime = Date.now();
    try {
      const { target, message_template, location_name, latitude, longitude } = subscription;
      
      // 从环境变量动态获取设备key，而不是使用数据库中存储的值
      const device_key = getDeviceKeyByTarget(target);
      
      if (!device_key) {
        loggerHelper.logError(
          `Bark推送失败 - 未找到目标用户 ${target} 的设备Key`,
          new Error('Device key not found'),
          ['检查.env文件中是否配置了对应的BARK_KEY']
        );
        return false;
      }
      
      // 获取天气信息：优先使用订阅中的经纬度，否则使用默认值
      const lat = latitude || (target === '小菲' ? 30.5425 : 30.8575);
      const lon = longitude || (target === '小菲' ? 119.9774 : 120.1255);
      
      loggerHelper.logBusinessProcess(
        'WeatherPush',
        `获取${location_name || '默认地区'}的天气数据`,
        { target, latitude: lat, longitude: lon }
      );
      
      const weatherData = await this.getWeather(lat, lon);
      
      // 生成消息：优先使用自定义模板，否则使用默认模板
      let message;
      if (message_template && message_template.trim()) {
        loggerHelper.logBusinessProcess(
          'WeatherPush',
          '使用自定义消息模板',
          { target, hasTemplate: true }
        );
        // 使用自定义模板，替换变量
        message = this.replaceTemplateVariables(message_template, weatherData, target, location_name);
      } else {
        loggerHelper.logBusinessProcess(
          'WeatherPush',
          '使用默认可爱模板',
          { target, hasTemplate: false }
        );
        // 使用默认的可爱模板
        message = this.generateWeatherMessage(weatherData, target, location_name);
      }
      
      // 提取标题（第一行）
      const title = message.split('\n')[0];
      const body = message.split('\n').slice(1).join('\n');
      
      // 推送到Bark
      const barkUrl = process.env.VITE_BARK_PUSH_URL || 'https://api.day.app/push';
      
      const payload = {
        title: title,
        body: body,
        level: 'active',
        sound: 'bell',
        icon: 'https://picsum.photos/id/10/400/300',
        group: '每日天气提醒',
        url: process.env.VITE_BARK_JUMP_URL || 'http://cheerout.cn:40001',
        device_keys: [device_key]
      };

      loggerHelper.logBusinessProcess(
        'BarkPush',
        `向${target}推送天气消息`,
        { 
          target,
          title: title.substring(0, 50),
          barkUrl: barkUrl
        }
      );

      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);
        
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(barkUrl, options, async (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', async () => {
            const duration = Date.now() - startTime;
            
            if (res.statusCode === 200) {
              loggerHelper.logPerformance(
                'BarkPush_Success',
                duration,
                { 
                  target,
                  statusCode: res.statusCode,
                  responseSize: data.length
                }
              );

              // 记录推送历史
              try {
                await PushHistory.create({
                  title: title,
                  body: body,
                  target: target,
                  device_key: device_key,
                  sound: 'bell',
                  status: 'success',
                  push_type: 'weather',
                });
              } catch (historyErr) {
                loggerHelper.logError('记录天气推送历史失败', historyErr);
              }

              resolve(true);
            } else {
              loggerHelper.logError(
                `Bark API返回错误状态码: ${res.statusCode}`,
                new Error(data),
                ['检查Bark服务是否正常', '验证device_key是否正确']
              );

              // 记录失败的推送历史
              try {
                await PushHistory.create({
                  title: title,
                  body: body,
                  target: target,
                  device_key: device_key,
                  sound: 'bell',
                  status: 'failed',
                  push_type: 'weather',
                });
              } catch (historyErr) {
                loggerHelper.logError('记录天气推送历史失败', historyErr);
              }

              resolve(false);
            }
          });
        });

        req.on('error', async (error) => {
          loggerHelper.logError('Bark请求失败', error);

          try {
            await PushHistory.create({
              title: title,
              body: body,
              target: target,
              device_key: device_key,
              sound: 'bell',
              status: 'failed',
              push_type: 'weather',
            });
          } catch (historyErr) {
            loggerHelper.logError('记录天气推送历史失败', historyErr);
          }

          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      loggerHelper.logError('推送天气消息异常', error);
      return false;
    }
  }

  // 执行定时推送任务
  static async executeDailyPush() {
    const startTime = Date.now();
    try {
      loggerHelper.logScheduledTask(
        'DailyWeatherPush',
        {},
        'start'
      );
      
      // 获取所有启用的订阅
      const subscriptions = await WeatherPushSubscription.findEnabled();
      
      if (subscriptions.length === 0) {
        loggerHelper.logBusinessProcess(
          'DailyWeatherPush',
          '未找到启用的天气推送订阅',
          {},
          'info'
        );
        return { success: true, message: 'No subscriptions to push' };
      }

      loggerHelper.logBusinessProcess(
        'DailyWeatherPush',
        `发现${subscriptions.length}个启用的订阅`,
        { count: subscriptions.length }
      );
      
      const results = [];
      let successCount = 0;
      let failCount = 0;
      
      for (const subscription of subscriptions) {
        loggerHelper.logBusinessProcess(
          'DailyWeatherPush',
          `向${subscription.target}推送天气`,
          { 
            target: subscription.target,
            location: subscription.location_name 
          }
        );
        
        const success = await this.pushWeatherMessage(subscription);
        
        results.push({
          target: subscription.target,
          success: success
        });
        
        if (success) {
          successCount++;
          loggerHelper.logBusinessProcess(
            'DailyWeatherPush',
            `✓ 成功推送给${subscription.target}`,
            { target: subscription.target }
          );
        } else {
          failCount++;
          loggerHelper.logBusinessProcess(
            'DailyWeatherPush',
            `✗ 推送失败: ${subscription.target}`,
            { target: subscription.target },
            'warn'
          );
        }
      }

      loggerHelper.logScheduledTask(
        'DailyWeatherPush',
        {
          success: true,
          totalSubscriptions: subscriptions.length,
          successCount,
          failCount,
          results,
          duration: Date.now() - startTime
        },
        'end'
      );
      
      return {
        success: true,
        message: 'Daily weather push completed',
        results: results
      };
    } catch (error) {
      loggerHelper.logError('每日天气推送任务执行失败', error, [
        '检查数据库连接是否正常',
        '确认WeatherPushSubscription模型是否正确加载',
        '验证Bark API配置'
      ]);
      return {
        success: false,
        message: 'Daily weather push failed',
        error: error.message
      };
    }
  }

  // 手动触发天气推送（用于测试）
  static async triggerWeatherPush(target) {
    try {
      let subscriptions;
      
      if (target) {
        subscriptions = await WeatherPushSubscription.findByTarget(target);
      } else {
        subscriptions = await WeatherPushSubscription.findEnabled();
      }
      
      if (subscriptions.length === 0) {
        return { success: false, message: 'No subscriptions found' };
      }

      const results = [];
      for (const subscription of subscriptions) {
        const success = await this.pushWeatherMessage(subscription);
        results.push({ target: subscription.target, success });
      }

      return {
        success: true,
        message: 'Weather push triggered',
        results: results
      };
    } catch (error) {
      loggerHelper.logError('手动触发天气推送失败', error);
      return {
        success: false,
        message: 'Failed to trigger weather push',
        error: error.message
      };
    }
  }
}

module.exports = WeatherPushService;
