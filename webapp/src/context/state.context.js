import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

const SharedStateContext = React.createContext()

const initialValue = {
  useDarkMode: false,
  user: null,
  eosTrasuryBalance: {}
}

const sharedStateReducer = (state, action) => {
  switch (action.type) {
    case 'ual':
      return {
        ...state,
        ual: action.ual
      }

    case 'userChange':
      return {
        ...state,
        user: action.user
      }

    case 'set': {
      return {
        ...state,
        ...action.payload
      }
    }

    case 'showMessage':
      return {
        ...state,
        message: action.payload
      }

    case 'hideMessage':
      return {
        ...state,
        message: null
      }

    case 'login':
      state.ual.showModal()

      return state

    case 'logout':
      state.ual.logout()

      return state

    case 'setEosTresuryBalance':
      return {
        ...state,
        eosTrasuryBalance: action.payload
      }

    default: {
      throw new Error(`Unsupported action type: ${action.type}`)
    }
  }
}

export const SharedStateProvider = ({ children, ual, ...props }) => {
  const [state, dispatch] = React.useReducer(sharedStateReducer, {
    ...initialValue,
    ual
  })
  const value = React.useMemo(() => [state, dispatch], [state])

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'userChange', user: ual.activeUser })
      dispatch({ type: 'ual', ual })
    }

    load()
  }, [ual?.activeUser])

  return (
    <SharedStateContext.Provider value={value} {...props}>
      {children}
    </SharedStateContext.Provider>
  )
}

SharedStateProvider.propTypes = {
  children: PropTypes.node,
  ual: PropTypes.any
}

export const useSharedState = () => {
  const context = React.useContext(SharedStateContext)

  if (!context) {
    throw new Error(`useSharedState must be used within a SharedStateContext`)
  }

  const [state, dispatch] = context
  const setState = payload => dispatch({ type: 'set', payload })
  const showMessage = payload => dispatch({ type: 'showMessage', payload })
  const hideMessage = () => dispatch({ type: 'hideMessage' })
  const login = () => dispatch({ type: 'login' })
  const logout = () => dispatch({ type: 'logout' })
  const setEOSTrasuryBalance = payload =>
    dispatch({ type: 'setEosTresuryBalance', payload })

  return [
    state,
    { setState, showMessage, hideMessage, login, logout, setEOSTrasuryBalance }
  ]
}
