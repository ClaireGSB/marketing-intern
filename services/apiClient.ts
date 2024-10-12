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

  async initializeContentOutput(user_input: FrontendTypes.UserInput): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Creating content output in api client');
      const { data, error } = await useFetch<{ body: FrontendTypes.ContentOutput }>('/api/content-output/initialize', {
        method: 'POST',
        body: {
          ...user_input
        }
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

      console.log('Created content output:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error creating content output:', error);
      throw new Error('Error creating content output');
    }
  }

  async getContentOutputById(id: string): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Fetching content output by ID');
      const { data, error } = await useFetch<{ body: FrontendTypes.ContentOutput }>('/api/content-output/' + id);

      if (error.value) {
        console.log('Error in getContentOutputById ', error.value);
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
      console.error('Error fetching content output by ID:', error);
      throw new Error('Error fetching content output by ID');
    }
  }

  isContentOutputReady(contentOutput: FrontendTypes.ContentOutput): boolean {
    console.log('Checking if content output is ready');
    console.log('Content output status:', contentOutput.status);
    const ready = contentOutput.status === 'pending validation' || contentOutput.status === 'completed';
    console.log('Content output is ready:', ready);
    return ready;
  }

  async pollForContentOutput(id: string): Promise<FrontendTypes.ContentOutput> {
    // poll every 5 seconds until the content output is ready
    // return the content output
    let contentOutput = await this.getContentOutputById(id);
    console.log('Content output status:', contentOutput.status);
    let ready = this.isContentOutputReady(contentOutput);
    console.log('Content output is ready in poll for Content Output:', ready);
    while (!this.isContentOutputReady(contentOutput)) {
      console.log('Content output not ready yet, polling again in 1 second');
      await new Promise(resolve => setTimeout(resolve, 1000));
      contentOutput = await this.getContentOutputById(id);
    }
    console.log('Content output status:', contentOutput.status);
    console.log('Content output is ready:', contentOutput);
    return contentOutput;
  }

  async generateContentOutput(user_input: FrontendTypes.UserInput): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Generating content output');
      const contentOutput = await this.initializeContentOutput(user_input);
      return await this.pollForContentOutput(contentOutput.id);
    } catch (error) {
      console.error('Error generating content output:', error);
      throw new Error('Error generating content output');
    }
  }

  // ##############################
  // # Validations
  // ##############################

  // TO DO: add fetchALLValidations
  
  
  async fetchValidationsByContentOutput(contentOutputID: string): Promise<FrontendTypes.Validations[]> {
    try {
      console.log('Fetching validations');
      const { data, error } = await useFetch<{ body: FrontendTypes.Validations[] }>('/api/content-output/' + contentOutputID + '/validations');

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

      if (data.value.body.length === 0) {
        throw new Error('No validations found');
      }

      return data.value.body;
    }
    catch (error) {
      console.error('Error fetching validations:', error);
      throw new Error('Error fetching validations');
    }
  }

  async updateValidation(id: string, updates: Partial<FrontendTypes.Validations>): Promise<FrontendTypes.Validations> {
    try {
      console.log('Updating validation');
      const { data, error } = await useFetch<{ body: FrontendTypes.Validations }>('/api/validation/'+id+'/update', {
        method: 'POST',
        body: { ...updates }
      });

      if (error.value) {
        console.log('Error in updateValidation ', error.value);
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('Updated validation:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error updating validation:', error);
      throw new Error('Error updating validation');
    }
  }

  async confirmValidations(contentOutputID: string): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Confirming validations');
      const { data, error } = await useFetch<{ body: FrontendTypes.ContentOutput }>('/api/content-output/' + contentOutputID + '/confirm-validations', {
        method: 'POST'
      });

      if (error.value) {
        console.log('Error in confirmValidations ', error.value);
        throw createError({
          statusCode: error.value.statusCode,
          statusMessage: error.value.statusMessage
        });
      }

      if (!data.value) {
        throw new Error('No data received from the server');
      }

      console.log('updated Content Output:', data.value.body);
      return data.value.body;
    } catch (error) {
      console.error('Error confirming validations:', error);
      throw new Error('Error confirming validations');
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


