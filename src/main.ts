import React from 'react';
import {InfluntEngine} from 'influnt';
import {Config, InfluntSettings} from './types';

export function configureInflunt(settings: InfluntSettings) {
  return <C extends React.ComponentType<Readonly<InferProps<C>>>>(component: C, config: Config<InferProps<C>> = {}) => {
    const node = settings.providerHoc?.(component) ?? component;
    return () => new InfluntEngine(node, config);
  };
}
