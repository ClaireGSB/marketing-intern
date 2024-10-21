// services/apiClient.ts

import * as FrontendTypes from '../types/frontendTypes';
import { FetchError } from 'ofetch';

class apiClient {

  private handleErrors(error: unknown, context: string): never {
    if (error instanceof FetchError) {
      console.error(`API Error in ${context}:`, error.data);
      if (error.status === 400) {
        throw new Error(error.data?.statusMessage || `Bad Request in ${context}`);
      } else if (error.status === 500) {
        throw new Error(error.data?.statusMessage || `Internal Server Error in ${context}`);
      } else {
        throw new Error(error.data?.statusMessage || `HTTP error in ${context}! status: ${error.status}`);
      }
    } else {
      console.error(`Error in ${context}:`, error);
      throw error instanceof Error ? error : new Error(`Unknown error in ${context}`);
    }
  }

  // ##############################
  // # Content Outputs
  // ##############################

  async fetchContentOutputs(): Promise<FrontendTypes.ContentOutput[]> {
    try {
      console.log('Fetching content outputs');
      const response = await $fetch('/api/content-output/get-by-org', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentOutput[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchContentOutputs');
    }
  }

  async initializeContentOutput(user_input: FrontendTypes.UserInput): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Creating content output in api client');
      const response = await $fetch('/api/content-output/initialize', {
        method: 'POST',
        body: user_input
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentOutput };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'initializeContentOutput');
    }
  }

