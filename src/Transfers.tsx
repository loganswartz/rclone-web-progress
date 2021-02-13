import React, { useState } from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  LinearProgressProps,
  Grid,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createContainer } from "unstated-next";
import {
  normalizeMemory,
  normalizeTime,
  StatsReport,
  testTransfer,
  typeNarrowTransfer,
  TransferReport,
} from './DataHandling';
import { Title, RecordTable } from './Utils';

export function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  const { style, ...other } = props;

  return (
    <Box display="flex" alignItems="center" style={style}>
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...other} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    transferAccordion: {
      [theme.breakpoints.down('xs')]: {
        flexDirection: "column",
      },
    },
}));

interface TransferListProps {
  data?: StatsReport;
  title: string;
}

function TransferTable(props: { data: TransferReport }) {
  const { data } = props;

  const modified = {
    Filename: data.name,
    Progress: `${data.percentage}%`,
    "Filesize": normalizeMemory(data.size),
    Transferred: normalizeMemory(data.bytes),
    "Current Speed": normalizeMemory(data.speed),
    "Average Speed": normalizeMemory(data.speedAvg),
    "Time Remaining": normalizeTime(data.eta),
  }
  return <RecordTable record={modified} />
}

function useExpand() {
  let [expanded, set] = useState<{[key: string]: boolean}>({});
  function setExpanded(key: string, value: boolean) {
    set(Object.assign({}, expanded, {[key]: value}));
  }
  return { expanded, setExpanded };
}
let Container = createContainer(useExpand);

export function TransferList(props: TransferListProps) {
  function TransferItem(props: { entry: TransferReport }) {
    const { entry } = props;
    const classes = useStyles();
    let state = Container.useContainer();

    return (
      <Accordion expanded={state.expanded[entry.name]} onChange={(_, value) => state.setExpanded(entry.name, value)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ display: 'flex' }}>
          <Grid container className={classes.transferAccordion}>
            <Grid item>
              <div style={{ flexGrow: 1, lineBreak: "anywhere", textAlign: "center" }}>{entry.name.split("/").slice(-1).pop()}</div>
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <LinearProgressWithLabel variant="determinate" value={entry.percentage} style={{ flexGrow: 1, marginLeft: "1rem" }} />
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <TransferTable data={entry} />
        </AccordionDetails>
      </Accordion>
    );
  }

  const { data, title } = props;
  const useTest = false;
  const transfers = useTest ? [...(data?.transferring ?? []), typeNarrowTransfer(testTransfer), typeNarrowTransfer(Object.assign({}, testTransfer, {name: "test.mkv"}))] : data?.transferring;
  const entries = transfers?.map((entry, index) => <TransferItem entry={entry} key={index} />) ?? [];

  return (
    <div style={{ width: '100%' }}>
      <Title>{title}</Title>
      <Container.Provider>
        {entries.length > 0 ? entries : <span>Nothing currently transferring.</span>}
      </Container.Provider>
    </div>
  );
}
