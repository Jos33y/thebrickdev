/**
 * Dashboard - Main portal dashboard
 * 
 * Shows:
 * - Revenue stats
 * - Recent invoices
 * - Overdue alerts
 * - Monthly chart
 * 
 * Note: Full implementation in section 1.14
 */

const Dashboard = () => {
  return (
    <div className="portal-page portal-dashboard">
      <div className="portal-page__header">
        <h1>Dashboard</h1>
        <p>Welcome back to Brick Dev Portal</p>
      </div>
      
      {/* Stats cards will go here */}
      <div className="portal-page__content">
        <p style={{ color: 'var(--text-muted)' }}>
          Dashboard content coming in section 1.14
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
