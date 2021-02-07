import React from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';


export function Title(props: TitleProps) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}

interface TitleProps {
  children: React.ReactNode,
};

type GenericRecord = {
  [key: string]: any
}

export function RecordTable(props: { record: GenericRecord }) {
  const { record } = props;

  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          {Object.entries(record).map(([key, value]) => {
            return (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
