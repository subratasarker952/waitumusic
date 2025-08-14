/**
 * Industry-Standard Perfect Data Table
 * Complete with sorting, filtering, pagination, and actions
 */

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './table';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { PerfectButton } from './perfect-button';
import { Input } from './input';
import { Badge } from './badge';
import { DataTableLoader } from './perfect-loading';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

export interface PerfectDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: DataTableAction<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string>) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  onExport?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export function PerfectDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  pagination,
  onPageChange,
  onSort,
  onFilter,
  searchable = true,
  searchPlaceholder = 'Search...',
  exportable = false,
  onExport,
  title,
  description,
  className,
}: PerfectDataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  // Handle search
  const handleSearch = React.useCallback((value: string) => {
    setSearch(value);
    if (onFilter) {
      onFilter({ ...filters, search: value });
    }
  }, [filters, onFilter]);

  // Handle sorting
  const handleSort = React.useCallback((column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    if (onSort) {
      onSort(column, newDirection);
    }
  }, [sortColumn, sortDirection, onSort]);

  // Filter data locally if no server-side filtering
  const filteredData = React.useMemo(() => {
    if (onFilter || !search) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, onFilter]);

  // Sort data locally if no server-side sorting
  const sortedData = React.useMemo(() => {
    if (onSort || !sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, onSort]);

  return (
    <Card className={className}>
      {(title || description || searchable || exportable) && (
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              )}
              
              {exportable && (
                <PerfectButton
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  icon={<Download className="h-4 w-4" />}
                >
                  Export
                </PerfectButton>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {loading ? (
          <DataTableLoader columns={columns.length + (actions.length > 0 ? 1 : 0)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={String(column.key)}
                        className={cn(
                          'font-semibold',
                          column.sortable && 'cursor-pointer hover:bg-muted/50 select-none',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                        style={{ width: column.width }}
                        onClick={column.sortable ? () => handleSort(String(column.key)) : undefined}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.title}</span>
                          {column.sortable && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={cn(
                                  'h-3 w-3 -mb-1',
                                  sortColumn === column.key && sortDirection === 'asc'
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  'h-3 w-3',
                                  sortColumn === column.key && sortDirection === 'desc'
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    {actions.length > 0 && (
                      <TableHead className="w-[120px] text-center">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Search className="h-8 w-8" />
                          <p>No data found</p>
                          {search && (
                            <p className="text-sm">
                              Try adjusting your search or filters
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        {columns.map((column) => {
                          const value = item[column.key as keyof T];
                          return (
                            <TableCell
                              key={String(column.key)}
                              className={cn(
                                column.align === 'center' && 'text-center',
                                column.align === 'right' && 'text-right'
                              )}
                            >
                              {column.render ? column.render(value, item) : String(value || '')}
                            </TableCell>
                          );
                        })}
                        
                        {actions.length > 0 && (
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {actions
                                .filter(action => !action.hidden?.(item))
                                .slice(0, 2)
                                .map((action, actionIndex) => {
                                  const Icon = action.icon || Eye;
                                  return (
                                    <PerfectButton
                                      key={actionIndex}
                                      variant={action.variant || 'outline'}
                                      size="sm"
                                      onClick={() => action.onClick(item)}
                                      disabled={action.disabled?.(item)}
                                      icon={<Icon className="h-3 w-3" />}
                                      tooltip={action.label}
                                    />
                                  );
                                })}
                              
                              {actions.filter(action => !action.hidden?.(item)).length > 2 && (
                                <PerfectButton
                                  variant="outline"
                                  size="sm"
                                  icon={<MoreHorizontal className="h-3 w-3" />}
                                  tooltip="More actions"
                                />
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <PerfectButton
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </PerfectButton>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      const isActive = page === pagination.page;
                      return (
                        <PerfectButton
                          key={page}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onPageChange?.(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </PerfectButton>
                      );
                    })}
                    {pagination.totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <PerfectButton
                          variant="outline"
                          size="sm"
                          onClick={() => onPageChange?.(pagination.totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {pagination.totalPages}
                        </PerfectButton>
                      </>
                    )}
                  </div>
                  
                  <PerfectButton
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    icon={<ChevronRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Next
                  </PerfectButton>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Status badge renderer helper
export const StatusBadge: React.FC<{ 
  status: string; 
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}> = ({ status, variant }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  return (
    <Badge 
      variant={variant || 'secondary'} 
      className={statusColors[status.toLowerCase()] || statusColors.pending}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};