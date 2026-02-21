

export interface ExportData {
  title: string
  data: any[]
  metadata?: {
    generatedBy?: string
    generatedAt?: string
    organization?: string
    reportType?: string
  }
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  filename?: string
  pageTitle?: string
  includeCharts?: boolean
  orientation?: 'portrait' | 'landscape'
}

class ExportService {
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(date)
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  }

  private formatSectionTitle(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
  }

  private addArrayToPDF(pdf: any, array: any[], x: number, y: number, pageWidth: number): void {
    if (!array || array.length === 0) return

    const firstItem = array[0]
    if (typeof firstItem === 'object' && firstItem !== null) {
      // Create a mini table
      const headers = Object.keys(firstItem).slice(0, 4) // Limit columns
      const colWidth = Math.min((pageWidth - 40) / headers.length, 40)

      // Headers
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      headers.forEach((header, index) => {
        pdf.text(header.substring(0, 10), x + 5 + (index * colWidth), y)
      })

      // Data rows
      pdf.setFont('helvetica', 'normal')
      array.slice(0, 10).forEach((item, rowIndex) => { // Limit rows
        headers.forEach((header, colIndex) => {
          const value = String(item[header] || '').substring(0, 15)
          pdf.text(value, x + 5 + (colIndex * colWidth), y + 8 + (rowIndex * 6))
        })
      })
    } else {
      // Simple array
      array.slice(0, 10).forEach((item, index) => {
        pdf.text(`• ${String(item).substring(0, 50)}`, x + 5, y + (index * 6))
      })
    }
  }

  private addObjectToPDF(pdf: any, obj: any, x: number, y: number): void {
    Object.entries(obj).forEach(([key, value], index) => {
      const displayKey = this.formatSectionTitle(key)
      const displayValue = String(value).substring(0, 30)
      pdf.text(`${displayKey}: ${displayValue}`, x + 5, y + (index * 6))
    })
  }

  async exportToPDF(
    data: ExportData,
    options: ExportOptions = { format: 'pdf' },
    elementId?: string
  ): Promise<void> {
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Header with modern design
    pdf.setFillColor(15, 23, 42) // Slate-900
    pdf.rect(0, 0, pageWidth, 40, 'F')

    // Logo area (placeholder)
    pdf.setFillColor(59, 130, 246) // Blue-500
    pdf.rect(10, 8, 24, 24, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🚂', 22, 25)

    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TrainOps AI', 40, 20)

    // Subtitle
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(data.title, 40, 30)

    // Current date and time (2025)
    pdf.setFontSize(10)
    const currentDate = this.formatDate(new Date())
    pdf.text(currentDate, pageWidth - 10, 20, { align: 'right' })

    // Reset text color for content
    pdf.setTextColor(0, 0, 0)

    let yPosition = 60

    // If we have a specific element to capture
    if (elementId && options.includeCharts) {
      const element = document.getElementById(elementId)
      if (element) {
        try {
          const { default: html2canvas } = await import('html2canvas')
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          })

          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pageWidth - 20
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          // Add chart image
          pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 20
        } catch (error) {
          console.warn('Could not capture chart:', error)
        }
      }
    }

    // Add data content
    if (data.data && data.data.length > 0) {
      const dataObj = data.data[0]

      // Handle different types of data structures
      if (typeof dataObj === 'object' && dataObj !== null) {
        // Section headers
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(14)
        pdf.text('Report Summary', 10, yPosition)
        yPosition += 15

        // Process each top-level property
        Object.entries(dataObj).forEach(([key, value]) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage()
            yPosition = 20
          }

          // Section title
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(12)
          pdf.text(this.formatSectionTitle(key), 10, yPosition)
          yPosition += 10

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)

          if (Array.isArray(value) && value.length > 0) {
            // Handle arrays (like metrics, systems, etc.)
            this.addArrayToPDF(pdf, value, 10, yPosition, pageWidth)
            yPosition += Math.min(value.length * 8 + 10, 100) // Limit space
          } else if (typeof value === 'object' && value !== null) {
            // Handle objects (like stats)
            this.addObjectToPDF(pdf, value, 10, yPosition)
            yPosition += Object.keys(value).length * 6 + 10
          } else {
            // Handle simple values
            pdf.text(`${String(value)}`, 15, yPosition)
            yPosition += 8
          }

          yPosition += 5 // Extra spacing between sections
        })
      }
    }

    // Add data table if we have structured data
    if (Array.isArray(data.data) && data.data.length > 0) {
      const tableStartY = yPosition

      // Table header
      pdf.setFillColor(241, 245, 249) // Slate-100
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)

      const firstRow = data.data[0]
      const columns = Object.keys(firstRow)
      const colWidth = (pageWidth - 20) / columns.length

      // Draw header
      columns.forEach((col, index) => {
        const x = 10 + (index * colWidth)
        pdf.rect(x, tableStartY, colWidth, 8, 'F')
        pdf.text(col.toUpperCase(), x + 2, tableStartY + 6)
      })

      yPosition = tableStartY + 8

      // Table rows
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)

      data.data.slice(0, 30).forEach((row, rowIndex) => { // Limit to 30 rows for space
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = 20
        }

        columns.forEach((col, colIndex) => {
          const x = 10 + (colIndex * colWidth)
          const cellValue = String(row[col] || '')
          pdf.text(cellValue.substring(0, 20), x + 2, yPosition + 6) // Truncate long text
        })

        yPosition += 8
      })
    }

    // Footer
    const footerY = pageHeight - 20
    pdf.setFillColor(15, 23, 42)
    pdf.rect(0, footerY, pageWidth, 20, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Generated by TrainOps AI - Indian Railways Operations Dashboard', 10, footerY + 10)
    pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 10, footerY + 10, { align: 'right' })

    // Metadata
    if (data.metadata) {
      pdf.text(`Generated by: ${data.metadata.generatedBy || 'System'}`, 10, footerY + 15)
      pdf.text(`Report Type: ${data.metadata.reportType || 'Data Export'}`, pageWidth - 10, footerY + 15, { align: 'right' })
    }

    // Save the PDF
    const filename = options.filename || this.sanitizeFilename(data.title)
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  async exportToExcel(data: ExportData, options: ExportOptions = { format: 'excel' }): Promise<void> {
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()

    // Process the data
    let processedData = data.data
    if (data.data.length === 1 && typeof data.data[0] === 'object') {
      // If it's a single complex object, flatten it
      const obj = data.data[0]
      processedData = []

      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Add array data as separate rows
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              processedData.push({
                Section: key,
                Index: index + 1,
                ...item
              })
            } else {
              processedData.push({
                Section: key,
                Index: index + 1,
                Value: item
              })
            }
          })
        } else if (typeof value === 'object' && value !== null) {
          // Add object properties as rows
          Object.entries(value).forEach(([subKey, subValue]) => {
            processedData.push({
              Section: key,
              Property: subKey,
              Value: subValue
            })
          })
        } else {
          // Simple key-value
          processedData.push({
            Section: key,
            Value: value
          })
        }
      })
    }

    // Create main data sheet
    const worksheet = XLSX.utils.json_to_sheet(processedData)

    // Add metadata sheet
    const metadataSheet = XLSX.utils.json_to_sheet([
      { Property: 'Title', Value: data.title },
      { Property: 'Generated At', Value: this.formatDate(new Date()) },
      { Property: 'Generated By', Value: data.metadata?.generatedBy || 'TrainOps AI' },
      { Property: 'Organization', Value: data.metadata?.organization || 'Indian Railways' },
      { Property: 'Report Type', Value: data.metadata?.reportType || 'Data Export' },
      { Property: 'Total Records', Value: processedData.length }
    ])

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')

    const filename = options.filename || this.sanitizeFilename(data.title)
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  async exportToCSV(data: ExportData, options: ExportOptions = { format: 'csv' }): Promise<void> {
    // Process the data same as Excel
    let processedData = data.data
    if (data.data.length === 1 && typeof data.data[0] === 'object') {
      const obj = data.data[0]
      processedData = []

      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              processedData.push({
                Section: key,
                Index: index + 1,
                ...item
              })
            } else {
              processedData.push({
                Section: key,
                Index: index + 1,
                Value: item
              })
            }
          })
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            processedData.push({
              Section: key,
              Property: subKey,
              Value: subValue
            })
          })
        } else {
          processedData.push({
            Section: key,
            Value: value
          })
        }
      })
    }

    if (!Array.isArray(processedData) || processedData.length === 0) {
      throw new Error('No data to export')
    }

    const headers = Object.keys(processedData[0])
    const csvContent = [
      // Header with metadata
      `# ${data.title}`,
      `# Generated: ${this.formatDate(new Date())}`,
      `# Generated by: ${data.metadata?.generatedBy || 'TrainOps AI'}`,
      `# Total Records: ${processedData.length}`,
      '',
      // Column headers
      headers.join(','),
      // Data rows
      ...processedData.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const { saveAs } = await import('file-saver')
    const filename = options.filename || this.sanitizeFilename(data.title)
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  }

  async exportToJSON(data: ExportData, options: ExportOptions = { format: 'json' }): Promise<void> {
    const exportObject = {
      metadata: {
        title: data.title,
        generatedAt: new Date().toISOString(),
        generatedBy: data.metadata?.generatedBy || 'TrainOps AI',
        organization: data.metadata?.organization || 'Indian Railways',
        reportType: data.metadata?.reportType || 'Data Export',
        totalRecords: data.data.length,
        format: 'JSON',
        version: '2025.1.0'
      },
      data: data.data
    }

    const jsonString = JSON.stringify(exportObject, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
    const { saveAs } = await import('file-saver')
    const filename = options.filename || this.sanitizeFilename(data.title)
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.json`)
  }

  async export(data: ExportData, options: ExportOptions, elementId?: string): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(data, options, elementId)
          break
        case 'excel':
          await this.exportToExcel(data, options)
          break
        case 'csv':
          await this.exportToCSV(data, options)
          break
        case 'json':
          await this.exportToJSON(data, options)
          break
        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }
}

export const exportService = new ExportService()