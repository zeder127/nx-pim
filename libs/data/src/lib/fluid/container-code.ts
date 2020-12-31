import { ContainerRuntimeFactoryWithDefaultDataStore } from '@fluidframework/aqueduct';
import { PiInstantiationFactory } from './pim.dataobject';

export const PiContainerFactory = new ContainerRuntimeFactoryWithDefaultDataStore(
  PiInstantiationFactory,
  new Map([PiInstantiationFactory.registryEntry])
);
