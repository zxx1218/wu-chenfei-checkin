const WeatherPushService = require('../services/weatherPushService');
const logger = require('../config/logger');

async function testLocationWeather() {
  console.log('=== 测试地区天气推送功能 ===\n');

  // 测试1：德清县天气
  console.log('📍 测试1：浙江省湖州市德清县');
  const deqingWeather = await WeatherPushService.getWeather(30.5333, 120.0833);
  console.log('天气数据:', JSON.stringify(deqingWeather, null, 2));
  
  // 生成消息
  const deqingMessage = WeatherPushService.generateWeatherMessage(deqingWeather, '小菲', '浙江省湖州市德清县');
  console.log('\n生成的消息:');
  console.log(deqingMessage);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2：北京天气
  console.log('📍 测试2：北京市');
  const beijingWeather = await WeatherPushService.getWeather(39.9042, 116.4074);
  console.log('天气数据:', JSON.stringify(beijingWeather, null, 2));
  
  const beijingMessage = WeatherPushService.generateWeatherMessage(beijingWeather, 'zxx', '北京市');
  console.log('\n生成的消息:');
  console.log(beijingMessage);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3：自定义模板带location变量
  console.log('📝 测试3：自定义模板（包含{location}变量）');
  const customTemplate = '☀️ 早安{target}！今天{location}的天气是{text}，温度{temp}°C，{windDir}{windScale}级，湿度{humidity}%。记得照顾好自己哦~ 💕';
  const customMessage = WeatherPushService.replaceTemplateVariables(customTemplate, deqingWeather, '小菲', '浙江省湖州市德清县');
  console.log('\n自定义模板消息:');
  console.log(customMessage);
  
  console.log('\n✅ 所有测试完成！');
}

testLocationWeather().catch(error => {
  logger.error('测试失败:', error);
  process.exit(1);
});
