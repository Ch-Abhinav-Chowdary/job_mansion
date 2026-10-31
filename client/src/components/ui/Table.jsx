/**
 * Table component adhering strictly to DESIGN.md:
 * - Header: 12 px caption, muted, 8px 12px padding, bottom border
 * - Rows: 16 px body, 12px 12px padding, hairline border
 * - Hover row: primary-soft
 * - Do not zebra-stripe
 * - Horizontal scroll on mobile wrapper
 */

export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto rounded-md border border-border bg-surface">
    <table className={`w-full text-left border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className = '' }) => (
  <thead className={`border-b border-border bg-bg/50 ${className}`}>
    {children}
  </thead>
);

export const TableHeaderCell = ({ children, className = '' }) => (
  <th
    className={`px-3 py-2 text-xs font-medium text-muted tracking-wide text-left ${className}`}
  >
    {children}
  </th>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, clickable = false, className = '', ...props }) => (
  <tr
    className={`transition-colors duration-150 ${clickable ? 'cursor-pointer hover:bg-primary-soft' : 'hover:bg-primary-soft/50'} ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-3 py-3 text-base text-ink ${className}`}>
    {children}
  </td>
);

export default Table;
