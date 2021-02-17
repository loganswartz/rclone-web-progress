import {
  Measure,
  Time,
  seconds,
  Memory,
  bits,
  bytes,
  milli,
  mega,
  giga,
  tera,
  peta,
  exa,
  zetta,
  yotta,
} from 'safe-units';
import equal from 'fast-deep-equal/es6';

export type seconds = typeof seconds;
const milliseconds = milli(seconds);
export type milliseconds = typeof milliseconds;

export type bits = typeof bits;
export type bytes = typeof bytes;

const DataRate = Memory.over(Time);
export type DataRate = typeof DataRate;

const BitRate = bits.over(Time);
export type BitRate = typeof BitRate;

const ByteRate = bytes.over(Time);
export type ByteRate = typeof ByteRate;

const BitsPerSecond: BitRate = bits.per(seconds).withSymbol('bps');
export type BitsPerSecond = typeof BitsPerSecond;
const BytesPerSecond: ByteRate = bytes.per(seconds).withSymbol('B/s');
export type BytesPerSecond = typeof BytesPerSecond;

export function isMemory(obj: any): obj is Memory {
  return equal(obj?.unit, Memory.unit);
}

export function isDataRate(obj: any): obj is DataRate {
  return equal(obj?.unit, DataRate.unit);
}

export function getBaseLog(x: number, y: number) {
  return Math.log(y) / Math.log(x);
}

export function normalizeMemory(value: Memory | DataRate, unit: bits | bytes = bytes) {
  const formatter = {
    formatValue: (value: number) => `${value.toFixed(2)}`
  }
  const kilo = Measure.prefix('K', 1e3);
  const scales = [
    Measure.prefix('', 1),
    kilo,
    mega,
    giga,
    tera,
    peta,
    exa,
    zetta,
    yotta,
  ];

  // when 90% of the next order of magnitude is reached, switch to it
  const offset = 1 - getBaseLog(1000, 900);
  const logarithm = getBaseLog(1000, unit === bits ? value.value : value.value / 8);
  // account for log(0) === -Infinity
  const orderOfMagnitude = logarithm !== -Infinity ? logarithm : 0
  const selection = Math.floor(orderOfMagnitude + offset);

  const scale = scales[selection];
  if (isDataRate(value)) {
    return value.in(scale(unit === bits ? BitsPerSecond : BytesPerSecond), formatter);
  } else {
    return value.in(scale(unit), formatter);
  }
}

export function normalizeTime(value: Time) {
  let seconds = value.value;

  const scales = {
    days: 86400,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };

  const converted: { [key: string]: number } = {};
  for (const [scale, factor] of Object.entries(scales)) {
    const subdivision = Math.floor(seconds / factor);
    seconds = seconds - (subdivision * factor);
    converted[scale] = subdivision;
  }

  return Object.entries(converted).map(([scale, scalar]) => scalar ? `${scalar}${scale[0]}` : '').join('')
}

export type RawTransferReport = {
  bytes: number,
  eta: number,
  name: string,
  percentage: number,
  speed: number,
  speedAvg: number,
  size: number,
}

export type TransferReport = {
  bytes: bytes,  // total transferred bytes for this file,
  eta: seconds,  // estimated time in seconds until file transfer completion
  name: string,  // name of the file,
  percentage: number,  // progress of the file transfer in percent,
  speed: BytesPerSecond,  // average speed over the whole transfer in bytes/sec,
  speedAvg: BytesPerSecond,  // current speed in bytes/sec as an exponentially weighted moving average,
  size: bytes,  // size of the file in bytes
}

export type RawStatsReport = {
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
  transferring?: RawTransferReport[],
  checking?: string[],
}

export type StatsReport = {
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
  transferring: TransferReport[],  // an array of currently active file transfers:
  checking: string[],  // an array of names of currently active file checks
}

type CompletedTransfer = {
  name: string,  // name of the file
  size: bytes,  // size of the file in bytes
  bytes: bytes,  // total transferred bytes for this file
  checked: boolean,  // if the transfer is only checked (skipped, deleted)
  started_at: Date,
  completed_at: Date,
  error: string,  // string description of the error (empty if successful)
  jobid?: number,  // id of the job that this transfer belongs to
  group: string,  // stats group id
}

type CompletedTransferReport = {
  transferred: CompletedTransfer[],
}

type RawCompletedTransfer = {
  name: string,  // name of the file
  size: number,  // size of the file in bytes
  bytes: number,  // total transferred bytes for this file
  checked: boolean,  // if the transfer is only checked (skipped, deleted)
  started_at: string,  // ISO 8601 datetime string
  completed_at: string,  // ISO 8601 datetime string
  error: string,  // string description of the error (empty if successful)
  jobid?: number,  // id of the job that this transfer belongs to
  group: string,  // stats group id
}

type RawCompletedTransferReport = {
  transferred: RawCompletedTransfer[],
}

export function typeNarrowTransfer(raw: RawTransferReport): TransferReport {
  const converted: TransferReport = {
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

export function typeNarrowReport(raw: RawStatsReport): StatsReport {
  const changes = {
    speed: Measure.of(raw.speed, BytesPerSecond),
    bytes: Measure.of(raw.bytes, bytes),
    transferTime: Measure.of(raw.transferTime, seconds),
    elapsedTime: Measure.of(raw.elapsedTime, seconds),
    lastError: raw.lastError ?? "",
    transferring: raw.transferring?.map(typeNarrowTransfer) ?? [],
    checking: raw.checking && raw.checking !== [] ? raw.checking : [],
  }

  const converted: StatsReport = Object.assign({}, raw, changes);
  return converted;
}

export function typeNarrowCompletedTransfer(raw: RawCompletedTransfer): CompletedTransfer {
  const changes = {
    size: Measure.of(raw.bytes, BytesPerSecond),
    bytes: Measure.of(raw.bytes, bytes),
    started_at: new Date(raw.started_at),
    completed_at: new Date(raw.completed_at),
  }

  const converted: CompletedTransfer = Object.assign({}, raw, changes);
  return converted;
}

export function typeNarrowCompletedTransferReport(raw: RawCompletedTransferReport): CompletedTransferReport {
  const converted: CompletedTransferReport = {
    transferred: raw.transferred.map(typeNarrowCompletedTransfer),
  }
  return converted;
}
