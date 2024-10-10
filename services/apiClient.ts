// services/apiClient.ts

import * as FrontendTypes from '../types/frontendTypes';


class apiClient {


  // ##############################
  // # Content Outputs
  // ##############################

  async fetchContentOutputs(): Promise<FrontendTypes.ContentOutput[]> {
    try {
      console.log('Fetching content outputs');
      const { data, error } = await useFetch<{ body: FrontendTypes.ContentOutput[] }>('/api/content-output/get-by-org', {
        method: 'GET'
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('data:', data.value.body);
      return data.value.body;
    }
    catch (error) {
      console.error('Error fetching content outputs:', error);
      throw new Error('Error fetching content outputs');
    }
  }

  // ##############################
  // # Content Subtypes
  // ##############################

  async fetchContentSubtypes(): Promise<FrontendTypes.ContentSubType[]> {
    try {
      console.log('Fetching content outputs');
      const { data, error } = await useFetch<{ body: FrontendTypes.ContentSubType[] }>('/api/content-subtype/get-by-org', {
        method: 'GET'
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('data:', data.value.body);
      return data.value.body;
    }
    catch (error) {
      console.error('Error fetching content outputs:', error);
      throw new Error('Error fetching content outputs');
    }
  }

  async createContentSubtype(name: string, contentTypeId: number): Promise<FrontendTypes.ContentSubType> {
    try {
      console.log('Creating content subtype');
      const contentSubtype = {
        name: name,
        content_type_id: contentTypeId,
        context: null,
        guidelines: null,
        target_audience: null,
      };

      const { data, error } = await useFetch<{ body: FrontendTypes.ContentSubType }>('/api/content-subtype/create', {
        method: 'POST',
        body: contentSubtype
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('Created content subtype:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error creating content subtype:', error);
      throw new Error('Error creating content subtype');
    }
  }

  async updateContentSubtype(id: string, updates: Partial<FrontendTypes.ContentSubType>): Promise<FrontendTypes.ContentSubType> {
    try {
      console.log('Updating content subtype');
      const { data, error } = await useFetch<{ body: FrontendTypes.ContentSubType }>('/api/content-subtype/update', {
        method: 'POST',
        body: { id, ...updates }
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('Updated content subtype:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error updating content subtype:', error);
      throw new Error('Error updating content subtype');
    }
  }

  async deleteContentSubtype(id: string): Promise<void> {
    try {
      console.log('Deleting content subtype');
      const { error } = await useFetch('/api/content-subtype/delete', {
        method: 'POST',
        body: { id }
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      console.log('Content subtype deleted successfully');
    } catch (error) {
      console.error('Error deleting content subtype:', error);
      throw new Error('Error deleting content subtype');
    }
  }

  // ##############################
  // # Examples
  // ##############################

  async fetchExamples(): Promise<FrontendTypes.Example[]> {
    try {
      console.log('Fetching examples');
      const { data, error } = await useFetch<{ body: FrontendTypes.Example[] }>('/api/example/get-by-org', {
        method: 'GET'
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('data:', data.value.body);
      return data.value.body;
    }
    catch (error) {
      console.error('Error fetching examples:', error);
      throw new Error('Error fetching examples');
    }
  }

  async createExample(example: Omit<FrontendTypes.Example, 'id'>): Promise<FrontendTypes.Example> {
    try {
      console.log('Creating example');
      const { data, error } = await useFetch<{ body: FrontendTypes.Example }>('/api/example/create', {
        method: 'POST',
        body: example
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('Created example:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error creating example:', error);
      throw new Error('Error creating example');
    }
  }

  async updateExample(id: string, updates: Partial<FrontendTypes.Example>): Promise<FrontendTypes.Example> {
    try {
      console.log('Updating example');
      const { data, error } = await useFetch<{ body: FrontendTypes.Example }>('/api/example/update', {
        method: 'POST',
        body: { id, ...updates }
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('Updated example:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error updating example:', error);
      throw new Error('Error updating example');
    }
  }

  async deleteExample(id: string): Promise<void> {
    try {
      console.log('Deleting example');
      const { error } = await useFetch('/api/example/delete', {
        method: 'POST',
        body: { id }
      });

      if (error.value) {
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      console.log('Example deleted successfully');
    } catch (error) {
      console.error('Error deleting example:', error);
      throw new Error('Error deleting example');
    }
  }
}

export const api = new apiClient();


