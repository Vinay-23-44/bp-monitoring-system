const chartWidth = 720;
const chartHeight = 240;
const chartPadding = 28;

function buildPoints(data, valueKey, minValue, maxValue) {
  if (data.length === 1) {
    const y =
      chartHeight -
      chartPadding -
      ((data[0][valueKey] - minValue) / Math.max(maxValue - minValue, 1)) *
        (chartHeight - chartPadding * 2);

    return `${chartWidth / 2},${y}`;
  }

  return data
    .map((item, index) => {
      const x =
        chartPadding +
        (index / (data.length - 1)) * (chartWidth - chartPadding * 2);
      const y =
        chartHeight -
        chartPadding -
        ((item[valueKey] - minValue) / Math.max(maxValue - minValue, 1)) *
          (chartHeight - chartPadding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function calculateSummary(history) {
  if (!history.length) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      highestSystolic: 0,
      latestReading: null,
      trend: "No data",
    };
  }

  const totalSystolic = history.reduce((sum, item) => sum + Number(item.systolic), 0);
  const totalDiastolic = history.reduce((sum, item) => sum + Number(item.diastolic), 0);
  const highestSystolic = Math.max(...history.map((item) => Number(item.systolic)));
  const latestReading = history[0];
  const oldestReading = history[history.length - 1];
  const trendDelta = Number(latestReading.systolic) - Number(oldestReading.systolic);

  return {
    averageSystolic: Math.round(totalSystolic / history.length),
    averageDiastolic: Math.round(totalDiastolic / history.length),
    highestSystolic,
    latestReading,
    trend:
      trendDelta > 3 ? "Rising" : trendDelta < -3 ? "Improving" : "Stable",
  };
}

const BPTrendDashboard = ({ history }) => {
  if (!history.length) {
    return null;
  }

  const chartData = [...history].slice(0, 8).reverse();
  const values = chartData.flatMap((item) => [Number(item.systolic), Number(item.diastolic)]);
  const minValue = Math.min(...values) - 10;
  const maxValue = Math.max(...values) + 10;
  const systolicPoints = buildPoints(chartData, "systolic", minValue, maxValue);
  const diastolicPoints = buildPoints(chartData, "diastolic", minValue, maxValue);
  const summary = calculateSummary(history);

  return (
    <div className="bp-dashboard">
      <div className="bp-dashboard__stats">
        <div className="bp-stat-card">
          <span>Latest</span>
          <strong>
            {summary.latestReading.systolic}/{summary.latestReading.diastolic}
          </strong>
        </div>
        <div className="bp-stat-card">
          <span>Average</span>
          <strong>
            {summary.averageSystolic}/{summary.averageDiastolic}
          </strong>
        </div>
        <div className="bp-stat-card">
          <span>Highest Systolic</span>
          <strong>{summary.highestSystolic}</strong>
        </div>
        <div className="bp-stat-card">
          <span>Trend</span>
          <strong>{summary.trend}</strong>
        </div>
      </div>

      <div className="bp-chart-card">
        <div className="bp-chart-card__header">
          <div>
            <p className="dashboard-panel__eyebrow">Trend Analysis</p>
            <h3>Blood pressure graph</h3>
          </div>
          <div className="bp-legend">
            <span className="bp-legend__item">
              <i className="bp-legend__swatch bp-legend__swatch--systolic" />
              Systolic
            </span>
            <span className="bp-legend__item">
              <i className="bp-legend__swatch bp-legend__swatch--diastolic" />
              Diastolic
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="bp-chart"
          role="img"
          aria-label="Blood pressure trend graph"
        >
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = chartPadding + ratio * (chartHeight - chartPadding * 2);
            return (
              <line
                key={ratio}
                x1={chartPadding}
                y1={y}
                x2={chartWidth - chartPadding}
                y2={y}
                className="bp-chart__grid"
              />
            );
          })}

          <polyline points={systolicPoints} className="bp-chart__line bp-chart__line--systolic" />
          <polyline points={diastolicPoints} className="bp-chart__line bp-chart__line--diastolic" />

          {chartData.map((item, index) => {
            const x =
              chartPadding +
              (chartData.length === 1
                ? (chartWidth - chartPadding * 2) / 2
                : (index / (chartData.length - 1)) * (chartWidth - chartPadding * 2));

            return (
              <text
                key={item.id}
                x={x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="bp-chart__label"
              >
                {new Date(item.createdAt).toLocaleDateString()}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default BPTrendDashboard;