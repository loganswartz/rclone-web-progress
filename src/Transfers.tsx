import React, { useState } from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  LinearProgressProps,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  normalizeMemory,
  normalizeTime,
  StatsReport,
  TransferReport,
  typeNarrowTransfer,
  testTransfer,
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

export function TransferList(props: TransferListProps) {
  function TransferItem(props: { entry: TransferReport }) {
    const { entry } = props;
    const [open, setOpen] = useState<boolean>(false);

    return (
      <Accordion expanded={open} onChange={(_, value) => setOpen(value)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ display: 'flex' }}>
          <div style={{ flexGrow: 1, maxWidth: "40%" }}>{entry.name}</div>
          <LinearProgressWithLabel variant="determinate" value={entry.percentage} style={{ flexGrow: 1 }} />
        </AccordionSummary>
        <AccordionDetails>
          <TransferTable data={entry} />
        </AccordionDetails>
      </Accordion>
    );
  }

  const { data, title } = props;
  const entries = [...(data?.transferring ?? []), typeNarrowTransfer(testTransfer)]?.map((entry, index) => <TransferItem entry={entry} key={index} />) ?? [];

  return (
    <div style={{ width: '100%' }}>
      <Title>{title}</Title>
      {entries.length > 0 ? entries : <span>Nothing currently transferring.</span>}
    </div>
  );
}
