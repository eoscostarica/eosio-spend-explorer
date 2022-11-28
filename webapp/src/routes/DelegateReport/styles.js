export default theme => ({
  root: {
    margin: theme.spacing(1),
    '& #treasury-container-id': {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0)
    }
  },
  spinner: {
    textAlign: 'center',
    marginTop: '20vh'
  },
  headPage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  title: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    '& span': {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.56,
      letterSpacing: '-0.4px'
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1),
      width: '100%'
    }
  },
  filtersContainer: {
    width: '50%',
    margin: theme.spacing(2, 0, 2, 2),
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1),
      width: '100%',
      margin: theme.spacing(2, 0, 2, 0)
    },
    [theme.breakpoints.up('sm')]: {
      textAlign: 'center'
    }
  }
})
