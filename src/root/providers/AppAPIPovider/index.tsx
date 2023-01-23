import ApiProvider from "../../../api/components/APIProvider";

interface Props {
  children: any;
}

export const AppApiProvider = ({ children }: Props) => {
  //   const { auth } = useAppSelector((state: any) => state.auth)
  return (
    <ApiProvider
      endpoint={process.env.REACT_APP_DEFI_API as string}
      //   token={auth.token}
    >
      {children}
    </ApiProvider>
  );
};
