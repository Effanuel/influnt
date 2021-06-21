import React from 'react';
import {InfluntEngine} from './influnt';
import {ComponentSettings, InfluntSettings} from './types';

export function configureInflunt<T>(settings: InfluntSettings<T>) {
  return <C extends React.ComponentType<Readonly<InferProps<C>>>>(
    component: C,
    componentSettings: ComponentSettings<InferProps<C>> = {},
    extraArgs: T
  ) => {
    const node = settings.providerHoc?.(extraArgs)(component) ?? component;
    return () => new InfluntEngine(node, componentSettings);
  };
}
