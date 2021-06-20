type DataBlob = Record<string, unknown>;

type InferProps<T> = T extends React.ComponentType<infer Props> ? Props : never; // ensures react implicit props are excluded
