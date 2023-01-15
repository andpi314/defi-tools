import csv from "csv-parser";
import { Readable } from "stream";

export const parseCsvLines = <T>(rows: string[], separator = ";") => {
  return new Promise<T[]>((resolve, reject) => {
    const records: any = [];
    try {
      Readable.from([rows.join("\n")])
        .pipe(
          csv({
            separator,
          })
        )
        .on("data", (data: any) => {
          records.push(data);
        })
        .on("end", () => resolve(records));
    } catch (e) {
      reject(e);
    }
  });
};

export interface ColumnDefinition<T> {
  name: string;
  value: (item: T) => any;
}

const cleanValue = (value: string) =>
  value.replace(/,/g, " ").replace(/\n/g, " ").replace(/\t/g, " ");

const formatRow = (values: any[], delimiter: string) =>
  values.map((x) => cleanValue(x?.toString() ?? "")).join(delimiter);

const toCsvRow = <T>(
  item: T,
  columns: ColumnDefinition<T>[],
  delimiter: string
) =>
  formatRow(
    columns.map((x) => x.value(item)),
    delimiter
  );

export const toCsv = <T>(
  items: T[],
  columns: ColumnDefinition<T>[],
  delimiter = ","
) => {
  const header = formatRow(
    columns.map((x) => x.name),
    delimiter
  );
  const rows = items.map((x) => toCsvRow(x, columns, delimiter));
  return [header, ...rows].join("\n");
};
