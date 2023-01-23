import React from "react";
import { newUuid } from "../../utils/uuid";

export interface UseOperationInput<TResult, TInput> {
  operation: (variables: TInput) => Promise<TResult>;
}

export interface OperationState<TResult> {
  operationId?: string;
  loading: boolean;
  completed: boolean;
  called: boolean;
  success?: boolean;
  data?: TResult;
  error?: any;
}
type Operation<TResult, TInput> = (variables: TInput) => Promise<TResult>;

const invokeOperation = async <TResult, TInput>(
  input: UseOperationInput<TResult, TInput>,
  variables?: TInput
): Promise<TResult> => {
  if (variables) {
    return await (input.operation as Operation<TResult, TInput>)(variables);
  }

  return await (input.operation as () => Promise<TResult>)();
};

export const useOperationLazy = <TResult, TInput>(
  input: UseOperationInput<TResult, TInput>
) => {
  const [state, setState] = React.useState<OperationState<TResult>>({
    called: false,
    loading: false,
    completed: false,
  });

  const invoke = async (variables?: TInput) => {
    const operationId = newUuid();
    setState({
      called: true,
      loading: true,
      completed: false,
      data: undefined,
      error: undefined,
      operationId,
    });
    try {
      const result = await invokeOperation(input, variables);
      setState({
        called: true,
        loading: false,
        data: result,
        error: undefined,
        operationId,
        completed: true,
        success: true,
      });
    } catch (e) {
      console.error("Error invoking operation", e);
      setState({
        called: true,
        loading: false,
        data: undefined,
        error: e,
        operationId,
        completed: true,
        success: false,
      });
    }
  };

  return {
    invoke,
    state,
  };
};

export const useOperation = <TResult, TInput>(
  input: UseOperationInput<TResult, TInput>
) => {
  const { invoke, state } = useOperationLazy(input);

  React.useEffect(() => {
    invoke();
  }, []);

  return state;
};
