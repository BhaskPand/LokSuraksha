import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export default function StatsCard({ title, value, icon, color, trend, onClick }: StatsCardProps) {
  const formatTrend = (trendValue: number): string => {
    if (Math.abs(trendValue) < 0.01) return '0%';
    return `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`;
  };

  return (
    <div 
      className={`stats-card ${onClick ? 'stats-card-clickable' : ''}`}
      style={{ '--card-color': color } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="stats-card-icon" style={{ backgroundColor: `${color}15`, color }}>
        <span>{icon}</span>
      </div>
      <div className="stats-card-content">
        <h3 className="stats-card-title">{title}</h3>
        <p className="stats-card-value">{value}</p>
        {trend !== undefined && (
          <span className={`stats-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {formatTrend(trend.value)}
          </span>
        )}
      </div>
    </div>
  );
}


