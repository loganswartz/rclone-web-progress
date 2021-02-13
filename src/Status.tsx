import React from 'react';
import { Chip } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ErrorIcon from '@material-ui/icons/Error';
import { StatsReport, normalizeMemory } from './DataHandling';
import { Title, RecordTable } from './Utils';

export function RcloneStatus(props: { data?: StatsReport, connected: boolean }) {
  const { data, connected } = props;
  const record = {
    "Rclone API Connection": <Chip size="small" color={connected ? "primary" : "secondary"} label={connected ? "Connected" : "Failed"} icon={connected ? <CheckIcon /> : <ErrorIcon />} />,
    "Average Download": data ? normalizeMemory(data.speed) : 'N/A',
    "Total Errors": data?.errors ?? 'N/A',
  };

  return (
    <>
      <Title>Server Status</Title>
      <RecordTable record={record} />
    </>
  );
}
