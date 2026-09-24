const WeatherPushSubscription = require('../models/WeatherPushSubscription');
const logger = require('../config/logger');
const https = require('https');

// 和风天气API配置
const WEATHER_API_KEY = process.env.VITE_WEATHER_API_KEY || '';
const WEATHER_API_URL = 'https://devapi.qweather.com/v7/weather/now';

class WeatherPushService {
  // 替换模板中的变量
  static replaceTemplateVariables(template, weatherData, target) {
    const { temp, text, windDir, windScale, humidity } = weatherData;
    
    // 根据target确定昵称
    const nickname = target === '小菲' ? '我的小公主' : '亲爱的';
    
    return template
      .replace(/{target}/g, nickname)
      .replace(/{temp}/g, temp)
      .replace(/{text}/g, text)
      .replace(/{windDir}/g, windDir)
      .replace(/{windScale}/g, windScale)
      .replace(/{humidity}/g, humidity);
  }

  // 可爱的天气消息模板
  static generateWeatherMessage(weatherData, target) {
    const { temp, text, windDir, windScale, humidity } = weatherData;
    
    // 根据天气状况选择不同的可爱模板
    const templates = {
      sunny: [
        `☀️ 早安呀${target === '小菲' ? '我的小公主' : '亲爱的'}！今天阳光超级好哦~\n🌡️ 当前温度：${temp}°C\n😊 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n✨ 记得涂防晒，戴墨镜哦！爱你哟~ 💕`,
        `🌞 新的一天开始啦！今天的阳光特别温暖呢~\n🌡️ 温度：${temp}°C\n☁️ 天气：${text}\n🍃 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n🌸 出门前记得喝水，保持好心情哦！😘`
      ],
      cloudy: [
        `☁️ ${target === '小菲' ? '宝贝' : '亲爱的'}，今天是阴天呢，不过也很舒适哦~\n🌡️ 当前温度：${temp}°C\n🌤️ 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n🎀 这样的天气最适合散步啦，要不要一起走走？💖`,
        `🌥️ 早安！虽然看不到太阳，但心情要像晴天一样哦~\n🌡️ 温度：${temp}°C\n☁️ 天气：${text}\n🍂 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n💝 记得带件薄外套，别着凉啦！关心你~ 😊`
      ],
      rainy: [
        `🌧️ ${target === '小菲' ? '小可爱' : '亲爱的'}，今天下雨了呢！\n🌡️ 当前温度：${temp}°C\n☔ 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n☂️ 一定要带伞哦！别淋湿了，我会心疼的~ 💕`,
        `☔ 下雨天也要开心哦！听雨声也是一种浪漫呢~\n🌡️ 温度：${temp}°C\n🌧️ 天气：${text}\n🍃 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n🚗 路滑小心，注意安全！想你啦~ 😘`
      ],
      default: [
        `🌈 早安${target === '小菲' ? '我的女孩' : '亲爱的'}！新的一天开始啦~\n🌡️ 当前温度：${temp}°C\n🌤️ 天气：${text}\n💨 风力：${windDir}${windScale}级\n💧 湿度：${humidity}%\n✨ 今天也要元气满满哦！加油！💪💕`,
        `💫 美好的一天从查看天气开始！\n🌡️ 温度：${temp}°C\n☁️ 天气：${text}\n🍂 微风：${windDir}${windScale}级\n💦 湿度：${humidity}%\n🌸 记得照顾好自己，我永远关心你~ 😊💖`
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
  static async getWeather(latitude = 39.9042, longitude = 116.4074) {
    try {
      if (!WEATHER_API_KEY) {
        logger.warn('Weather API key not configured, using mock data');
        return this.getMockWeather();
      }

      const url = `${WEATHER_API_URL}?location=${longitude},${latitude}&key=${WEATHER_API_KEY}`;
      
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
                resolve(response.now);
              } else {
                logger.error('Weather API error:', response);
                resolve(this.getMockWeather());
              }
            } catch (error) {
              logger.error('Parse weather data error:', error);
              resolve(this.getMockWeather());
            }
          });
        }).on('error', (error) => {
          logger.error('Weather API request failed:', error);
          resolve(this.getMockWeather());
        });
      });
    } catch (error) {
      logger.error('Get weather error:', error);
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
    try {
      const { target, device_key, message_template } = subscription;
      
      // 获取天气信息（这里使用北京的经纬度，可根据需要修改）
      const weatherData = await this.getWeather(39.9042, 116.4074);
      
      // 生成消息：优先使用自定义模板，否则使用默认模板
      let message;
      if (message_template && message_template.trim()) {
        // 使用自定义模板，替换变量
        message = this.replaceTemplateVariables(message_template, weatherData, target);
      } else {
        // 使用默认的可爱模板
        message = this.generateWeatherMessage(weatherData, target);
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

      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(payload);
        
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(barkUrl, options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              logger.info(`Weather pushed to ${target} successfully`);
              resolve(true);
            } else {
              logger.error(`Bark API error: ${res.statusCode}`, data);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          logger.error('Bark request error:', error);
          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      logger.error('Push weather message error:', error);
      return false;
    }
  }

  // 执行定时推送任务
  static async executeDailyPush() {
    try {
      logger.info('=== Starting daily weather push ===');
      
      // 获取所有启用的订阅
      const subscriptions = await WeatherPushSubscription.findEnabled();
      
      if (subscriptions.length === 0) {
        logger.info('No enabled weather push subscriptions found');
        return { success: true, message: 'No subscriptions to push' };
      }

      logger.info(`Found ${subscriptions.length} enabled subscription(s)`);
      
      const results = [];
      
      for (const subscription of subscriptions) {
        logger.info(`Pushing weather to ${subscription.target}...`);
        const success = await this.pushWeatherMessage(subscription);
        
        results.push({
          target: subscription.target,
          success: success
        });
        
        if (success) {
          logger.info(`✓ Successfully pushed weather to ${subscription.target}`);
        } else {
          logger.error(`✗ Failed to push weather to ${subscription.target}`);
        }
      }

      logger.info('=== Daily weather push completed ===');
      
      return {
        success: true,
        message: 'Daily weather push completed',
        results: results
      };
    } catch (error) {
      logger.error('Error in daily weather push:', error);
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
      logger.error('Trigger weather push error:', error);
      return {
        success: false,
        message: 'Failed to trigger weather push',
        error: error.message
      };
    }
  }
}

module.exports = WeatherPushService;
