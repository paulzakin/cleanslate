import { css } from '@emotion/react'
import React from 'react'
import { QuickLog } from '../../../models/quickLog'
import { Divider } from '../../divider/Divider'
import { sortByCreatedAt } from '../Log/helpers/sortByCreatedAt'
import { QuickLogItem } from './QuickLogItem'

type props = {
  quick_logs: QuickLog[]
}

export const QuickLogList: React.FC<props> = (props) => {
  const { quick_logs } = props

  return (
    <div
      css={css`
        margin: 0 auto;
        width: 90%;
      `}
    >
      {sortByCreatedAt(quick_logs).map((quick_log) => (
        <QuickLogItem key={quick_log.id} quick_log={quick_log as QuickLog} />
      ))}
      {quick_logs.length >= 1 && <Divider height={2} className="mt25 mb20" />}
    </div>
  )
}
