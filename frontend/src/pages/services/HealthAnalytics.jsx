import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function HealthAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [healthData, setHealthData] = useState({
    steps: 8432,
    calories: 2150,
    sleep: 7.5,
    heartRateAvg: 72,
    exercise: 45,
    water: 6,
    stress: 3,
    mood: 4
  });

  const [goals, setGoals] = useState({
    steps: 10000,
    calories: 2000,
    sleep: 8,
    exercise: 60,
    water: 8
  });

  const [analytics, setAnalytics] = useState({
    overallHealth: 85,
    riskFactors: ["High stress levels", "Low water intake"],
    recommendations: ["Increase water consumption", "Practice stress management"],
    trends: {
      steps: "increasing",
      sleep: "stable",
      exercise: "decreasing"
    }
  });

  const healthMetrics = [
    { 
      id: 'steps', 
      name: 'Daily Steps', 
      value: healthData.steps, 
      goal: goals.steps, 
      unit: 'steps',
      icon: 'fa-walking',
      color: 'primary',
      trend: '+12%'
    },
    { 
      id: 'calories', 
      name: 'Calories Burned', 
      value: healthData.calories, 
      goal: goals.calories, 
      unit: 'kcal',
      icon: 'fa-fire',
      color: 'danger',
      trend: '+8%'
    },
    { 
      id: 'sleep', 
      name: 'Sleep Duration', 
      value: healthData.sleep, 
      goal: goals.sleep, 
      unit: 'hours',
      icon: 'fa-bed',
      color: 'info',
      trend: 'stable'
    },
    { 
      id: 'heartRateAvg', 
      name: 'Avg Heart Rate', 
      value: healthData.heartRateAvg, 
      goal: 70, 
      unit: 'bpm',
      icon: 'fa-heartbeat',
      color: 'danger',
      trend: '-2%'
    },
    { 
      id: 'exercise', 
      name: 'Exercise Time', 
      value: healthData.exercise, 
      goal: goals.exercise, 
      unit: 'minutes',
      icon: 'fa-dumbbell',
      color: 'success',
      trend: '-15%'
    },
    { 
      id: 'water', 
      name: 'Water Intake', 
      value: healthData.water, 
      goal: goals.water, 
      unit: 'glasses',
      icon: 'fa-tint',
      color: 'info',
      trend: '+25%'
    }
  ];

  const getProgressPercentage = (value, goal) => {
    return Math.min((value / goal) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getTrendIcon = (trend) => {
    if (trend.includes('+')) return 'fa-arrow-up text-success';
    if (trend.includes('-')) return 'fa-arrow-down text-danger';
    return 'fa-minus text-muted';
  };

  const updateGoal = (metric, value) => {
    setGoals(prev => ({
      ...prev,
      [metric]: parseInt(value)
    }));
  };

  const generateReport = () => {
    const reportData = {
      period: selectedPeriod,
      date: new Date().toLocaleDateString(),
      metrics: healthData,
      goals: goals,
      analytics: analytics,
      summary: `Overall health score: ${analytics.overallHealth}%. Key areas for improvement: ${analytics.riskFactors.join(', ')}.`
    };

    // Create downloadable report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `health_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-12">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle p-4 mb-3">
              <i className="fas fa-chart-line fa-3x text-warning"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Health Analytics Dashboard</h1>
            <p className="lead text-muted">
              Comprehensive health data analysis and personalized insights for better wellness
            </p>
          </div>

          {/* Period Selector */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">Analytics Period</h5>
                  <p className="text-muted mb-0">View your health metrics over different time periods</p>
                </div>
                <div className="btn-group" role="group">
                  <button
                    className={`btn ${selectedPeriod === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedPeriod('day')}
                  >
                    Today
                  </button>
                  <button
                    className={`btn ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedPeriod('week')}
                  >
                    Week
                  </button>
                  <button
                    className={`btn ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedPeriod('month')}
                  >
                    Month
                  </button>
                  <button
                    className={`btn ${selectedPeriod === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedPeriod('year')}
                  >
                    Year
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Health Score */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="card-title mb-3">Overall Health Score</h5>
                  <div className="d-flex align-items-center mb-3">
                    <div className="progress flex-grow-1 me-3" style={{height: '30px'}}>
                      <div
                        className={`progress-bar bg-${getHealthScoreColor(analytics.overallHealth)}`}
                        style={{width: `${analytics.overallHealth}%`}}
                      >
                        {analytics.overallHealth}%
                      </div>
                    </div>
                    <div className={`badge bg-${getHealthScoreColor(analytics.overallHealth)} fs-6`}>
                      {analytics.overallHealth >= 80 ? 'Excellent' : 
                       analytics.overallHealth >= 60 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                  <p className="text-muted mb-0">
                    Your health is {analytics.overallHealth >= 80 ? 'in excellent condition' : 
                                   analytics.overallHealth >= 60 ? 'good but could be better' : 
                                   'showing areas that need attention'}
                  </p>
                </div>
                <div className="col-md-4 text-center">
                  <button className="btn btn-primary btn-lg" onClick={generateReport}>
                    <i className="fas fa-download me-2"></i>Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Health Metrics Grid */}
          <div className="row mb-4">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-inline-flex align-items-center justify-content-center bg-{metric.color} bg-opacity-10 rounded-circle p-2">
                        <i className={`fas ${metric.icon} text-${metric.color}`}></i>
                      </div>
                      <div className="text-end">
                        <small className={`text-muted me-1`}>
                          <i className={`fas ${getTrendIcon(metric.trend)}`}></i>
                        </small>
                        <small className="text-muted">{metric.trend}</small>
                      </div>
                    </div>
                    <h6 className="card-title">{metric.name}</h6>
                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                      <span className="h4">{metric.value}</span>
                      <small className="text-muted">{metric.unit}</small>
                    </div>
                    <div className="progress mb-2" style={{height: '8px'}}>
                      <div
                        className={`progress-bar bg-${getProgressColor(getProgressPercentage(metric.value, metric.goal))}`}
                        style={{width: `${getProgressPercentage(metric.value, metric.goal)}%`}}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Goal: {metric.goal} {metric.unit}</small>
                      <small className={`text-${getProgressColor(getProgressPercentage(metric.value, metric.goal))}`}>
                        {Math.round(getProgressPercentage(metric.value, metric.goal))}%
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Factors and Recommendations */}
          <div className="row mb-4">
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>Risk Factors
                  </h5>
                  <ul className="list-group list-group-flush">
                    {analytics.riskFactors.map((risk, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{risk}</span>
                        <span className="badge bg-warning">Moderate</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-lightbulb text-info me-2"></i>Recommendations
                  </h5>
                  <ul className="list-group list-group-flush">
                    {analytics.recommendations.map((rec, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{rec}</span>
                        <i className="fas fa-chevron-right text-muted"></i>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Management */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-bullseye me-2"></i>Daily Goals Management
              </h5>
              <div className="row">
                {Object.entries(goals).map(([key, value], index) => (
                  <div key={index} className="col-md-4 mb-3">
                    <label className="form-label">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        value={value}
                        onChange={(e) => updateGoal(key, e.target.value)}
                      />
                      <span className="input-group-text">
                        {key === 'steps' ? 'steps' : 
                         key === 'calories' ? 'kcal' : 
                         key === 'sleep' ? 'hours' : 
                         key === 'exercise' ? 'min' : 'glasses'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health Trends Chart */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-chart-area me-2"></i>Health Trends
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <h6 className="text-success">Physical Activity</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-success" style={{width: '75%'}}></div>
                    </div>
                    <small className="text-muted">Improving steadily</small>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <h6 className="text-info">Sleep Quality</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-info" style={{width: '65%'}}></div>
                    </div>
                    <small className="text-muted">Consistent pattern</small>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <h6 className="text-warning">Stress Levels</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-warning" style={{width: '45%'}}></div>
                    </div>
                    <small className="text-muted">Needs attention</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Score Breakdown */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-pie-chart me-2"></i>Wellness Score Breakdown
              </h5>
              <div className="row">
                <div className="col-md-2 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-3 mb-2">
                      <span className="h4 text-success">85%</span>
                    </div>
                    <h6>Fitness</h6>
                    <small className="text-muted">Excellent</small>
                  </div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle p-3 mb-2">
                      <span className="h4 text-info">72%</span>
                    </div>
                    <h6>Sleep</h6>
                    <small className="text-muted">Good</small>
                  </div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle p-3 mb-2">
                      <span className="h4 text-warning">58%</span>
                    </div>
                    <h6>Nutrition</h6>
                    <small className="text-muted">Fair</small>
                  </div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle p-3 mb-2">
                      <span className="h4 text-danger">45%</span>
                    </div>
                    <h6>Stress</h6>
                    <small className="text-muted">Poor</small>
                  </div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-2">
                      <span className="h4 text-primary">78%</span>
                    </div>
                    <h6>Hydration</h6>
                    <small className="text-muted">Good</small>
                  </div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-secondary bg-opacity-10 rounded-circle p-3 mb-2">
                      <span className="h4 text-secondary">68%</span>
                    </div>
                    <h6>Mental</h6>
                    <small className="text-muted">Fair</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-4">
            <button className="btn btn-primary btn-lg me-2" onClick={generateReport}>
              <i className="fas fa-file-pdf me-2"></i>Generate PDF Report
            </button>
            <Link to="/services/ai-diagnosis" className="btn btn-outline-primary btn-lg me-2">
              <i className="fas fa-stethoscope me-2"></i>Health Check
            </Link>
            <Link to="/contact" className="btn btn-outline-primary btn-lg">
              <i className="fas fa-user-md me-2"></i>Consult Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthAnalytics;
