import { Injectable } from '@angular/core';
import { getDefaultObjectFromContainer } from '@fluidframework/aqueduct';
import { getTinyliciousContainer } from '@fluidframework/get-tinylicious-container';

@Injectable({ providedIn: 'root' })
export class FluidLoaderService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadDataObject<T>(factory: any, documentId: string, createNew: boolean) {
    // The getTinyliciousContainer helper function facilitates loading our container code into a Container and
    // connecting to a locally-running test service called Tinylicious.  This will look different when moving to a
    // production service, but ultimately we'll still be getting a reference to a Container object.
    // The helper function takes the ID of the document we're creating or loading, the container code to load into it, and a
    // flag to specify whether we're creating a new document or loading an existing one.
    const container = await getTinyliciousContainer(documentId, factory, createNew);

    // Get the Default Object from the Container
    return await getDefaultObjectFromContainer<T>(container);
  }
}
