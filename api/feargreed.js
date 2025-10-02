const fetch = require('node-fetch');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        console.log('📊 공포탐욕 지수 요청');
        
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || !data.data[0]) {
            throw new Error('잘못된 데이터');
        }
        
        console.log('✅ 공포탐욕:', data.data[0].value);
        
        res.status(200).json({
            success: true,
            data: data.data[0],
            timestamp: new Date().toISOString(),
            source: 'Alternative.me API'
        });
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
        
        res.status(200).json({
            success: false,
            data: {
                value: '50',
                value_classification: 'Neutral',
                timestamp: Math.floor(Date.now() / 1000)
            },
            error: error.message,
            fallback: true
        });
    }
};
