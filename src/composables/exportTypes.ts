import type { TimeframeOption } from '@/scripts/dateUtils'

export interface ExportConfig {
  timeFrame: TimeframeOption
  dataType: string
  sensorIds: string[]
  fileType: 'csv' | 'json' | 'excel'
}
