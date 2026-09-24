const WeatherPushService = require('../services/weatherPushService');

// 测试模板变量替换功能
console.log('=== 测试天气推送模板变量替换 ===\n');

const testWeatherData = {
  temp: '25',
  text: '晴',
  windDir: '南风',
  windScale: '3',
  humidity: '60'
};

// 测试1：小菲的自定义模板
console.log('测试1：小菲的自定义模板');
const template1 = '☀️ 早安{target}！今天温度{temp}°C，天气{text}~\n💨 {windDir}{windScale}级风\n💧 湿度{humidity}%\n✨ 记得多喝水哦！';
const result1 = WeatherPushService.replaceTemplateVariables(template1, testWeatherData, '小菲');
console.log(result1);
console.log('\n---\n');

// 测试2：zxx的自定义模板
console.log('测试2：zxx的自定义模板');
const template2 = '🌤️ {target}，今日天气播报：\n🌡️ {temp}°C | {text}\n🍃 {windDir}{windScale}级 | 💦 {humidity}%\n💝 注意防晒，保持好心情！';
const result2 = WeatherPushService.replaceTemplateVariables(template2, testWeatherData, 'zxx');
console.log(result2);
console.log('\n---\n');

// 测试3：简单模板
console.log('测试3：简洁模板');
const template3 = '{target}，今天{temp}度，{text}。';
const result3 = WeatherPushService.replaceTemplateVariables(template3, testWeatherData, '小菲');
console.log(result3);
console.log('\n---\n');

console.log('✅ 所有测试完成！');
