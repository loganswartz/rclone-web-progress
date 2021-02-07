import React from 'react';
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
import { Measure, bits, bytes, seconds, minutes, mega, giga, Time } from 'safe-units';
import { Title, RecordTable } from './Utils';

type seconds = typeof seconds;
const BitRate = bits.over(Time);
type BitRate = typeof BitRate;

type bytes = typeof bytes;
const BitsPerSecond: BitRate = bits.per(seconds).withSymbol('bps');
type BitsPerSecond = typeof BitsPerSecond;
export const BytesPerSecond: BitRate = bytes.per(seconds).withSymbol('B/s');
type BytesPerSecond = typeof BytesPerSecond;

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

export type RawTransfer = {
  bytes: number,
  eta: number,
  name: string,
  percentage: number,
  speed: number,
  speedAvg: number,
  size: number,
}

export type Transfer = {
  bytes: bytes,  // total transferred bytes for this file,
  eta: seconds,  // estimated time in seconds until file transfer completion
  name: string,  // name of the file,
  percentage: number,  // progress of the file transfer in percent,
  speed: BytesPerSecond,  // average speed over the whole transfer in bytes/sec,
  speedAvg: BytesPerSecond,  // current speed in bytes/sec as an exponentially weighted moving average,
  size: bytes,  // size of the file in bytes
}

export type RawRcloneReport = {
  speed: number,
  bytes: number,
  errors: number,
  fatalError: boolean,
  retryError: boolean,
  checks: number,
  transfers: number,
  deletes: number,
  renames: number,
  transferTime: number,
  elapsedTime: number,
  lastError?: string,
  transferring?: RawTransfer[],
  checking?: string[],
}

export type RcloneReport = {
  speed: BytesPerSecond,  // average speed in bytes/sec since start of the process,
  bytes: bytes,  // total transferred bytes since the start of the process,
  errors: number,  // number of errors,
  fatalError: boolean,  // whether there has been at least one FatalError,
  retryError: boolean,  // whether there has been at least one non-NoRetryError,
  checks: number,  // number of checked files,
  transfers: number,  // number of transferred files,
  deletes: number,  // number of deleted files,
  renames: number,  // number of renamed files,
  transferTime: seconds,  // total time spent on running jobs,
  elapsedTime: seconds,  // time in seconds since the start of the process,
  lastError: string,  // last occurred error,
  transferring: Transfer[],  // an array of currently active file transfers:
  checking: string[],  // an array of names of currently active file checks
}

const testTransfer: RawTransfer = {
  bytes: 163679406,
  speed: 30000,
  eta: 252,
  name: "[Golumpa]Your.Name.2018.(1080p).mkv",
  percentage: 42,
  speedAvg: 23523,
  size: 387912872,
};

function typeNarrowTransfer(raw: RawTransfer): Transfer {
  const converted: Transfer = {
    bytes: Measure.of(raw.bytes, bytes),
    speed: Measure.of(raw.speed, BytesPerSecond),
    eta: Measure.of(raw.eta, seconds),
    name: raw.name,
    percentage: raw.percentage,
    speedAvg: Measure.of(raw.speedAvg, BytesPerSecond),
    size: Measure.of(raw.size, bytes),
  };
  return converted;
}

export function typeNarrowReport(raw: RawRcloneReport): RcloneReport {
  const changes = {
    speed: Measure.of(raw.speed, BytesPerSecond),
    bytes: Measure.of(raw.bytes, bytes),
    transferTime: Measure.of(raw.transferTime, seconds),
    elapsedTime: Measure.of(raw.elapsedTime, seconds),
    lastError: raw.lastError ?? "",
    transferring: raw.transferring?.map(typeNarrowTransfer) ?? [],
    checking: raw.checking && raw.checking !== [] ? raw.checking : [],
  }

  const converted: RcloneReport = Object.assign({}, raw, changes);
  return converted;
}

interface TransferListProps {
  data?: RcloneReport;
  title: string;
}

function TransferTable(props: { data: Transfer }) {
  const { data } = props;

  const modified = {
    Filename: data.name,
    Progress: `${data.percentage}%`,
    "Filesize": data.size.in(giga(bytes)),
    Transferred: data.bytes.in(mega(bytes)),
    "Current Speed": data.speed.in(mega(BytesPerSecond)),
    "Average Speed": data.speedAvg.in(mega(BytesPerSecond)),
    "Time Remaining": data.eta.in(minutes),
  }
  return <RecordTable record={modified} />
}

export function TransferList(props: TransferListProps) {
  function TransferItem(props: { entry: Transfer, index: number }) {
    const { entry, index } = props;

    return (
      <Accordion key={index}>
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
  const entries = [...(data?.transferring ?? []), typeNarrowTransfer(testTransfer)]?.map((entry, index) => <TransferItem entry={entry} index={index} />) ?? [];

  return (
    <div style={{ width: '100%' }}>
      <Title>{title}</Title>
      {entries.length > 0 ? entries : <span>Nothing currently transferring.</span>}
    </div>
  );
}
