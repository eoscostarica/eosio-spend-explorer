const { edenConfig } = require('../config')
const { eosUtil } = require('../utils')
const { edenDelegatesGql } = require('../gql')
const { edenElectionGql } = require('../gql')
const { servicesConstant } = require('../constants')

const loadMembers = async ({ next_key: nextKey = null, limit = 100 } = {}) => {
  return await eosUtil.getTableRows({
    code: 'genesis.eden',
    scope: 0,
    table: 'member',
    limit,
    lower_bound: nextKey
  })
}

const updateEdenTable = async () => {
  let nextKey = null

  while (true) {
    const members = await loadMembers({ next_key: nextKey })

    for (const member of members.rows) {
      if (!(member[1].election_rank > 0)) continue

      const memberData = {
        account: member[1].account
      }
      let registeredMember = await edenDelegatesGql.get({
        account: { _eq: memberData.account }
      })

      if (!registeredMember)
        registeredMember = await edenDelegatesGql.save(memberData)

      const electionData = {
        id_delegate: registeredMember.id,
        election: parseInt(member[0].slice(8)) + 1,
        delegate_level: member[1].election_rank
      }
      const registeredElection = await edenElectionGql.get({
        id_delegate: { _eq: registeredMember.id },
        election: { _eq: electionData.election }
      })

      if (!registeredElection) await edenElectionGql.save(electionData)
    }

    if (!members.more) break

    nextKey = members.next_key
  }
}

const updateEdenTableWorker = () => {
  return {
    name: servicesConstant.MESSAGES.delegates,
    interval: edenConfig.edenElectionInterval,
    action: updateEdenTable
  }
}

module.exports = {
  updateEdenTableWorker
}
