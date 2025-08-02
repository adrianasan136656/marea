import { Marea } from "./marea";

export type RootStackParamList = {
  CrearMarea: undefined;
  MisMareas: undefined;
  DetalleMarea: { marea: Marea };
  EditarMareaScreen: { marea: Marea };
  WelcomeScreen: undefined;
  MainTabs: undefined;
};
