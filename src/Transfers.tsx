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
import {
  normalizeMemory,
  normalizeTime,
  StatsReport,
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
    "Time Remaining": data.eta !== null ? normalizeTime(data.eta) : 'Unknown',
  }
  return <RecordTable record={modified} />
}

function TransferItem(props: { entry: TransferReport }) {
  const { entry } = props;
  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Accordion expanded={expanded} onChange={(_, value) => setExpanded(value)}>
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

export function TransferList(props: TransferListProps) {
  const { data, title } = props;
  const entries = data?.transferring?.map((entry, index) => <TransferItem entry={entry} key={index} />) ?? [];

  return (
    <div style={{ width: '100%' }}>
      <Title>{title}</Title>
      {entries.length > 0 ? entries : <span>Nothing currently transferring.</span>}
    </div>
  );
}
