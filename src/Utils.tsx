import React, { useEffect } from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
} from '@material-ui/core';


export function Title(props: TitleProps) {
  const theme = useTheme();

  return (
    <Typography component="h2" variant="h6" color={ theme.palette.type === "dark" ? "textPrimary" : "primary" } gutterBottom>
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

export function usePersistentState(key: string, defaultValue: any) {
  const [state, setState] = React.useState(
    () => {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        return JSON.parse(stored);
      } else {
        return defaultValue;
      }
    }
  );
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

export function intersection(a: object, b: object) {
  const [a_keys, b_keys] = [Object.keys(a), Object.keys(b)];
  const [shorter, longer] = a_keys.length > b_keys.length ? [b_keys, a] : [a_keys, b];
  return shorter.filter(k => k in longer);
}
