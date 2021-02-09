import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  Typography,
  IconButton,
  Container,
  Paper,
  Grid,
  Box,
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

const WS_URL = 'wss://ws.loganswartz.com/stats';

const drawerWidth = '15vw';
const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    title: {
      flexGrow: 1,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
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
      width: theme.spacing(7) + 1,
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

interface SideDrawerProps {
	open: boolean;
}

function SideDrawer(props: SideDrawerProps) {
  const { open } = props;
  const classes = useStyles();

  const entries = [
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

  return (
    <Drawer
      variant="permanent"
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
    >
      <Toolbar />
      <div className={classes.drawerContainer}>
        <List>
          {entries.map((entry, index) => (
            <ListItem button key={index}>
              <ListItemIcon>{entry.icon}</ListItemIcon>
              <ListItemText primary={entry.title} />
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
}

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
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  }
  const theme = createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
    }
  });

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
          <Switch name="Dark Mode" onChange={(_, checked) => setDarkMode(checked)} />
        </TopBar>
        <SideDrawer open={drawerOpen} />
        <main className={classes.content}>
          <Toolbar />
          <Box height="100%">
            <Container maxWidth="lg">
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Paper className={classes.paper}>
                    <Websocket url={WS_URL} onMessage={(msg: string) => handleWsReport(msg, setTransferData)} />
                    <TransferList title="Active Transfers" data={transferData} />
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Paper className={classes.paper}>
                    <RcloneStatus data={transferData} />
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
