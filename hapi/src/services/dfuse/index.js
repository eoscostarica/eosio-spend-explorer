const moment = require('moment')

const { edenConfig } = require('../../config')
const {
  edenElectionGql,
  edenHistoricElectionGql,
  edenTransactionGql,
  edenDelegatesGql
} = require('../../gql')
const {
  hasuraUtil,
  sleepUtil,
  communityUtil,
  dfuseUtil
} = require('../../utils')

const updaters = require('./updaters')

let LASTEST_RATE_DATE_CONSULTED = null
let LASTEST_RATE_DATA_CONSULTED = null

const runUpdaters = async actions => {
  for (let index = 0; index < actions.length; index++) {
    let lastElectionsAmountFundTransfer = 0
    const action = actions[index]
    try {
      const { matchingActions, id } = action?.trace

      for (
        let indexMatching = 0;
        indexMatching < matchingActions.length;
        indexMatching++
      ) {
        const matchingAction = matchingActions[indexMatching]
        const updater = updaters.find(
          item =>
            item.type === `${matchingAction.account}:${matchingAction.name}`
        )

        if (matchingAction.name === 'categorize') {
          await updater.apply({
            json: matchingAction.json
          })

          continue
        }

        const timestamp =
          matchingAction.name === 'fundtransfer'
            ? matchingAction.json.distribution_time
            : action.trace.block.timestamp
        const electionNumber = await edenHistoricElectionGql.get({
          date_election: { _lte: timestamp }
        })

        if (!electionNumber) continue

        const delegateAccount =
          matchingAction.name === 'withdraw'
            ? matchingAction.json.owner
            : matchingAction.json.from
        const edenElectionId = await edenElectionGql.get({
          eden_delegate: { account: { _eq: delegateAccount } },
          election: { _eq: electionNumber.election }
        })
        const registeredTransaction = await edenTransactionGql.get({
          txid: { _eq: id }
        })

        if (!edenElectionId || registeredTransaction) continue

        const txDate = moment(timestamp).format('DD-MM-YYYY')

        if (LASTEST_RATE_DATE_CONSULTED !== txDate) {
          try {
            const data = await communityUtil.getExchangeRateByDate(txDate)
            LASTEST_RATE_DATA_CONSULTED = data.market_data.current_price.usd
            LASTEST_RATE_DATE_CONSULTED = txDate
          } catch (error) {
            console.error(
              `error runUpdaters, number of date queries exceeded: ${error.message}`
            )

            await sleepUtil(60)

            return runUpdaters(actions)
          }
        }

        if (matchingAction.name === 'fundtransfer') {
          const withdrawElection = await edenHistoricElectionGql.get({
            date_election: { _lte: timestamp }
          })
          const amount = Number(matchingAction.json.amount.split(' ')[0])

          lastElectionsAmountFundTransfer =
            withdrawElection.election !== edenElectionId.election
              ? lastElectionsAmountFundTransfer + amount
              : lastElectionsAmountFundTransfer
        }

        await updater.apply({
          transaction_id: id,
          json: matchingAction.json,
          timestamp,
          ation: matchingAction.name,
          eosPrice: LASTEST_RATE_DATA_CONSULTED,
          election: edenElectionId,
          amountTransfer: lastElectionsAmountFundTransfer,
          delegateAccount
        })
      }
    } catch (error) {
      console.error(
        `error to sync ${action.trace.matchingActions[0].name}: ${error.message}`
      )
    }
  }
}

const getActions = async params => {
  const { data } = await dfuseUtil.client.graphql(
    dfuseUtil.getfundTransferQuery(params)
  )
  const transactionsList = data.searchTransactionsForward.results

  return {
    hasMore: transactionsList.length === 1000,
    actions: transactionsList,
    blockNumber: transactionsList.at(-1)?.trace.block.num
  }
}

const sync = async () => {
  await hasuraUtil.hasuraAssembled()
  const delegatesList = await edenDelegatesGql.get({}, true)

  for (let index = 0; index < delegatesList.length; index++) {
    const delegate = delegatesList[index]
    let hasMore = true
    let actions = []
    let blockNumber = delegate.last_synced_at
    try {
      while (hasMore) {
        ;({ hasMore, actions, blockNumber } = await getActions({
          query: `account:${edenConfig.edenContract} data.owner:${delegate.account} OR account:${edenConfig.edenContract} data.to:${delegate.account} OR account:eosio.token data.from:${delegate.account} receiver:eosio.token OR data.account:${delegate.account} receiver:edenexplorer`,
          lowBlockNum: blockNumber
        }))

        await runUpdaters(actions)
        await edenDelegatesGql.update(delegate.id, blockNumber)
        await sleepUtil(10)
      }
    } catch (error) {
      console.error('dfuse error', error.message)
    }
  }

  await sleepUtil(10)

  return sync()
}
const syncWorker = () => {
  return {
    name: 'SYNC ACTIONS',
    action: sync
  }
}

module.exports = {
  syncWorker
}
