import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {InfluntEngine} from './influnt';
import {ComponentInfo, ComponentSettings, HocFacadeConfig, InfluntSettings, SuiteSettings} from './types';

export function hocFacade<P extends Record<string, unknown>>(config: HocFacadeConfig<P>) {
  return function <C extends React.ComponentType<InferProps<C>>>(WrappedComponent: React.ComponentType<any>): ComponentInfo<C> {
    const hocProps = {} as InferProps<C>;
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
      component: hoistNonReactStatics(WithProviders, WrappedComponent) as C,
      hocProps,
    };
  };
}

export function configureInflunt<T>(settings: InfluntSettings<T>) {
  return <C extends React.ComponentType<InferProps<C>>>(
    component: C,
    componentSettings: ComponentSettings<InferProps<C>> = {},
    extraArgs: T extends unknown ? void : T,
  ) => {
    const componentInfo: ComponentInfo<C> = settings.providerHoc?.(extraArgs)(component) ?? {component, hocProps: {} as never};
    return ({componentSettingsOverride, extraArgsOverride}: SuiteSettings<C, T extends unknown ? void : T> = {}) => {
      const settings = {...componentSettings, ...componentSettingsOverride};

      return new InfluntEngine(componentInfo, settings, extraArgsOverride ?? extraArgs);
    };
  };
}
