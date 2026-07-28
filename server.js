const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('.'));

const baseHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/option-chain'
};

app.get('/NiftyLive', async (request, response) => {
  try {
    // 1. Visit NSE homepage first to establish session and extract cookies
    const homeRes = await fetch('https://www.nseindia.com', { headers: baseHeaders });
    
    // Extract cookies from response
    const cookies = homeRes.headers.getSetCookie 
      ? homeRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')
      : homeRes.headers.get('set-cookie');

    const apiHeaders = {
      ...baseHeaders,
      'Accept': 'application/json, text/plain, */*',
      'Cookie': cookies || ''
    };

    // 2. Fetch contract info to get current expiry
    const expiryUrl = 'https://www.nseindia.com/api/option-chain-contract-info?symbol=NIFTY';
    const expiryRes = await fetch(expiryUrl, { headers: apiHeaders });

    if (!expiryRes.ok) {
      throw new Error(`Expiry fetch blocked with status: ${expiryRes.status}`);
    }

    const aliveit = await expiryRes.json();
    const workingexp = aliveit.expiryDates[0];

    // 3. Fetch Option Chain Data
    const targetUrl = `https://www.nseindia.com/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=${workingexp}`;
    const dataRes = await fetch(targetUrl, { headers: apiHeaders });

    if (!dataRes.ok) {
      throw new Error(`Data fetch blocked with status: ${dataRes.status}`);
    }

    const realobject = await dataRes.json();

    // 4. Send response back to your client
    response.json(realobject);

  } catch (error) {
    console.error('Error fetching NSE data:', error.message);
    // Send 500 error so your HTML page knows the request failed instead of hanging
    response.status(500).json({ error: 'Failed to retrieve data from NSE' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
