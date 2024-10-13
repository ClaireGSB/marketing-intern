// Utilities
import { defineStore } from 'pinia';
import { mockApiClient as apiClient } from '../services/mockApiClient';
import { api } from '../services/apiClient';
import * as FrontendTypes from '../types/frontendTypes';
import { type ContentType, contentTypesFrontEnd } from '../types/contentTypes';
import { actions, type ActionConfig } from '../types/actionTypes';

type State = {
  userID: string;
  users: FrontendTypes.Users[];
  contentTypes: ContentType[];
  actions: Record<string, ActionConfig>;
  contentSubTypes: FrontendTypes.ContentSubType[]; // Replace any with specific type if known
  examples: FrontendTypes.Example[];
  contentOutputs: FrontendTypes.ContentOutput[];
  validationsItems: FrontendTypes.Validations[];
  blogMetadata: FrontendTypes.BlogMetadata[];
};

export const useUserDataStore = defineStore('userData', {
  state: (): State => ({
    users: [],
    contentTypes: contentTypesFrontEnd,
    actions: actions,
    contentSubTypes: [],
    examples: [],
    contentOutputs: [],
    blogMetadata: [],
    validationsItems: [],
    userID: ''
  }),
  actions: {
    async fetchUserData() {
      // Dummy data
      this.userID = await api.fetchUserID();
      this.users = await api.fetchUsers();
      this.contentSubTypes = await api.fetchContentSubtypes();
      this.examples = await api.fetchExamples();
      this.contentOutputs = await api.fetchContentOutputs();
      // to do: fetch validations & blogMetadata
      this.validationsItems = await api.fetchValidations();
      this.blogMetadata = await api.fetchBlogMetadatas();
    },
    getContentOutputById(contentOutputID: string) {
      return this.contentOutputs.find((contentOutput) => contentOutput.id === contentOutputID);
    },
    async addExample(data: FrontendTypes.Example, contentSubtypeID: string) {
      // remove id from data (it was a temp local ID)
      const { id, ...dataWithoutId } = data;
      // add contentSubtypeID to data
      dataWithoutId.content_subtype_id = contentSubtypeID;
      const newExample = await api.createExample(dataWithoutId);
      console.log(newExample);
      this.examples.push(newExample);
      return newExample;
    },
    async updateExample(exampleID: string, data: Partial<FrontendTypes.Example>) {
      // remove id from data (we have it separately anyway)
      const { id, ...dataWithoutId } = data;
      const updatedExample = await api.updateExample(exampleID, dataWithoutId);
      const index = this.examples.findIndex((example) => example.id === updatedExample.id);
      this.examples[index] = updatedExample;
    },
    async deleteExample(exampleID: string) {
      await api.deleteExample(exampleID);
      this.examples = this.examples.filter((example) => example.id !== exampleID);
    },
    async updateContentSubType(contentSubTypeID: string, field: "target_audience" | "context" | "guidelines", content: string) {
      const update = { [field]: content };
      const updatedContentSubType = await api.updateContentSubtype(contentSubTypeID, update);
      // update the local store
      const index = this.contentSubTypes.findIndex((contentSubType) => contentSubType.id === updatedContentSubType.id);
      console.log(updatedContentSubType);
      this.contentSubTypes[index] = updatedContentSubType;
    },
    async createContentSubType(contentTypeId: number, name: string) {
      const newContentSubType = await api.createContentSubtype(name, contentTypeId);
      this.contentSubTypes.push(newContentSubType);
      console.log(newContentSubType);
      return newContentSubType;
    },
    getExamplesByContentSubTypeID(contentSubTypeID: string): FrontendTypes.Example[] {
      return this.examples
        .filter((example) => example.content_subtype_id === contentSubTypeID)
        .map((example) => ({
          id: example.id,
          content_subtype_id: example.content_subtype_id,
          name: example.name,
          example_type: example.example_type,
          explanation: example.explanation,
          content: example.content,
        }));
    },
    getTargetAudienceByContentSubTypeID(contentSubtypeID: string) {
      return this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubtypeID)?.target_audience ?? '';
    },
    getContentTypeNameById(contentTypeID: number) {
      return this.contentTypes.find((contentType) => contentType.id === contentTypeID)?.name ?? '';
    },
    getContentTypeDisplayNameById(contentTypeID: number) {
      return this.contentTypes.find((contentType) => contentType.id === contentTypeID)?.display_name ?? '';
    },
    getContentSubTypeNameById(contentSubTypeID: string) {
      return this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubTypeID)?.name ?? '';
    },
    getSubtypesForContentType(contentTypeID: number) {
      return this.contentSubTypes.filter((contentSubType) => contentSubType.content_type_id === contentTypeID);
    },
    getSubtypesIDsForContentType(contentTypeID: number) {
      return this.contentSubTypes.filter((contentSubType) => contentSubType.content_type_id === contentTypeID).map((contentSubType) => contentSubType.id);
    },
    getSubtypesIDsAndNamesForContentType(contentTypeID: number) {
      return this.contentSubTypes.filter((contentSubType) => contentSubType.content_type_id === contentTypeID).map((contentSubType) => ({ id: contentSubType.id, name: contentSubType.name }));
    },
    getFieldsForContentSubType(contentSubTypeID: string) {
      const context = this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubTypeID)?.context ?? '';
      const guidelines = this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubTypeID)?.guidelines ?? '';
      const examples = this.getExamplesByContentSubTypeID(contentSubTypeID);
      const target_audience = this.getTargetAudienceByContentSubTypeID(contentSubTypeID);
      return {
        context: context,
        guidelines: guidelines,
        examples: examples,
        target_audience: target_audience,
      };
    },
    fetchValidations(contentOutputID: string) {
      const validations = this.validationsItems.filter((validationItem) => validationItem.content_output_id === contentOutputID);
      console.log('userStore fetching validations:', validations);
      return validations;
    },
    async updateValidationItem(validationItem: FrontendTypes.Validations) {
      // TO DO: uncomment this when the API is ready
      validationItem.validation_status = 'completed';
      const updatedValidationItem = await api.updateValidation(validationItem.id, validationItem);
      console.log('userStore updating validationItem:', updatedValidationItem);

      const index = this.validationsItems.findIndex((item) => item.id === validationItem.id);
      this.validationsItems[index] = updatedValidationItem;
    },
    async confirmValidations(contentOutputID: string) {
      const updatedContentOutput = await api.confirmValidations(contentOutputID);
      const index = this.contentOutputs.findIndex((contentOutput) => contentOutput.id === contentOutputID);
      this.contentOutputs[index] = updatedContentOutput;

      // ------ if contentType is blog_post_copy, then update the blogMetadata
      // if (updatedContentOutput.content_type_id === 8) {
      //   const blogMetadata = await apiClient.getBlogMetadataByContentOutputID(contentOutputID);
      //   const index = this.blogMetadata.findIndex((metadata) => metadata.content_output_id === contentOutputID);
      //   this.blogMetadata[index] = blogMetadata;
    },
    async requestContentGenerationFromAPI(userInput: FrontendTypes.UserInput): Promise<FrontendTypes.GeneratedContentResponse> {

      //this initializes the contentOutput job and polls the server for the status of the job
      const newContentOutput = await api.generateContentOutput(userInput);
      this.contentOutputs.push(newContentOutput);

      let generatedResponse: FrontendTypes.GeneratedContentResponse;
      if (newContentOutput.status === 'pending validation') {
        console.log('getting validation items');
        const validations = await api.getValidationsByContentOutput(newContentOutput.id);
        validations.forEach((validationItem) => {
          this.validationsItems.push(validationItem);
        });
        generatedResponse = {
          requiresValidation: true,
          contentOutput: newContentOutput,
          validationData: validations,
        };
      } else {
        generatedResponse = {
          requiresValidation: false,
          contentOutput: newContentOutput,
          validationData: [],
        };
      }

      return generatedResponse;
    },
    getFinalContentForContentOutput(contentOutputID: string) {
      // return an array of object with this shape: id: string; title: string; content: string;
      // one of the object is the final content, the others are blog metadata if contentOutput is blog_post_copy
      const contentOutput = this.contentOutputs.find((contentOutput) => contentOutput.id === contentOutputID);
      if (!contentOutput) {
        return [];
      }
      const content = contentOutput.content;
      // if content type is blog_post_copy, then add the blog metadata
      if (contentOutput.content_type_id === 8) {
        const blogMetadata = this.blogMetadata.find((metadata) => metadata.content_output_id === contentOutputID);
        if (!blogMetadata) {
          return [{ id: 'content', title: 'Content', content: content }];
        }
        return [
          { id: 'content', title: 'Content', content: content },
          { id: 'title', title: 'Title', content: blogMetadata.title ?? '' },
          { id: 'meta_description', title: 'Meta Description', content: blogMetadata.meta_description },
        ];
      }
      return [{ id: 'content', title: 'Content', content: content }];
    }
  },
  getters: {
  },
});

