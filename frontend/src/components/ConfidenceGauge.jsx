function ConfidenceGauge({ value, size = 60 }) {
    // value is 0-1, convert to 0-100
    const valuePercent = Math.round((value || 0) * 100);
    const r = size * 0.38;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (valuePercent / 100) * circumference;
    const color = valuePercent >= 80 ? '#D85A30' : valuePercent >= 60 ? '#E09B20' : '#7F77DD';

    return (
        <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
            <circle cx={cx} cy={cy} r={r} fill="none"
                stroke="#252830" strokeWidth="4"/>
            <circle cx={cx} cy={cy} r={r} fill="none"
                stroke={color} strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"/>
            <text x={cx} y={cy}
                textAnchor="middle" dominantBaseline="central"
                style={{transform:'rotate(90deg)',transformOrigin:`${cx}px ${cy}px`}}
                fill={color} fontSize={size * 0.22} fontWeight="600">
                {valuePercent}%
            </text>
        </svg>
    );
}

export default ConfidenceGauge;
