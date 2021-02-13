import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  DrawerProps,
  Typography,
  IconButton,
  Container,
  Paper,
  Grid,
  Box,
  Hidden,
  makeStyles,
  Theme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  createStyles,
  CssBaseline,
  Switch,
  ThemeProvider,
  createMuiTheme,
  useMediaQuery,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import HistoryIcon from '@material-ui/icons/History';
import HomeIcon from '@material-ui/icons/Home';
import NightsStayIcon from '@material-ui/icons/NightsStay';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import clsx from 'clsx';
import Websocket from 'react-websocket';
import { TransferList } from './Transfers';
import { StatsReport, typeNarrowReport } from './DataHandling';
import { RcloneStatus } from './Status';
import { Title, usePersistentState } from './Utils';

const WS_URL = 'wss://ws.loganswartz.com/stats';

const drawerWidth = '240px';
const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
    },
    toolbar: theme.mixins.toolbar,
    title: {
      flexGrow: 1,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(0),
        overflowX: 'hidden',
      },
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(0),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(7.5),
      },
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerContainer: {
      overflow: 'hidden',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
}));

interface TopBarProps {
  children: React.ReactNode;
  toggleCallback(): void;
}

function TopBar(props: TopBarProps) {
  const { children, toggleCallback } = props;
  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleCallback}>
          <MenuIcon />
        </IconButton>
        <Typography noWrap variant="h6" className={classes.title}>Rclone-Web-Progress</Typography>
        {children}
      </Toolbar>
    </AppBar>
  );
}

const sideDrawerEntries = [
  {
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    title: 'Downloads',
    icon: <CloudDownloadIcon />,
  },
  {
    title: 'History',
    icon: <HistoryIcon />,
  }
];

type DrawerEntry = {
  title: string,
  icon: React.ReactNode,
  link?: string,
}

interface SideDrawerProps {
	open: boolean;
    setOpen(open: boolean): void;
    entries: DrawerEntry[];
    variant?: DrawerProps["variant"];
    drawerProps?: DrawerProps;
}

function SideDrawer(props: SideDrawerProps) {
  const { open, setOpen, entries, variant, drawerProps } = props;
  const classes = useStyles();

  return (
    <Drawer
      variant={variant ?? "permanent"}
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      open={open}
      onBackdropClick={() => { if (variant === "temporary") { setOpen(false) } }}
      {...drawerProps}
    >
      {variant === "permanent" ? <Toolbar /> : null }
      <div className={classes.drawerContainer}>
        <List>
          {variant === "permanent" ? null : <ListItem><Title>Rclone Stats</Title></ListItem>}
          {entries.map((entry, index) => (
            <ListItem button key={index} onClick={() => { if (entry.link) { window.location.href = entry.link } }}>
              <ListItemIcon>{entry.icon}</ListItemIcon>
              <ListItemText primary={entry.title} />
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
}

SideDrawer.defaultProps = { variant: "temporary" };

function handleWsReport(msg: string, callback: Function) {
  const parsed = JSON.parse(msg);
  if (parsed !== {}) {
    callback(typeNarrowReport(parsed));
  }
}

function App() {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [transferData, setTransferData] = useState<StatsReport>();
  const [darkMode, setDarkMode] = usePersistentState('dark_mode', false);
  const [wsConnected, setWsConnected] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  }
  const theme = createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            display: 'flex',
            minHeight: '100vh',
          },
          body: {
            display: 'flex',
            flexGrow: 1,
          },
        },
      },
    },
  });
  const isSmall = useMediaQuery(theme.breakpoints.down('xs'));

  function DarkModeToggle(props: { label?: React.ReactNode }) {
    const { label } = props;
    return (
      <>
        {label ?? darkMode ? <NightsStayIcon /> : <WbSunnyIcon />}
        <Switch onChange={(_, checked) => setDarkMode(checked)} />
      </>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <TopBar toggleCallback={handleDrawerToggle}>
          <Switch name="Dark Mode" checked={darkMode} onChange={(_, checked) => setDarkMode(checked)} />
        </TopBar>
        <Hidden xsDown>
          <SideDrawer entries={sideDrawerEntries} open={drawerOpen} setOpen={setDrawerOpen} variant="permanent" />
        </Hidden>
        <Hidden smUp>
          <SideDrawer entries={sideDrawerEntries} open={drawerOpen} setOpen={setDrawerOpen} />
        </Hidden>
        <main className={classes.content}>
          <Toolbar />
          <Box style={{ flexGrow: 1 }}>
            <Container maxWidth="lg" disableGutters={isSmall}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Paper className={classes.paper}>
                    <Websocket url={WS_URL}
                      onOpen={() => setWsConnected(true)}
                      onClose={() => setWsConnected(false)}
                      onMessage={(msg: string) => handleWsReport(msg, setTransferData)}
                    />
                    <TransferList title="Active Transfers" data={transferData} />
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Paper className={classes.paper}>
                    <RcloneStatus data={transferData} connected={wsConnected} />
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
