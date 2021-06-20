import {InfluntEngine} from 'influnt';
import {Config, InfluntSettings} from 'types';

export function configureWrench<C extends React.ComponentType<Readonly<InferProps<C>>>>(settings: InfluntSettings) {
  return (component: C, config: Config<InferProps<C>> = {}) => {
    const node = settings.providerHoc?.(component) ?? component;
    return () => new InfluntEngine(node, config);
  };
}

// export const createRenderer = configureWrench({providerHoc: withStore2});
