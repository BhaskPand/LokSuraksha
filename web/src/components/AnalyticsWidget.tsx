import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Issue } from '@citizen-safety/shared';
import './AnalyticsWidget.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AnalyticsWidgetProps {
  issues: Issue[];
}

export default function AnalyticsWidget({ issues }: AnalyticsWidgetProps) {
  const { categoryData, statusData } = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    issues.forEach((issue) => {
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
      statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    });

    return {
      categoryData: {
        labels: Object.keys(categoryCounts),
        datasets: [
          {
            label: 'Issues by Category',
            data: Object.values(categoryCounts),
            backgroundColor: 'var(--color-teal-500)',
            borderRadius: 4,
          },
        ],
      },
      statusData: {
        labels: Object.keys(statusCounts).map((s) => s.replace('_', ' ')),
        datasets: [
          {
            label: 'Issues by Status',
            data: Object.values(statusCounts),
            backgroundColor: [
              'var(--color-blue-600)',
              'var(--color-yellow-600)',
              'var(--color-green-600)',
            ],
            borderRadius: 4,
          },
        ],
      },
    };
  }, [issues]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="analytics-widget">
      <h2 className="analytics-title">Analytics</h2>
      <div className="analytics-charts">
        <div className="analytics-chart">
          <h3>By Category</h3>
          <div className="chart-container">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
        <div className="analytics-chart">
          <h3>By Status</h3>
          <div className="chart-container">
            <Bar data={statusData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

