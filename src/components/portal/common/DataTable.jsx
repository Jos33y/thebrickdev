/**
 * DataTable - Table component for displaying data lists
 * 
 * Features:
 * - Column definitions
 * - Row click handling
 * - Empty state
 * - Loading state
 * - Responsive horizontal scroll
 */

import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

const DataTable = ({
  columns,
  data,
  onRowClick,
  emptyState,
  loading = false,
  loadingRows = 5,
  keyField = 'id',
  className = '',
}) => {
  // Render loading state
  if (loading) {
    return (
      <div className={`data-table-wrapper ${className}`}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  style={{ width: column.width }}
                  className={column.headerClassName || ''}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRows }).map((_, i) => (
              <LoadingState.TableRow key={i} columns={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  // Render empty state
  if (!data || data.length === 0) {
    if (emptyState) {
      return (
        <div className={`data-table-wrapper data-table-wrapper--empty ${className}`}>
          {emptyState}
        </div>
      );
    }
    
    return (
      <div className={`data-table-wrapper data-table-wrapper--empty ${className}`}>
        <EmptyState
          title="No data found"
          description="There are no items to display."
        />
      </div>
    );
  }
  
  return (
    <div className={`data-table-wrapper ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                style={{ width: column.width }}
                className={column.headerClassName || ''}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'data-table__row--clickable' : ''}
            >
              {columns.map((column) => (
                <td 
                  key={column.key}
                  className={column.cellClassName || ''}
                >
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
