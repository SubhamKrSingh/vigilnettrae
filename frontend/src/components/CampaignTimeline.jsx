import { 
    ResponsiveContainer, ScatterChart, Scatter, 
    XAxis, YAxis, ReferenceLine, Tooltip 
} from 'recharts'; 
 
function CampaignTimeline({ timeline }) { 
    const data = (timeline || [ 
        { t: -96, event: 'SIM cluster acquisition' }, 
        { t: -72, event: 'Mule accounts onboarded' }, 
        { t: -48, event: 'Fake portals registered' }, 
        { t: -24, event: 'Agent briefing' }, 
        { t: 0,  event: 'Victim contact (T=0)' }, 
    ]).map(item => ({ 
        x: item.t ?? item.offset_hours ?? item.time ?? 0, 
        y: 1, 
        label: item.event ?? item.description ?? '', 
    })); 
 
    const CustomDot = (props) => { 
        const { cx, cy, payload } = props; 
        const isT0 = payload.x === 0; 
        return ( 
            <g> 
                <circle 
                    cx={cx} cy={cy} 
                    r={isT0 ? 7 : 5} 
                    fill={isT0 ? '#D85A30' : '#1DB87A'} 
                    stroke={isT0 ? '#FF8060' : '#3DCCA0'} 
                    strokeWidth={1.5} 
                /> 
            </g> 
        ); 
    }; 
 
    const CustomTooltip = ({ active, payload }) => { 
        if (!active || !payload?.length) return null; 
        const d = payload[0]?.payload; 
        return ( 
            <div style={{ 
                background: '#191C24', 
                border: '1px solid #252830', 
                borderRadius: 8, 
                padding: '6px 10px', 
                fontSize: 11, 
                color: '#E8E6E0', 
            }}> 
                <div style={{ color: '#888780', marginBottom: 2 }}> 
                    T{d.x >= 0 ? '+' : ''}{d.x}h 
                </div> 
                <div>{d.label}</div> 
            </div> 
        ); 
    }; 
 
    return ( 
        <div style={{ width: '100%' }}> 
            <h3 style={{ 
                color: '#E8E6E0', 
                fontWeight: 600, 
                fontSize: 14, 
                marginBottom: 16, 
            }}> 
                Campaign Timeline 
            </h3> 
            <ResponsiveContainer width="100%" height={130}> 
                <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 10 }}> 
                    <XAxis 
                        type="number" 
                        dataKey="x" 
                        domain={[-96, 12]} 
                        tickCount={5} 
                        tick={{ fill: '#5F5E5A', fontSize: 11 }} 
                        axisLine={{ stroke: '#252830' }} 
                        tickLine={false} 
                        tickFormatter={v => `${v}h`} 
                    /> 
                    <YAxis 
                        type="number" 
                        dataKey="y" 
                        domain={[0.5, 1.5]} 
                        hide 
                    /> 
                    <Tooltip content={<CustomTooltip />} /> 
                    <ReferenceLine 
                        x={0} 
                        stroke="#D85A30" 
                        strokeWidth={1.5} 
                        strokeDasharray="4 3" 
                        label={{ 
                            value: 'Victim contact', 
                            position: 'insideTopRight', 
                            fill: '#D85A30', 
                            fontSize: 11, 
                            offset: 8, 
                        }} 
                    /> 
                    <Scatter 
                        data={data.filter(d => d.x !== 0)} 
                        shape={<CustomDot />} 
                    /> 
                    <Scatter 
                        data={data.filter(d => d.x === 0)} 
                        shape={<CustomDot />} 
                    /> 
                </ScatterChart> 
            </ResponsiveContainer> 
 
            {/* Event labels below the axis */} 
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingLeft: 10, 
                paddingRight: 30, 
                marginTop: 6, 
            }}> 
                {data.map((d, i) => ( 
                    <div key={i} style={{ 
                        fontSize: 10, 
                        color: d.x === 0 ? '#D85A30' : '#5F5E5A', 
                        maxWidth: 80, 
                        textAlign: 'center', 
                        lineHeight: 1.3, 
                    }}> 
                        {d.label} 
                    </div> 
                ))} 
            </div> 
        </div> 
    ); 
} 
 
export default CampaignTimeline;
