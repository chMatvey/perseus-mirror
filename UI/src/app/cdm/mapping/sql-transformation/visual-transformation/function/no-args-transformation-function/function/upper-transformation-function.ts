import { NoArgsTransformationFunction } from '@mapping/sql-transformation/visual-transformation/function/no-args-transformation-function/no-args-transformation-function';

export class UpperTransformationFunction extends NoArgsTransformationFunction {

  sql(): (arg: string) => string {
    return (arg: string) => `UPPER(${arg})`;
  }
}