  async getContentOutputById(id: string): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Fetching content output by ID');
      const response = await $fetch(`/api/content-output/${id}`);

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentOutput };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'getContentOutputById');
    }
  }

  isContentOutputReady(contentOutput: FrontendTypes.ContentOutput): boolean {
    console.log('Checking if content output is ready');
    console.log('Content output status:', contentOutput.status);
    const ready = contentOutput.status === 'pending validation' || contentOutput.status === 'completed' || contentOutput.status === 'failed';
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

  async fetchValidations(): Promise<FrontendTypes.Validations[]> {
    try {
      console.log('Fetching validations');
      const response = await $fetch('/api/validation/get-by-org', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Validations[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchValidations');
    }
  }


  async getValidationsByContentOutput(contentOutputID: string): Promise<FrontendTypes.Validations[]> {
    try {
      console.log('Fetching validations');
      const response = await $fetch(`/api/content-output/${contentOutputID}/validations`);

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Validations[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No validations found');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'getValidationsByContentOutput');
    }
  }

  async updateValidation(id: string, updates: Partial<FrontendTypes.Validations>): Promise<FrontendTypes.Validations> {
    try {
      console.log('Updating validation');
      const response = await $fetch(`/api/validation/${id}/update`, {
        method: 'POST',
        body: { ...updates }
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Validations };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'updateValidation');
    }
  }

  async confirmValidations(contentOutputID: string): Promise<FrontendTypes.ContentOutput> {
    try {
      console.log('Confirming validations');
      const response = await $fetch(`/api/content-output/${contentOutputID}/confirm-validations`, {
        method: 'POST'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentOutput };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'confirmValidations');
    }
  }


  // ##############################
  // # Content Subtypes
  // ##############################

  async fetchContentSubtypes(): Promise<FrontendTypes.ContentSubType[]> {
    try {
      console.log('Fetching content subtypes');
      const response = await $fetch('/api/content-subtype/get-by-org', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentSubType[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchContentSubtypes');
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

      const response = await $fetch('/api/content-subtype/create', {
        method: 'POST',
        body: contentSubtype
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentSubType };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'createContentSubtype');
    }
  }

  async updateContentSubtype(id: string, updates: Partial<FrontendTypes.ContentSubType>): Promise<FrontendTypes.ContentSubType> {
    try {
      console.log('Updating content subtype');
      const response = await $fetch('/api/content-subtype/update', {
        method: 'POST',
        body: { id, ...updates }
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.ContentSubType };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'updateContentSubtype');
    }
  }

  async deleteContentSubtype(id: string): Promise<void> {
    try {
      console.log('Deleting content subtype');
      const response = await $fetch('/api/content-subtype/delete', {
        method: 'POST',
        body: { id }
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      console.log('Content subtype deleted successfully');
    } catch (error) {
      this.handleErrors(error, 'deleteContentSubtype');
    }
  }

  // ##############################
  // # Examples
  // ##############################

  async fetchExamples(): Promise<FrontendTypes.Example[]> {
    try {
      console.log('Fetching examples');
      const response = await $fetch('/api/example/get-by-org', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Example[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchExamples');
    }
  }

  async createExample(example: Omit<FrontendTypes.Example, 'id'>): Promise<FrontendTypes.Example> {
    try {
      console.log('Creating example');
      const response = await $fetch('/api/example/create', {
        method: 'POST',
        body: example
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Example };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'createExample');
    }
  }

  async updateExample(id: string, updates: Partial<FrontendTypes.Example>): Promise<FrontendTypes.Example> {
    try {
      console.log('Updating example');
      const response = await $fetch('/api/example/update', {
        method: 'POST',
        body: { id, ...updates }
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Example };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'updateExample');
    }
  }

  async deleteExample(id: string): Promise<void> {
    try {
      console.log('Deleting example');
      const response = await $fetch('/api/example/delete', {
        method: 'POST',
        body: { id }
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      console.log('Example deleted successfully');
    } catch (error) {
      this.handleErrors(error, 'deleteExample');
    }
  }

  // ##############################
  // # Blog Metadata
  // ##############################

  async fetchBlogMetadatas(): Promise<FrontendTypes.BlogMetadata[]> {
    try {
      console.log('Fetching blog metadatas');
      const response = await $fetch('/api/blog-metadata/get-by-org', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.BlogMetadata[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchBlogMetadatas');
    }
  }

  async getBlogMetadataByContentOutputId(contentOutputID: string): Promise<FrontendTypes.BlogMetadata> {
    try {
      console.log('Fetching blog metadata by content output ID');
      const response = await $fetch(`/api/content-output/${contentOutputID}/blog-metadata`);

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.BlogMetadata };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'getBlogMetadataByContentOutputId');
    }
  }

  // ##############################
  // # Users
  // ##############################

  async fetchUsers(): Promise<FrontendTypes.Users[]> {
    try {
      console.log('Fetching users');
      const response = await $fetch('/api/user/get-by-org', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Users[] };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!Array.isArray(typedResponse.body)) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchUsers');
    }
  }

  async fetchUserID(): Promise<string> {
    try {
      console.log('Fetching userID');
      const response = await $fetch('/api/user/get-id', {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: string };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (typeof typedResponse.body !== 'string') {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchUserID');
    }
  }

  // ##############################
  // # Project Setups
  // ##############################

  async fetchProjectSetup(contentOutputID: string): Promise<FrontendTypes.UserInput> {
    try {
      console.log('Fetching project setup');
      const response = await $fetch(`/api/content-output/${contentOutputID}/project-setup`, {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.UserInput };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchProjectSetup');
    }
  }

  // ##############################
  // # Subtype Settings History
  // ##############################

  async fetchSubtypeSettingsHistory(contentOutputID: string): Promise<FrontendTypes.SettingsInput> {
    try {
      console.log('Fetching subtype settings history');
      const response = await $fetch(`/api/content-output/${contentOutputID}/subtype-settings-history`, {
        method: 'GET'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.SettingsInput };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    }
    catch (error) {
      this.handleErrors(error, 'fetchSubtypeSettingsHistory');
    }
  }

  // ##############################
  // # Campaigns
  // ##############################

  async createCampaign(campaign: Omit<FrontendTypes.Campaign, 'id'>): Promise<FrontendTypes.Campaign> {
    try {
      console.log('Creating campaign');
      const response = await $fetch('/api/campaign/create', {
        method: 'POST',
        body: campaign
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Campaign };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'createCampaign');
    }
  }

  async updateCampaign(id: string, updates: Partial<FrontendTypes.Campaign>): Promise<FrontendTypes.Campaign> {
    try {
      console.log('Updating campaign');
      const response = await $fetch(`/api/campaign/${id}/update`, {
        method: 'POST',
        body: { id, ...updates }
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response) || !('body' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number; body: FrontendTypes.Campaign };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      if (!typedResponse.body) {
        throw new Error('No data received from the server');
      }

      return typedResponse.body;
    } catch (error) {
      this.handleErrors(error, 'updateCampaign');
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      console.log('Deleting campaign');
      const response = await $fetch(`/api/campaign/${id}/delete`, {
        method: 'POST'
      });

      console.log('Response:', response);

      if (!response || typeof response !== 'object' || !('statusCode' in response)) {
        throw new Error('Unexpected response structure from API');
      }

      const typedResponse = response as { statusCode: number };

      if (![200, 201, 202, 204, 304].includes(typedResponse.statusCode)) {
        throw new Error(`API returned non-200 status code: ${typedResponse.statusCode}`);
      }

      console.log('Campaign deleted successfully');
    } catch (error) {
      this.handleErrors(error, 'deleteCampaign');
    }
  }

}

export const api = new apiClient();


