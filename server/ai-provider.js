const metricKeys = ['composition','lighting','sharpness','colors','visualQuality','overallScore']
export function completionEndpoint(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('AI endpoint must be a clean HTTPS URL')
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[|.*\.local$)/i.test(url.hostname)) throw new Error('Local AI endpoints are not allowed')
  if (/^\/v\d+\/?$/.test(url.pathname) || url.pathname === '/') url.pathname = url.pathname.replace(/\/$/,'') + '/chat/completions'
  return url.href
}
export function parseAnalysis(result) {
  let data = result
  if (result.choices) {
    const content = result.choices[0]?.message?.content
    const text = Array.isArray(content) ? content.map(c=>c.text||'').join('') : content
    if (typeof text !== 'string') throw new Error('AI returned no analysis text')
    try { data = JSON.parse(text.replace(/^\s*```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'')) } catch { throw new Error('AI analysis is not valid JSON') }
  }
  data = {...data, visualQuality:data.visualQuality ?? data.visual_quality, overallScore:data.overallScore ?? data.overall_score}
  if (!Object.keys(data).length || data.error) throw new Error(typeof data.error === 'string' ? data.error.slice(0,200) : 'AI provider did not return an analysis')
  const output = {}
  for (const key of metricKeys) {
    if (data[key] === null || data[key] === undefined || !Number.isFinite(Number(data[key]))) throw new Error(`AI analysis is missing a valid ${key}`)
    output[key] = Math.max(0,Math.min(100,Math.round(Number(data[key]))))
  }
  return output
}
export async function requestAnalysis({endpoint,model,apiKey,image}, fetcher=fetch) {
  const target = completionEndpoint(endpoint)
  if (!model) throw new Error('Choose an image-understanding chat model in Admin → AI provider')
  if (/gpt-image|dall-e|stable-diffusion/i.test(model)) throw new Error('This is an image-generation model, not a photo-analysis model. Choose a vision chat model.')
  const chat = new URL(target).pathname.endsWith('/chat/completions')
  const headers = {'Content-Type':'application/json', ...(apiKey ? {Authorization:`Bearer ${apiKey.replace(/^Bearer\s+/i,'').trim()}`} : {})}
  const prompt = 'Evaluate this photograph. Return only a JSON object with numeric scores from 0 to 100 for composition, lighting, sharpness, colors, visualQuality and overallScore. Do not invent details you cannot see.'
  const payload = chat ? {model,stream:false,messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:image}}]}]} : {model,image_url:image}
  const response = await fetcher(target,{method:'POST',headers,body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(60000)})
  if (!response.ok) {
    // Never reflect an arbitrary upstream body: it may contain credentials or HTML.
    if (response.status === 403) throw new Error('AI provider returned 403: access to this endpoint/model was denied (permissions, region or provider gateway). This does not prove the key is invalid.')
    if (response.status === 401) throw new Error('AI provider returned 401: authentication was not accepted. Check the saved key for this provider.')
    throw new Error(`AI provider returned ${response.status}. Check the endpoint and model supported by the provider.`)
  }
  return parseAnalysis(await response.json())
}
