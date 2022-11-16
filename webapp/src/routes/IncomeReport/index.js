import React, { memo, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import { useTranslation } from 'react-i18next'
import {
  FormControl,
  FormControlLabel,
  Typography,
  RadioGroup,
  Radio,
  Divider
} from '@mui/material'

import useIncomeReportState from '../../hooks/customHooks/useIncomeReportState'
import BarChartGeneralReport from '../../components/BarChartGeneralReport'
import TreasuryBalance from '../../components/TreasuryBalance'
import PieChartReport from '../../components/PieChartReport'
import { formatWithThousandSeparator } from '../../utils'
import TableReport from '../../components/TableReport'
import SelectComponent from '../../components/Select'

import styles from './styles'

const useStyles = makeStyles(styles)

const rowsCenter = { flex: 1, align: 'center', headerAlign: 'center' }

const IncomeReport = () => {
  const classes = useStyles()

  const { t } = useTranslation()

  const [
    {
      incomeByElectionsList,
      electionsByYearList,
      percentIncomeList,
      delegatesList,
      electionRoundSelect,
      electionYearSelect,
      showElectionRadio
    },
    {
      setElectionRoundSelect,
      setElectionYearSelect,
      getListElectionYears,
      setShowElectionRadio
    }
  ] = useIncomeReportState()

  useEffect(() => {
    setShowElectionRadio('allElections')
  }, [])

  const tableData =
    showElectionRadio === 'allElections'
      ? incomeByElectionsList.map(firstObj => ({
          ...percentIncomeList.find(
            secondObj => secondObj.name === firstObj.election
          ),
          ...firstObj
        }))
      : delegatesList.map(firstObj => ({
          ...percentIncomeList.find(
            secondObj => secondObj.name === firstObj.name
          ),
          ...firstObj
        }))

  const columns = [
    {
      field: 'election',
      hide: !tableData[0]?.election,
      headerName: t('tableElectionHeader', { ns: 'incomeRoute' }),
      cellClassName: classes.links,
      ...rowsCenter
    },
    {
      field: 'name',
      hide: !tableData[0]?.color,
      headerName: tableData[0]?.name
        ? t('tableHeader1', { ns: 'incomeRoute' })
        : t('tableElectionHeader', { ns: 'incomeRoute' }),
      cellClassName: classes.links,
      renderCell: param => (
        <a
          className={tableData[0]?.name ? '' : classes.disableLink}
          href={`https://eosauthority.com/account/${param.value}?network=eos`}
        >
          {param.value}
        </a>
      ),
      ...rowsCenter
    },
    {
      field: 'EOS_TOTAL',
      headerName: 'EOS',
      hide: !tableData[0]?.election,
      renderCell: param => <>{formatWithThousandSeparator(param.value, 2)}</>,
      type: 'number',
      ...rowsCenter
    },
    {
      field: 'USD_TOTAL',
      headerName: 'USD',
      hide: !tableData[0]?.election,
      renderCell: param => <>{formatWithThousandSeparator(param.value, 2)}</>,
      type: 'number',
      ...rowsCenter
    },
    {
      field: 'EOS_CLAIMED_PERCENT',
      headerName: t('tableHeader7', { ns: 'incomeRoute' }),
      type: 'number',
      ...rowsCenter
    },
    {
      field: 'EOS_UNCLAIMED_PERCENT',
      headerName: t('tableHeader8', { ns: 'incomeRoute' }),
      type: 'number',
      ...rowsCenter
    },
    {
      field: 'USD_CLAIMED_PERCENT',
      headerName: t('tableHeader9', { ns: 'incomeRoute' }),
      type: 'number',
      ...rowsCenter
    },
    {
      field: 'USD_UNCLAIMED_PERCENT',
      headerName: t('tableHeader10', { ns: 'incomeRoute' }),
      type: 'number',
      ...rowsCenter
    }
  ]

  return (
    <div className={classes.root}>
      <div id="treasury-container-id">
        <TreasuryBalance />
      </div>
      <div className={classes.chartContainer}>
        <BarChartGeneralReport
          data={incomeByElectionsList}
          keyTranslation={'titleBarChart'}
          pathTranslation={'incomeRoute'}
          showLegend={true}
          typeData={'income'}
        />
      </div>
      <Divider variant="middle" />
      <div className={classes.filtersContainer}>
        <div id="id-radio-election-container">
          <FormControl>
            <RadioGroup
              name="election-radio-buttons-group"
              row
              onChange={({ target }) => setShowElectionRadio(target.value)}
              value={showElectionRadio}
            >
              <FormControlLabel
                control={<Radio size="small" />}
                label={t('textRadioButton4', { ns: 'generalForm' })}
                value="allElections"
              />
              <FormControlLabel
                control={<Radio size="small" />}
                label={t('textRadioButton3', { ns: 'generalForm' })}
                value="oneElection"
              />
            </RadioGroup>
          </FormControl>
        </div>
        <div id="id-radio-election-container">
          {showElectionRadio === 'oneElection' && (
            <>
              <SelectComponent
                onChangeFunction={setElectionYearSelect}
                labelSelect={t('textYearSelect', { ns: 'generalForm' })}
                values={getListElectionYears()}
                actualValue={electionYearSelect}
              />
              <SelectComponent
                onChangeFunction={setElectionRoundSelect}
                labelSelect={t('textElectionSelect', { ns: 'generalForm' })}
                values={electionsByYearList.map(data => `${data.election}`)}
                actualValue={electionRoundSelect}
              />
            </>
          )}
        </div>
      </div>

      <div className={classes.chartContainer}>
        <PieChartReport
          data={delegatesList}
          keyTranslation={'titlePieChart'}
          pathTranslation={'incomeRoute'}
          typeData={'income'}
        />
      </div>
      <Divider variant="middle" />
      <div className={classes.tableContainer}>
        <div className={classes.subTitle}>
          <Typography variant="span">
            {showElectionRadio === 'allElections'
              ? t('titleTable2', { ns: 'incomeRoute' })
              : t('titleTable', { ns: 'incomeRoute' })}
          </Typography>
          <div id="id-table-container">
            <TableReport columns={columns} dataPercent={tableData} />
          </div>
        </div>
      </div>
    </div>
  )
}

IncomeReport.prototypes = {}

export default memo(IncomeReport)
