import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {InfluntEngine} from './influnt';
import {ComponentSettings, HocFacadeConfig, InfluntSettings} from './types';

export function hocFacade<P extends Record<string, unknown>>(config: HocFacadeConfig<P>) {
  return function <C extends React.ComponentType<Readonly<InferProps<C>>>>(
    WrappedComponent: React.ComponentType<Readonly<InferProps<C>>>,
  ): {
    component: React.ComponentType<Readonly<InferProps<C>>>;
    hocProps: P;
  } {
    const hocProps = {} as P;
    class WithProviders extends React.PureComponent<InferProps<C>> {
      render() {
        return config.providers.reduce((node, HocProvider) => {
          if (Array.isArray(HocProvider)) {
            const [Component, {props}] = HocProvider;
            Object.assign(hocProps, props);
            return <Component {...props}>{node}</Component>;
          }
          return <HocProvider>{node}</HocProvider>;
        }, <WrappedComponent {...this.props} />);
      }
    }

    return {
      component: hoistNonReactStatics(WithProviders, WrappedComponent) as React.ComponentType<Readonly<InferProps<C>>>,
      hocProps,
    };
  };
}

export function configureInflunt<T>(settings: InfluntSettings<T>) {
  return <C extends React.ComponentType<Readonly<InferProps<C>>>>(
    component: C,
    componentSettings: ComponentSettings<InferProps<C>> = {},
    extraArgs: T extends unknown ? void : T,
  ) => {
    const node = settings.providerHoc?.(extraArgs)(component) ?? component;
    return () => new InfluntEngine(node, componentSettings, extraArgs);
  };
}
