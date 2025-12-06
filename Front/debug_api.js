const http = require('http');

const url = 'http://localhost:4000/api/kafa-stats/all-stats';

const req = http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('API Structure:');
      console.log('- data keys:', Object.keys(result.data));
      console.log('- university keys:', Object.keys(result.data.university));
      console.log('- university.team keys:', Object.keys(result.data.university.team));
      console.log('- university.team.offense keys:', Object.keys(result.data.university.team.offense));
      console.log('- university.team.defense keys:', Object.keys(result.data.university.team.defense));
      console.log('- university.team.special keys:', Object.keys(result.data.university.team.special));
      if (result.data.social) {
        console.log('- social keys:', Object.keys(result.data.social));
        console.log('- social.team keys:', Object.keys(result.data.social.team));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});