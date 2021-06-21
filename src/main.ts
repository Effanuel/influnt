import React from 'react';
import {InfluntEngine} from './influnt';
import {ComponentSettings, InfluntSettings} from './types';

export function configureInflunt(settings: InfluntSettings) {
  return <C extends React.ComponentType<Readonly<InferProps<C>>>>(
    component: C,
    componentSettings: ComponentSettings<InferProps<C>> = {},
  ) => {
    const node = settings.providerHoc?.(component) ?? component;
    return () => new InfluntEngine(node, componentSettings);
  };
}
