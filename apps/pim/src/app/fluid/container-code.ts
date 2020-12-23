import { ContainerRuntimeFactoryWithDefaultDataStore } from '@fluidframework/aqueduct';
import { PiInstantiationFactory } from './board.dataobject';

export const PiContainerFactory = new ContainerRuntimeFactoryWithDefaultDataStore(
  PiInstantiationFactory,
  new Map([PiInstantiationFactory.registryEntry])
);
