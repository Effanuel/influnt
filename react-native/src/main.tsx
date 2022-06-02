import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {InfluntEngine} from './influnt';
import {ComponentSettings, ExtraArgs, HocFacadeConfig, InfluntSettings, SuiteSettings} from './types';
import {toArray} from './util';

export function hocFacade<P extends Record<string, unknown>>(config: HocFacadeConfig<P>) {
  return function <C extends React.ComponentType<InferProps<C>>>(WrappedComponent: React.ComponentType<any>): C {
    class WithProviders extends React.PureComponent<InferProps<C>> {
      render() {
        return config.providers.reverse().reduce((node, HocProvider) => {
          if (Array.isArray(HocProvider)) {
            const [Component, {props}] = HocProvider;
            return <Component {...props}>{node}</Component>;
          }
          return <HocProvider>{node}</HocProvider>;
        }, <WrappedComponent {...this.props} />);
      }
    }

    return hoistNonReactStatics(WithProviders, WrappedComponent) as C;
  };
}

export function configureInflunt<T = void>(settings: InfluntSettings<T> = {}) {
  return <C extends React.ComponentType<InferProps<C>>>(component: C, componentSettings: ComponentSettings<InferProps<C>, T> = {}) => {
    return (suiteOverrides: SuiteSettings<InferProps<C>, T> = {}) => {
      const extraArgs = toArray(suiteOverrides.extraArgs ?? componentSettings.extraArgs?.());
      const element = settings.providerHoc?.(...extraArgs)(component) ?? component;
      const mocks = [...toArray(componentSettings.mocks), ...toArray(suiteOverrides.mocks)];
      const passProps = {...componentSettings.passProps, ...suiteOverrides.passProps} as InferProps<C>;
      const spyModules = [...(settings.spyModules ?? []), ...(componentSettings.spyModules ?? []), ...(suiteOverrides.spyModules ?? [])];

      return new InfluntEngine(element, {passProps, mocks, spyModules}, extraArgs, settings.networkProxy);
    };
  };
}
