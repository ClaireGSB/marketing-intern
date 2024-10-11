// Utilities
import { defineStore } from 'pinia';
import { mockApiClient as apiClient } from '../services/mockApiClient';
import { api } from '../services/apiClient';
import * as FrontendTypes from '../types/frontendTypes';
import { type ContentType, contentTypesFrontEnd } from '../types/contentTypes';
import { actions, type ActionConfig } from '../types/actionTypes';

type State = {
  user: FrontendTypes.Users | null;
  contentTypes: ContentType[];
  actions: Record<string, ActionConfig>;
  contentSubTypes: FrontendTypes.ContentSubType[]; // Replace any with specific type if known
  examples: FrontendTypes.Example[];
  contentOutputs: FrontendTypes.ContentOutput[];
  validationsItems: FrontendTypes.Validations[];
  blogMetadata: FrontendTypes.BlogMetadata[];
  userID: number;
};

export const useUserDataStore = defineStore('userData', {
  state: (): State => ({
    user: null,
    contentTypes: contentTypesFrontEnd,
    actions: actions,
    contentSubTypes: [],
    examples: [],
    contentOutputs: [],
    blogMetadata: [],
    validationsItems: [],
    userID: 1
  }),
  actions: {
    async fetchUserData() {
      // Dummy data
      this.user = await apiClient.getUserBytId(1);
      this.contentSubTypes = await api.fetchContentSubtypes();
      this.examples = await api.fetchExamples();
      this.contentOutputs = await api.fetchContentOutputs();
      // to do: fetch validations & blogMetadata
      this.validationsItems = [];
      this.blogMetadata = [];
    },
    getContentOutputById(contentOutputID: number) {
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
    async updateValidationItem(validationItem: FrontendTypes.Validations) {
      // TO DO: uncomment this when the API is ready

      // --- to remove---
      // in the meantime, console log the updated item
      console.log('userStore updating validationItem:', validationItem);
      // dummy update in the local store
      this.validationsItems = this.validationsItems.map((item) => item.id === validationItem.id ? validationItem : item);
      // --- end of to remove---

      // const updatedValidationItem = await apiClient.updateValidationItem(validationItem);
      // const index = this.validationsItems.findIndex((item) => item.id === validationItem.id);
      // this.validationsItems[index] = updatedValidationItem;
    },
    async confirmValidations(contentOutputID: number) {
      // TO DO: uncomment this when the API is ready

      // --- to remove---
      // in the meantime, console log the updated item
      // dummy update in the local store
      this.validationsItems = this.validationsItems.map((item) => item.content_output_id === contentOutputID ? { ...item, validation_status: 'completed', content: item.options[item.selected_option] } : item);
      // update the content in the contentOutputs if output_step_type is final_content
      const contentOutput = this.contentOutputs.find((contentOutput) => contentOutput.id === contentOutputID);
      const finalContentValidationItem = this.validationsItems.find((item) => item.content_output_id === contentOutputID && item.step_output_type === 'final_content') ?? null;
      const finalContent = finalContentValidationItem ? finalContentValidationItem.options[finalContentValidationItem.selected_option] : '';
      if (contentOutput) {
        this.contentOutputs = this.contentOutputs.map((contentOutput) => contentOutput.id === contentOutputID ? { ...contentOutput, status: 'completed', content: finalContent } : contentOutput);
      }
      console.log('userStore updated validations:', this.validationsItems);
      console.log('userStore updated contentOutput:', this.contentOutputs.find((contentOutput) => contentOutput.id === contentOutputID));
      // --- end of to remove---

      // const updatedContentOutput = await apiClient.confirmValidations(contentOutputID);
      // const index = this.contentOutputs.findIndex((contentOutput) => contentOutput.id === contentOutputID);
      // this.contentOutputs[index] = updatedContentOutput;

      // ------ if contentType is blog_post_copy, then update the blogMetadata
      // if (updatedContentOutput.content_type_id === 8) {
      //   const blogMetadata = await apiClient.getBlogMetadataByContentOutputID(contentOutputID);
      //   const index = this.blogMetadata.findIndex((metadata) => metadata.content_output_id === contentOutputID);
      //   this.blogMetadata[index] = blogMetadata;
    },
    async requestContentGenerationFromAPI(userInput: FrontendTypes.UserInput): Promise<FrontendTypes.GeneratedContentResponse> {


      await api.createContentOutput(userInput);
      // TO DO: implement Poll for response from API

      // wait 3 secs to simulate server response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // simulated response
      const generatedResponse = {
        requiresValidation: true,
        contentOutput: {
          id: 3,
          created_by: 1,
          content_type_id: 1,
          content_subtype_id: 'abc',
          original_content_id: 1,
          version_number: 1,
          content: "",
          created_at: "2024-09-20T10:00:00Z",
          status: 'pending validation' as 'generating' | 'pending validation' | 'completed' | 'scheduled' | 'published' | 'failed',
          is_current_version: true,
        },
        validationData: [
          {
            id: 1,
            content_output_id: 1,
            step_output_type: "final_content",
            validation_status: "pending" as "pending" | "completed",
            options: {
              "1": "10 Ways to Boost Your Productivity",
              "2": "Unleash Your Productivity: 10 Game-Changing Strategies",
              "3": "Mastering Productivity: 10 Expert Tips for Success"
            },
            feedback: {},
            selected_option: '',
          },
          {
            id: 2,
            content_output_id: 1,
            step_output_type: "BM_title",
            validation_status: "pending" as "pending" | "completed",
            options: {
              "1": "9 Ways to Boost Your Efficiency",
              "2": "Unleash Your Efficiency: 9 Game-Changing Strategies",
              "3": "Mastering Efficiency: 9 Expert Tips for Success"
            },
            feedback: {},
            selected_option: '',
          }
        ],
      };
      // add contentOutput to contentOutputs in the local store
      this.contentOutputs.push(generatedResponse.contentOutput);
      // add each object in ValidationData to validationsItems in the local store
      generatedResponse.validationData.forEach((validationItem) => {
        this.validationsItems.push(validationItem);
      });
      console.log('validation items:', this.validationsItems);
      return generatedResponse;
    },
    getFinalContentForContentOutput(contentOutputID: number) {
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

