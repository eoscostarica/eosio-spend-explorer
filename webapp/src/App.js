import React, { Suspense, useEffect, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { StylesProvider, createGenerateClassName } from '@mui/styles'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import useTresuryBalanceState from './hooks/customHooks/useTresuryBalanceState'
import routes from './routes'
import Loader from './components/Loader'
import DashboardLayout from './layouts/Dashboard'
import { useSharedState } from './context/state.context'
import getTheme from './theme'
import './i18n'

const generateClassName = createGenerateClassName({
  productionPrefix: 'eosSpendExplorer'
})

const App = () => {
  const [state, { setEOSTrasuryBalance }] = useSharedState()

  const [{ eosRate, currencyBalance }] = useTresuryBalanceState()

  const renderRoute = ({ component: Component, ...route }, index) => (
    <Route
      key={`path-${route.path}-${index}`}
      path={route.path}
      exact={route.exact}
      element={<Component />}
    />
  )

  const userRoutes = useMemo(
    () => routes(state.user?.role || 'guest'),

    [state.user]
  )

  const theme = useMemo(() => getTheme(state.useDarkMode), [state.useDarkMode])

  useEffect(() => {
    setEOSTrasuryBalance({
      eosRate,
      currencyBalance
    })
  }, [eosRate, currencyBalance])

  return (
    <BrowserRouter>
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DashboardLayout routes={userRoutes.sidebar}>
              <Suspense fallback={<Loader />}>
                <Routes>{userRoutes.browser.map(renderRoute)}</Routes>
              </Suspense>
            </DashboardLayout>
          </LocalizationProvider>
        </ThemeProvider>
      </StylesProvider>
    </BrowserRouter>
  )
}

export default App
