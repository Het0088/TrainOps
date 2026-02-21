'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { exportService, ExportData, ExportOptions } from '@/lib/export-service'
import { useAuthStore } from '@/store/auth-store'

interface ExportButtonProps {
  data: any
  filename: string
  title?: string
  className?: string
  reportType?: string
  includeCharts?: boolean
  chartElementId?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({
  data,
  title,
  filename,
  reportType = 'Data Export',
  includeCharts = false,
  chartElementId,
  className,
  variant = 'outline',
  size = 'default'
}: ExportButtonProps) {
  const { user } = useAuthStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lastExportFormat, setLastExportFormat] = useState<string>('')

  const handleExport = async (format: ExportOptions['format']) => {
    if (!data) {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
      return
    }

    setIsExporting(true)
    setLastExportFormat(format.toUpperCase())

    try {
      // Convert the data object to a format suitable for export
      const flattenedData = Array.isArray(data) ? data : [data]
      
      const exportData: ExportData = {
        title: title || 'Export Report',
        data: flattenedData,
        metadata: {
          generatedBy: user?.name || 'System User',
          generatedAt: new Date().toISOString(),
          organization: 'Indian Railways - TrainOps AI',
          reportType
        }
      }

      const options: ExportOptions = {
        format,
        filename,
        pageTitle: title,
        includeCharts,
        orientation: 'landscape'
      }

      await exportService.export(exportData, options, chartElementId)
      
      setExportStatus('success')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )
    }
  }

  const getButtonText = () => {
    if (isExporting) return `Exporting ${lastExportFormat}...`
    if (exportStatus === 'success') return `${lastExportFormat} Downloaded!`
    if (exportStatus === 'error') return 'Export Failed'
    return 'Export'
  }

  const exportFormats = [
    {
      format: 'pdf' as const,
      label: 'PDF Report',
      description: 'Professional report with charts',
      icon: <FileText className="h-4 w-4" />,
      badge: 'Recommended'
    },
    {
      format: 'excel' as const,
      label: 'Excel Spreadsheet',
      description: 'Data with analysis sheets',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      badge: 'Popular'
    },
    {
      format: 'csv' as const,
      label: 'CSV Data',
      description: 'Raw data for analysis',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      badge: null
    },
    {
      format: 'json' as const,
      label: 'JSON Export',
      description: 'Structured data format',
      icon: <FileJson className="h-4 w-4" />,
      badge: 'API'
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isExporting || !data || data.length === 0}
        >
          {getStatusIcon()}
          <span className="ml-2">{getButtonText()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Export Options</span>
          <Badge variant="outline" className="text-xs">
            {data?.length || 0} records
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {exportFormats.map((format) => (
          <DropdownMenuItem
            key={format.format}
            onClick={() => handleExport(format.format)}
            className="flex items-start space-x-3 p-3 cursor-pointer"
          >
            <div className="flex-shrink-0 mt-0.5">
              {format.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{format.label}</span>
                {format.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {format.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Generated on {new Date().toLocaleDateString('en-IN')}</span>
            <span>TrainOps AI</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}