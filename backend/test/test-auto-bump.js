const AutoCheckinService = require('../services/autoCheckinService');

async function testAutoSafeBump() {
  console.log('Testing auto safe bump check-in for yesterday...\n');
  
  const result = await AutoCheckinService.autoSafeBumpForToday();
  
  console.log('\nResult:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Test passed!');
    console.log(`Date checked: ${result.date}`);
    console.log(`Action: ${result.action}`);
  } else {
    console.log('\n❌ Test failed!');
    console.log('Error:', result.error);
  }
}

testAutoSafeBump().catch(console.error);
