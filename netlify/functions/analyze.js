exports.handler = async function(event) {
  if(event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    var body = JSON.parse(event.body);
    var occContext = body.occContext || '';
    
    var prompt = 'You are a Houston Fire Department inspector assistant (IFC 2021 + Houston amendments + LSB standards). Analyze this photo taken during a fire inspection.' + occContext + ' Respond ONLY with a JSON object, no markdown, no explanation:\n{"category":"one of: Fire Extinguisher, Hood System, Fire Alarm, Sprinkler System, Egress / Exit Doors, Exit Signs, Emergency Lighting, Electrical Panel, Storage Height, Occupant Load, Permit Status, Flammable Storage, Spray Booth, Hazmat Storage, Building ID / Address, Common Areas, Other","code":"most relevant IFC 2021 or LSB code section","type":"comply or violation","notes":"one sentence describing what you see and why it complies or violates","confidence":"high, medium, or low"}';

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: body.mediaType || 'image/jpeg', data: body.imageData }
            },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });
    var data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
