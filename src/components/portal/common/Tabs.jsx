/**
 * Tabs - Tab navigation/filter component
 */

const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  return (
    <div className={`tabs tabs--${variant} ${className}`}>
      <div className="tabs__list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            className={`tabs__tab ${activeTab === tab.value ? 'tabs__tab--active' : ''}`}
            aria-selected={activeTab === tab.value}
            onClick={() => onChange(tab.value)}
          >
            {tab.icon && <tab.icon size={16} className="tabs__tab-icon" />}
            <span className="tabs__tab-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tabs__tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
