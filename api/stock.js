const fetch = require('node-fetch');

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        const { ticker } = req.query;
        
        if (!ticker) {
            throw new Error('ticker 필요');
        }
        
        console.log(`📊 종목: ${ticker}`);
        
        const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Note) {
            throw new Error('API 한도 초과');
        }
        
        if (data['Error Message']) {
            throw new Error(`종목 없음: ${ticker}`);
        }
        
        const stockData = {
            ticker: ticker,
            name: data.Name || ticker,
            per: parseFloat(data.PERatio) || null,
            roe: data.ReturnOnEquityTTM ? parseFloat(data.ReturnOnEquityTTM) * 100 : null,
            marketCap: data.MarketCapitalization || null,
            eps: parseFloat(data.EPS) || null,
            earningsGrowth: data.QuarterlyEarningsGrowthYOY ? 
                           parseFloat(data.QuarterlyEarningsGrowthYOY) * 100 : null,
            sector: data.Sector || null,
            industry: data.Industry || null
        };
        
        if (stockData.per && stockData.earningsGrowth && stockData.earningsGrowth > 0) {
            stockData.peg = (stockData.per / stockData.earningsGrowth).toFixed(2);
        } else {
            stockData.peg = null;
        }
        
        console.log(`✅ ${ticker} 완료`);
        
        res.status(200).json({
            success: true,
            data: stockData,
            timestamp: new Date().toISOString(),
            source: 'Alpha Vantage API',
            rateLimit: {
                daily: 500,
                note: '하루 500회 제한'
            }
        });
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
        
        res.status(200).json({
            success: false,
            error: error.message,
            fallback: true,
            data: null
        });
    }
};
