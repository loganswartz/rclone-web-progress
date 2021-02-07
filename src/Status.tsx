import React from 'react';
import { mega } from 'safe-units';
import { RcloneReport, BytesPerSecond } from './Transfers';
import { Title, RecordTable } from './Utils';

export function RcloneStatus(props: { data?: RcloneReport }) {
  const { data } = props;
  console.log(data);
  const record = {
    "Rclone API Connection": <span>{data ? "Connected" : "Failed"}</span>,
    "Average Download": data ? data.speed.in(mega(BytesPerSecond)) : 'N/A',
    "Total Errors": data?.errors ?? 'N/A',
  };

  return (
    <>
      <Title>Server Status</Title>
      <RecordTable record={record} />
    </>
  );
}
