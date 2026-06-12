const AutoCheckinService = require('../services/autoCheckinService');

async function testAutoNoMilktea() {
  console.log('Testing auto no-milktea check-in for yesterday...\n');
  
  const result = await AutoCheckinService.autoNoMilkteaForToday();
  
  console.log('\nResult:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Test passed!');
    console.log(`Date checked: ${result.date}`);
    console.log(`Results for each drinker:`);
    result.results.forEach(r => {
      console.log(`  - ${r.drinker}: ${r.action}`);
    });
  } else {
    console.log('\n❌ Test failed!');
    console.log('Error:', result.error);
  }
}

testAutoNoMilktea().catch(console.error);
