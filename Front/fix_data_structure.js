const fs = require('fs');

// Read the new data
const newData = JSON.parse(fs.readFileSync('/Users/kenlee/Projects/stech_fresh4/Front/kafa_data_clean.js', 'utf8'));

// Convert to expected structure
const convertedData = {};

// Process university leagues
Object.entries(newData).forEach(([league, divisions]) => {
  if (league === 'Amateur') {
    // Amateur/사회인 needs different structure: league.team
    convertedData['사회인'] = {
      team: divisions  // divisions is the data directly for Amateur
    };
  } else {
    // University leagues need: league.division.team structure
    const convertedLeague = {};
    Object.entries(divisions).forEach(([division, data]) => {
      convertedLeague[division] = {
        team: data
      };
    });
    
    // Map English names to Korean
    const leagueNameMap = {
      'Seoul': '서울',
      'Gyeonggi-Gangwon': '경기강원', 
      'Daegu-Gyeongbuk': '대구경북',
      'Busan-Gyeongnam': '부산경남'
    };
    
    convertedData[leagueNameMap[league] || league] = convertedLeague;
  }
});

console.log('Converted data structure:');
Object.keys(convertedData).forEach(league => {
  console.log(`${league}:`, Object.keys(convertedData[league]));
  if (league === '사회인') {
    console.log(`  team keys:`, Object.keys(convertedData[league].team));
  } else {
    Object.keys(convertedData[league]).forEach(division => {
      console.log(`  ${division}.team keys:`, Object.keys(convertedData[league][division].team));
    });
  }
});

// Save converted data
const output = `    const kafaStyleData = ${JSON.stringify(convertedData, null, 2)};`;
fs.writeFileSync('/Users/kenlee/Projects/stech_fresh4/Front/converted_kafa_data.js', output);

console.log('\n✅ Converted data saved to converted_kafa_data.js');